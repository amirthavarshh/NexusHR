package com.nexushr.core.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "performance_reviews", indexes = {
    @Index(name = "idx_review_emp", columnList = "employee_id")
})
public class PerformanceReview {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "reviewer_id", nullable = false)
    private User reviewer;

    @Column(name = "review_date", nullable = false)
    private LocalDate reviewDate;

    @Column(nullable = false)
    private Double rating;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    @Column(columnDefinition = "TEXT")
    private String goals;

    // Constructors
    public PerformanceReview() {}

    public PerformanceReview(Long id, Employee employee, User reviewer, LocalDate reviewDate, Double rating, String feedback, String goals) {
        this.id = id;
        this.employee = employee;
        this.reviewer = reviewer;
        this.reviewDate = reviewDate;
        this.rating = rating;
        this.feedback = feedback;
        this.goals = goals;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Employee getEmployee() { return employee; }
    public void setEmployee(Employee employee) { this.employee = employee; }

    public User getReviewer() { return reviewer; }
    public void setReviewer(User reviewer) { this.reviewer = reviewer; }

    public LocalDate getReviewDate() { return reviewDate; }
    public void setReviewDate(LocalDate reviewDate) { this.reviewDate = reviewDate; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }

    public String getGoals() { return goals; }
    public void setGoals(String goals) { this.goals = goals; }

    // Builder
    public static PerformanceReviewBuilder builder() {
        return new PerformanceReviewBuilder();
    }

    public static class PerformanceReviewBuilder {
        private Long id;
        private Employee employee;
        private User reviewer;
        private LocalDate reviewDate;
        private Double rating;
        private String feedback;
        private String goals;

        PerformanceReviewBuilder() {}

        public PerformanceReviewBuilder id(Long id) { this.id = id; return this; }
        public PerformanceReviewBuilder employee(Employee employee) { this.employee = employee; return this; }
        public PerformanceReviewBuilder reviewer(User reviewer) { this.reviewer = reviewer; return this; }
        public PerformanceReviewBuilder reviewDate(LocalDate reviewDate) { this.reviewDate = reviewDate; return this; }
        public PerformanceReviewBuilder rating(Double rating) { this.rating = rating; return this; }
        public PerformanceReviewBuilder feedback(String feedback) { this.feedback = feedback; return this; }
        public PerformanceReviewBuilder goals(String goals) { this.goals = goals; return this; }

        public PerformanceReview build() {
            return new PerformanceReview(id, employee, reviewer, reviewDate, rating, feedback, goals);
        }
    }
}
