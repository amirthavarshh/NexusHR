package com.nexushr.core.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "payroll", indexes = {
    @Index(name = "idx_payroll_emp", columnList = "employee_id")
})
public class Payroll {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "pay_period_start", nullable = false)
    private LocalDate payPeriodStart;

    @Column(name = "pay_period_end", nullable = false)
    private LocalDate payPeriodEnd;

    @Column(name = "basic_salary", nullable = false)
    private Double basicSalary;

    private Double allowances;

    private Double deductions;

    @Column(name = "net_salary", nullable = false)
    private Double netSalary;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PayrollStatus status;

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    // Constructors
    public Payroll() {}

    public Payroll(Long id, Employee employee, LocalDate payPeriodStart, LocalDate payPeriodEnd, Double basicSalary, 
                   Double allowances, Double deductions, Double netSalary, PayrollStatus status, LocalDateTime processedAt) {
        this.id = id;
        this.employee = employee;
        this.payPeriodStart = payPeriodStart;
        this.payPeriodEnd = payPeriodEnd;
        this.basicSalary = basicSalary;
        this.allowances = allowances;
        this.deductions = deductions;
        this.netSalary = netSalary;
        this.status = status;
        this.processedAt = processedAt;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Employee getEmployee() { return employee; }
    public void setEmployee(Employee employee) { this.employee = employee; }

    public LocalDate getPayPeriodStart() { return payPeriodStart; }
    public void setPayPeriodStart(LocalDate payPeriodStart) { this.payPeriodStart = payPeriodStart; }

    public LocalDate getPayPeriodEnd() { return payPeriodEnd; }
    public void setPayPeriodEnd(LocalDate payPeriodEnd) { this.payPeriodEnd = payPeriodEnd; }

    public Double getBasicSalary() { return basicSalary; }
    public void setBasicSalary(Double basicSalary) { this.basicSalary = basicSalary; }

    public Double getAllowances() { return allowances; }
    public void setAllowances(Double allowances) { this.allowances = allowances; }

    public Double getDeductions() { return deductions; }
    public void setDeductions(Double deductions) { this.deductions = deductions; }

    public Double getNetSalary() { return netSalary; }
    public void setNetSalary(Double netSalary) { this.netSalary = netSalary; }

    public PayrollStatus getStatus() { return status; }
    public void setStatus(PayrollStatus status) { this.status = status; }

    public LocalDateTime getProcessedAt() { return processedAt; }
    public void setProcessedAt(LocalDateTime processedAt) { this.processedAt = processedAt; }

    // Builder
    public static PayrollBuilder builder() {
        return new PayrollBuilder();
    }

    public static class PayrollBuilder {
        private Long id;
        private Employee employee;
        private LocalDate payPeriodStart;
        private LocalDate payPeriodEnd;
        private Double basicSalary;
        private Double allowances;
        private Double deductions;
        private Double netSalary;
        private PayrollStatus status;
        private LocalDateTime processedAt;

        PayrollBuilder() {}

        public PayrollBuilder id(Long id) { this.id = id; return this; }
        public PayrollBuilder employee(Employee employee) { this.employee = employee; return this; }
        public PayrollBuilder payPeriodStart(LocalDate payPeriodStart) { this.payPeriodStart = payPeriodStart; return this; }
        public PayrollBuilder payPeriodEnd(LocalDate payPeriodEnd) { this.payPeriodEnd = payPeriodEnd; return this; }
        public PayrollBuilder basicSalary(Double basicSalary) { this.basicSalary = basicSalary; return this; }
        public PayrollBuilder allowances(Double allowances) { this.allowances = allowances; return this; }
        public PayrollBuilder deductions(Double deductions) { this.deductions = deductions; return this; }
        public PayrollBuilder netSalary(Double netSalary) { this.netSalary = netSalary; return this; }
        public PayrollBuilder status(PayrollStatus status) { this.status = status; return this; }
        public PayrollBuilder processedAt(LocalDateTime processedAt) { this.processedAt = processedAt; return this; }

        public Payroll build() {
            return new Payroll(id, employee, payPeriodStart, payPeriodEnd, basicSalary, allowances, deductions, netSalary, status, processedAt);
        }
    }
}
