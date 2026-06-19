package com.nexushr.core.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "goals", indexes = {
    @Index(name = "idx_goal_employee", columnList = "employee_id")
})
public class Goal {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GoalStatus status;

    @Column(name = "target_date", nullable = false)
    private LocalDate targetDate;

    @Column(name = "created_at", nullable = false)
    private LocalDate createdAt;

    // Constructors
    public Goal() {}

    public Goal(Long id, Employee employee, String title, String description, GoalStatus status, LocalDate targetDate, LocalDate createdAt) {
        this.id = id;
        this.employee = employee;
        this.title = title;
        this.description = description;
        this.status = status;
        this.targetDate = targetDate;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Employee getEmployee() { return employee; }
    public void setEmployee(Employee employee) { this.employee = employee; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public GoalStatus getStatus() { return status; }
    public void setStatus(GoalStatus status) { this.status = status; }

    public LocalDate getTargetDate() { return targetDate; }
    public void setTargetDate(LocalDate targetDate) { this.targetDate = targetDate; }

    public LocalDate getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDate createdAt) { this.createdAt = createdAt; }

    // Builder
    public static GoalBuilder builder() {
        return new GoalBuilder();
    }

    public static class GoalBuilder {
        private Long id;
        private Employee employee;
        private String title;
        private String description;
        private GoalStatus status;
        private LocalDate targetDate;
        private LocalDate createdAt;

        GoalBuilder() {}

        public GoalBuilder id(Long id) { this.id = id; return this; }
        public GoalBuilder employee(Employee employee) { this.employee = employee; return this; }
        public GoalBuilder title(String title) { this.title = title; return this; }
        public GoalBuilder description(String description) { this.description = description; return this; }
        public GoalBuilder status(GoalStatus status) { this.status = status; return this; }
        public GoalBuilder targetDate(LocalDate targetDate) { this.targetDate = targetDate; return this; }
        public GoalBuilder createdAt(LocalDate createdAt) { this.createdAt = createdAt; return this; }

        public Goal build() {
            return new Goal(id, employee, title, description, status, targetDate, createdAt);
        }
    }
}
