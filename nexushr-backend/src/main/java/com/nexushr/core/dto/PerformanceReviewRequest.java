package com.nexushr.core.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class PerformanceReviewRequest {
    @NotNull(message = "Employee ID is required")
    private Long employeeId;

    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must be at most 5")
    private Double rating;

    @NotBlank(message = "Feedback is required")
    private String feedback;

    @NotBlank(message = "Goals are required")
    private String goals;

    // Constructors
    public PerformanceReviewRequest() {}

    public PerformanceReviewRequest(Long employeeId, Double rating, String feedback, String goals) {
        this.employeeId = employeeId;
        this.rating = rating;
        this.feedback = feedback;
        this.goals = goals;
    }

    // Getters and Setters
    public Long getEmployeeId() { return employeeId; }
    public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }

    public String getGoals() { return goals; }
    public void setGoals(String goals) { this.goals = goals; }
}
