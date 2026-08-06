package com.nexushr.core.model;

import com.nexushr.core.model.converter.FloatArrayConverter;
import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Represents a single "chunk" of HR knowledge that can be retrieved by the RAG
 * chatbot.  Each chunk stores a short section of policy text along with its
 * vector embedding so that semantically similar questions can be matched to
 * relevant chunks at query time.
 *
 * Embeddings are stored as a JSON-serialised float[] in a TEXT column via
 * {@link FloatArrayConverter} — no pgvector extension required.
 */
@Entity
@Table(name = "knowledge_chunks", indexes = {
        @Index(name = "idx_knowledge_topic", columnList = "topic")
})
public class KnowledgeChunk {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Category / namespace, e.g. "leave_policy", "payroll_rules" */
    @Column(nullable = false, length = 100)
    private String topic;

    /** Short descriptive title shown to users as a "source" citation */
    @Column(nullable = false, length = 200)
    private String title;

    /** The actual policy text (up to ~2 000 characters per chunk) */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    /**
     * Vector embedding of {@code content} produced by an embedding model.
     * Stored as a comma-separated JSON array string via FloatArrayConverter.
     * Empty when no embedding API key is configured — keyword fallback is used.
     */
    @Convert(converter = FloatArrayConverter.class)
    @Column(columnDefinition = "TEXT")
    private float[] embedding;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }

    // ── Constructors ──────────────────────────────────────────────────────────

    public KnowledgeChunk() {}

    public KnowledgeChunk(String topic, String title, String content) {
        this.topic = topic;
        this.title = title;
        this.content = content;
        this.embedding = new float[0];
    }

    // ── Getters / Setters ─────────────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public float[] getEmbedding() { return embedding; }
    public void setEmbedding(float[] embedding) { this.embedding = embedding; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
