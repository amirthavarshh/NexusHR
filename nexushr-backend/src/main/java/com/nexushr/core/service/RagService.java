package com.nexushr.core.service;

import com.nexushr.core.model.KnowledgeChunk;
import com.nexushr.core.repository.KnowledgeChunkRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Core RAG pipeline service.
 *
 * Flow:
 *  1. Embed the user question → query vector
 *  2. Score all KnowledgeChunks via cosine similarity → top-K chunks
 *  3. Build a safety-scoped prompt (policy context + optional personal data)
 *  4. Call Hugging Face chat endpoint → LLM answer
 *  5. Return {answer, sources, timestamp}
 *
 * Role scoping:
 *  - EMPLOYEE  — only sees their own personal context
 *  - MANAGER   — sees their own context; team summaries by request
 *  - HR/ADMIN  — org-wide aggregate stats only (no raw PII)
 */
@Service
public class RagService {

    private static final Logger log = LoggerFactory.getLogger(RagService.class);

    private static final int TOP_K = 3;

    private static final String SYSTEM_PROMPT =
        "You are NexusHR Assistant, an intelligent HR helper embedded in the NexusHR platform. " +
        "Your role is to answer questions about HR policies and personal HR information for the logged-in user. " +
        "\n\nCRITICAL RULES:\n" +
        "1. Answer ONLY from the Context Chunks provided below. Do not invent facts.\n" +
        "2. If the context does not contain the answer, say: \"I don't have that information. Please contact your HR team directly.\"\n" +
        "3. NEVER reveal data about other employees — salary, reviews, attendance, or leave records.\n" +
        "4. Do NOT approve, reject, or perform any action on leave, payroll, or goals — always direct the user to the relevant portal page.\n" +
        "5. Be concise, professional, and friendly. Use bullet points for multi-step answers.\n\n";

    @Autowired
    private KnowledgeChunkRepository knowledgeChunkRepository;

    @Autowired
    private EmbeddingService embeddingService;

    private final String hfApiKey;
    private final String hfModel;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient;

