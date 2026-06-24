package com.nexushr.core.repository;

import com.nexushr.core.model.Announcement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    List<Announcement> findByIsActiveOrderByCreatedAtDesc(boolean isActive);
    List<Announcement> findByIsActiveAndExpiryDateAfterOrderByCreatedAtDesc(boolean isActive, LocalDateTime now);
    List<Announcement> findByIsActiveAndExpiryDateIsNullOrderByCreatedAtDesc(boolean isActive);
}
