package com.nexushr.core.dto;

import com.nexushr.core.model.AudienceType;
import com.nexushr.core.model.Priority;
import java.time.LocalDateTime;

public class AnnouncementDTO {
    private Long id;
    private String title;
    private String description;
    private AudienceType targetAudience;
    private Priority priority;
    private Long createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime expiryDate;
    private boolean isActive;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public AudienceType getTargetAudience() { return targetAudience; }
    public void setTargetAudience(AudienceType targetAudience) { this.targetAudience = targetAudience; }

    public Priority getPriority() { return priority; }
    public void setPriority(Priority priority) { this.priority = priority; }

    public Long getCreatedBy() { return createdBy; }
    public void setCreatedBy(Long createdBy) { this.createdBy = createdBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDateTime expiryDate) { this.expiryDate = expiryDate; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
}
