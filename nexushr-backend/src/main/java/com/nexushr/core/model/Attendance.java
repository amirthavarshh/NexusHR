package com.nexushr.core.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "attendance", indexes = {
    @Index(name = "idx_attendance_emp_date", columnList = "employee_id, date")
})
public class Attendance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(nullable = false)
    private LocalDate date;

    @Column(name = "clock_in")
    private LocalTime clockIn;

    @Column(name = "clock_out")
    private LocalTime clockOut;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AttendanceStatus status;

    // Constructors
    public Attendance() {}

    public Attendance(Long id, Employee employee, LocalDate date, LocalTime clockIn, LocalTime clockOut, AttendanceStatus status) {
        this.id = id;
        this.employee = employee;
        this.date = date;
        this.clockIn = clockIn;
        this.clockOut = clockOut;
        this.status = status;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Employee getEmployee() { return employee; }
    public void setEmployee(Employee employee) { this.employee = employee; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public LocalTime getClockIn() { return clockIn; }
    public void setClockIn(LocalTime clockIn) { this.clockIn = clockIn; }

    public LocalTime getClockOut() { return clockOut; }
    public void setClockOut(LocalTime clockOut) { this.clockOut = clockOut; }

    public AttendanceStatus getStatus() { return status; }
    public void setStatus(AttendanceStatus status) { this.status = status; }

    // Builder
    public static AttendanceBuilder builder() {
        return new AttendanceBuilder();
    }

    public static class AttendanceBuilder {
        private Long id;
        private Employee employee;
        private LocalDate date;
        private LocalTime clockIn;
        private LocalTime clockOut;
        private AttendanceStatus status;

        AttendanceBuilder() {}

        public AttendanceBuilder id(Long id) { this.id = id; return this; }
        public AttendanceBuilder employee(Employee employee) { this.employee = employee; return this; }
        public AttendanceBuilder date(LocalDate date) { this.date = date; return this; }
        public AttendanceBuilder clockIn(LocalTime clockIn) { this.clockIn = clockIn; return this; }
        public AttendanceBuilder clockOut(LocalTime clockOut) { this.clockOut = clockOut; return this; }
        public AttendanceBuilder status(AttendanceStatus status) { this.status = status; return this; }

        public Attendance build() {
            return new Attendance(id, employee, date, clockIn, clockOut, status);
        }
    }
}
