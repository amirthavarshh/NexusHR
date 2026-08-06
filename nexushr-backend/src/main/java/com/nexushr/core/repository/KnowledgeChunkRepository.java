package com.nexushr.core.repository;

import com.nexushr.core.model.KnowledgeChunk;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KnowledgeChunkRepository extends JpaRepository<KnowledgeChunk, Long> {

    /** Retrieve all chunks belonging to a given topic namespace. */
    List<KnowledgeChunk> findByTopic(String topic);

    /** Check whether the table has been seeded already. */
    boolean existsByTopic(String topic);
}
