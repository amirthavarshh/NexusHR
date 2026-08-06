package com.nexushr.core.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Map;

/**
 * Generates vector embeddings for text using the Hugging Face Inference API
 * (sentence-transformers/all-MiniLM-L6-v2).
 *
 * When no HF_API_KEY is present (or the API call fails), falls back to
 * a lightweight keyword-frequency vector so the chatbot still works in demo
 * mode without any external API.
 */
@Service
public class EmbeddingService {

    private static final Logger log = LoggerFactory.getLogger(EmbeddingService.class);

    private static final String HF_EMBED_URL =
            "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2";

    // 384-dimension model output
    private static final int EMBED_DIM = 384;

    private final String hfApiKey;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient;

    public EmbeddingService() {
        String key = System.getenv("HF_API_KEY");
        if (key == null || key.isBlank()) key = System.getenv("HUGGINGFACE_API_KEY");
        this.hfApiKey = (key != null && !key.isBlank()) ? key : null;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(15))
                .build();
    }

    // ── Public API ────────────────────────────────────────────────────────────

    /**
     * Embed a single text string.  Returns a float[] of EMBED_DIM dimensions.
     * Falls back to keyword vector on any failure.
     */
    public float[] embed(String text) {
        if (text == null || text.isBlank()) return new float[EMBED_DIM];
        if (hfApiKey != null) {
            try {
                return embedViaHuggingFace(text);
            } catch (Exception e) {
                log.warn("HF embedding call failed, using keyword fallback: {}", e.getMessage());
            }
        }
        return keywordVector(text);
    }

    /**
     * Cosine similarity between two float vectors.
     * Returns 0.0 if either vector is zero-length or empty.
     */
    public double cosineSimilarity(float[] a, float[] b) {
        if (a == null || b == null || a.length == 0 || b.length == 0) return 0.0;
        int len = Math.min(a.length, b.length);
        double dot = 0, normA = 0, normB = 0;
        for (int i = 0; i < len; i++) {
            dot += (double) a[i] * b[i];
            normA += (double) a[i] * a[i];
            normB += (double) b[i] * b[i];
        }
        if (normA == 0 || normB == 0) return 0.0;
        return dot / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private float[] embedViaHuggingFace(String text) throws Exception {
        // HF feature-extraction expects: {"inputs": "..."}
        String jsonBody = objectMapper.writeValueAsString(Map.of("inputs", text));

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(HF_EMBED_URL))
                .timeout(Duration.ofSeconds(30))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + hfApiKey)
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() != 200) {
            throw new RuntimeException("HF embed API returned " + response.statusCode());
        }

        // Response is a nested JSON array: [[f1, f2, ...]] (batch of 1)
        JsonNode root = objectMapper.readTree(response.body());
        JsonNode vector = root;
        // Unwrap batch dimension if present
        if (root.isArray() && root.size() > 0 && root.get(0).isArray()) {
            vector = root.get(0);
        }

        float[] result = new float[vector.size()];
        for (int i = 0; i < vector.size(); i++) {
            result[i] = (float) vector.get(i).asDouble();
        }
        return result;
    }

    /**
     * Keyword-frequency fallback embedding.
     *
     * Tokenises the text, hashes each token into a fixed 384-dim bucket, and
     * accumulates TF counts.  The result is L2-normalised so cosine similarity
     * still works correctly.  Not as accurate as a real embedding model but
     * sufficient for keyword-based retrieval in demo mode.
     */
    private float[] keywordVector(String text) {
        float[] vec = new float[EMBED_DIM];
        String[] tokens = text.toLowerCase()
                .replaceAll("[^a-z0-9 ]", " ")
                .split("\\s+");
        for (String token : tokens) {
            if (token.isBlank()) continue;
            int bucket = Math.abs(token.hashCode()) % EMBED_DIM;
            vec[bucket] += 1.0f;
        }
        // L2 normalise
        double norm = 0;
        for (float v : vec) norm += v * v;
        if (norm > 0) {
            norm = Math.sqrt(norm);
            for (int i = 0; i < vec.length; i++) vec[i] /= norm;
        }
        return vec;
    }
}