    public RagService() {
        String key = System.getenv("HF_API_KEY");
        if (key == null || key.isBlank()) key = System.getenv("HUGGINGFACE_API_KEY");
        this.hfApiKey = (key != null && !key.isBlank()) ? key : null;
        String model = System.getenv("HF_MODEL");
        this.hfModel = (model != null && !model.isBlank()) ? model : "Qwen/Qwen2.5-7B-Instruct";
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(15))
                .build();
    }

    // ── Public API ────────────────────────────────────────────────────────────

    /**
     * Run the full RAG pipeline.
     *
     * @param question       The user's message
     * @param personalContext Pre-built personal data string (leave balance, attendance etc.) — may be empty
     * @param userRole       "EMPLOYEE", "MANAGER", "HR", "ADMIN"
     * @param username       Logged-in username for logging / audit
     */
    public Map<String, Object> answer(String question, String personalContext, String userRole, String username) {

        // 1. Retrieve top-K relevant knowledge chunks
        List<KnowledgeChunk> topChunks = retrieveTopK(question, TOP_K);
        List<String> sources = topChunks.stream().map(KnowledgeChunk::getTitle).collect(Collectors.toList());

        // 2. Build full prompt
        String prompt = buildPrompt(question, topChunks, personalContext, userRole);

        // 3. Generate answer (LLM or rule-based fallback)
        String answer = generateAnswer(prompt, question, topChunks);

        log.info("RAG chat: user={} role={} question='{}' sources={}", username, userRole, question, sources);

        return Map.of(
            "answer", answer,
            "sources", sources,
            "timestamp", java.time.Instant.now().toString()
        );
    }

    // ── Retrieval ─────────────────────────────────────────────────────────────

    private List<KnowledgeChunk> retrieveTopK(String question, int k) {
        List<KnowledgeChunk> allChunks = knowledgeChunkRepository.findAll();
        if (allChunks.isEmpty()) return List.of();

        float[] queryVec = embeddingService.embed(question);

        return allChunks.stream()
            .map(chunk -> {
                double score;
                if (chunk.getEmbedding() != null && chunk.getEmbedding().length > 0 && queryVec.length > 0) {
                    score = embeddingService.cosineSimilarity(queryVec, chunk.getEmbedding());
                } else {
                    // Keyword overlap fallback
                    score = keywordOverlap(question, chunk.getContent());
                }
                return new AbstractMap.SimpleEntry<>(chunk, score);
            })
            .sorted(Map.Entry.<KnowledgeChunk, Double>comparingByValue().reversed())
            .limit(k)
            .filter(e -> e.getValue() > 0.05) // discard zero-relevance chunks
            .map(Map.Entry::getKey)
            .collect(Collectors.toList());
    }

    /** Simple keyword overlap score: #matching tokens / total unique tokens in question */
    private double keywordOverlap(String question, String content) {
        Set<String> qTokens = tokenise(question);
        Set<String> cTokens = tokenise(content);
        if (qTokens.isEmpty()) return 0.0;
        long matches = qTokens.stream().filter(cTokens::contains).count();
        return (double) matches / qTokens.size();
    }

    private Set<String> tokenise(String text) {
        return Arrays.stream(text.toLowerCase().replaceAll("[^a-z0-9 ]", " ").split("\\s+"))
                     .filter(t -> t.length() > 2)
                     .collect(Collectors.toSet());
    }

    // ── Prompt construction ───────────────────────────────────────────────────

    private String buildPrompt(String question, List<KnowledgeChunk> chunks,
                               String personalContext, String userRole) {
        StringBuilder sb = new StringBuilder();
        sb.append(SYSTEM_PROMPT);

        // Context chunks
        if (!chunks.isEmpty()) {
            sb.append("Context Chunks:\n");
            for (int i = 0; i < chunks.size(); i++) {
                KnowledgeChunk c = chunks.get(i);
                sb.append(String.format("[%d] %s\n%s\n\n", i + 1, c.getTitle(), c.getContent()));
            }
        } else {
            sb.append("Context Chunks: (none relevant found)\n\n");
        }

        // Personal data context (scoped — never includes other employees' data)
        if (personalContext != null && !personalContext.isBlank()) {
            sb.append("Personal HR Data (for the logged-in user only):\n");
            sb.append(personalContext).append("\n\n");
        }

        sb.append("User Question: ").append(question);
        return sb.toString();
    }

    // ── LLM call / fallback ───────────────────────────────────────────────────

    private String generateAnswer(String prompt, String question, List<KnowledgeChunk> chunks) {
        if (hfApiKey != null) {
            try {
                return callHuggingFaceChat(prompt);
            } catch (Exception e) {
                log.warn("HF chat API failed, using rule-based answer: {}", e.getMessage());
            }
        }
        // Rule-based fallback: summarise the top chunk content if we have it
        return buildFallbackAnswer(question, chunks);
    }

    private String callHuggingFaceChat(String prompt) throws Exception {
        Map<String, Object> payload = Map.of(
            "model", hfModel,
            "messages", List.of(Map.of("role", "user", "content", prompt)),
            "temperature", 0.2,
            "max_tokens", 400
        );
        String jsonBody = objectMapper.writeValueAsString(payload);

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("https://api-inference.huggingface.co/v1/chat/completions"))
            .timeout(Duration.ofSeconds(35))
            .header("Content-Type", "application/json")
            .header("Authorization", "Bearer " + hfApiKey)
            .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
            .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() == 200) {
            JsonNode root = objectMapper.readTree(response.body());
            JsonNode choices = root.path("choices");
            if (choices.isArray() && choices.size() > 0) {
                return choices.get(0).path("message").path("content").asText();
            }
        }
        throw new RuntimeException("HF chat API error: status " + response.statusCode());
    }

    private String buildFallbackAnswer(String question, List<KnowledgeChunk> chunks) {
        if (chunks.isEmpty()) {
            return "I don't have information on that topic yet. Please contact your HR team or check the relevant portal page for details.";
        }
        KnowledgeChunk best = chunks.get(0);
        return "Based on NexusHR policy (" + best.getTitle() + "):\n\n" + best.getContent() +
               "\n\nFor more details, please visit the relevant section in your portal or contact HR directly.";
    }
}
