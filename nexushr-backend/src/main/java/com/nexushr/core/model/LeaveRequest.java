package com.nexushr.core.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "leave_requests", indexes = {
    @Index(name = "idx_leave_emp", columnList = "employee_id"),
    @Index(name = "idx_leave_status", columnList = "status")
})
public class LeaveRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(nullable = false)
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LeaveType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private LeaveStatus status;

    @Column(name = "approved_by")
    private String approvedBy;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Constructors
    public LeaveRequest() {}

    public LeaveRequest(Long id, Employee employee, LocalDate startDate, LocalDate endDate, String reason, 
                        LeaveType type, LeaveStatus status, String approvedBy, LocalDateTime createdAt) {
        this.id = id;
        this.employee = employee;
        this.startDate = startDate;
        this.endDate = endDate;
        this.reason = reason;
        this.type = type;
        this.status = status;
        this.approvedBy = approvedBy;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Employee getEmployee() { return employee; }
    public void setEmployee(Employee employee) { this.employee = employee; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public LeaveType getType() { return type; }
    public void setType(LeaveType type) { this.type = type; }

    public LeaveStatus getStatus() { return status; }
    public void setStatus(LeaveStatus status) { this.status = status; }

    public String getApprovedBy() { return approvedBy; }
    public void setApprovedBy(String approvedBy) { this.approvedBy = approvedBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // Builder
    public static LeaveRequestBuilder builder() {
        return new LeaveRequestBuilder();
    }

    public static class LeaveRequestBuilder {
        private Long id;
        private Employee employee;
        private LocalDate startDate;
        private LocalDate endDate;
        private String reason;
        private LeaveType type;
        private LeaveStatus status;
        private String approvedBy;
        private LocalDateTime createdAt;

        LeaveRequestBuilder() {}

        public LeaveRequestBuilder id(Long id) { this.id = id; return this; }
        public LeaveRequestBuilder employee(Employee employee) { this.employee = employee; return this; }
        public LeaveRequestBuilder startDate(LocalDate startDate) { this.startDate = startDate; return this; }
        public LeaveRequestBuilder endDate(LocalDate endDate) { this.endDate = endDate; return this; }
        public LeaveRequestBuilder reason(String reason) { this.reason = reason; return this; }
        public LeaveRequestBuilder type(LeaveType type) { this.type = type; return this; }
        public LeaveRequestBuilder status(LeaveStatus status) { this.status = status; return this; }
        public LeaveRequestBuilder approvedBy(String approvedBy) { this.approvedBy = approvedBy; return this; }
        public LeaveRequestBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public LeaveRequest build() {
            return new LeaveRequest(id, employee, startDate, endDate, reason, type, status, approvedBy, createdAt);
        }
    }
}
