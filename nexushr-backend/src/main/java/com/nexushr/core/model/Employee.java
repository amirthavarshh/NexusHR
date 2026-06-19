package com.nexushr.core.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "employees", indexes = {
    @Index(name = "idx_employee_dept", columnList = "department"),
    @Index(name = "idx_employee_user", columnList = "user_id")
})
public class Employee {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(unique = true, nullable = false)
    private String email;

    private String phone;

    @Column(nullable = false)
    private String department;

    @Column(nullable = false)
    private String position;

    @Column(name = "hire_date", nullable = false)
    private LocalDate hireDate;

    @Column(nullable = false)
    private Double salary;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EmployeeStatus status;

    @Column(name = "performance_rating")
    private Double performanceRating;

    // Constructors
    public Employee() {}

    public Employee(Long id, User user, String firstName, String lastName, String email, String phone, 
                    String department, String position, LocalDate hireDate, Double salary, 
                    EmployeeStatus status, Double performanceRating) {
        this.id = id;
        this.user = user;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phone = phone;
        this.department = department;
        this.position = position;
        this.hireDate = hireDate;
        this.salary = salary;
        this.status = status;
        this.performanceRating = performanceRating;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }

    public LocalDate getHireDate() { return hireDate; }
    public void setHireDate(LocalDate hireDate) { this.hireDate = hireDate; }

    public Double getSalary() { return salary; }
    public void setSalary(Double salary) { this.salary = salary; }

    public EmployeeStatus getStatus() { return status; }
    public void setStatus(EmployeeStatus status) { this.status = status; }

    public Double getPerformanceRating() { return performanceRating; }
    public void setPerformanceRating(Double performanceRating) { this.performanceRating = performanceRating; }

    // Builder
    public static EmployeeBuilder builder() {
        return new EmployeeBuilder();
    }

    public static class EmployeeBuilder {
        private Long id;
        private User user;
        private String firstName;
        private String lastName;
        private String email;
        private String phone;
        private String department;
        private String position;
        private LocalDate hireDate;
        private Double salary;
        private EmployeeStatus status;
        private Double performanceRating;

        EmployeeBuilder() {}

        public EmployeeBuilder id(Long id) { this.id = id; return this; }
        public EmployeeBuilder user(User user) { this.user = user; return this; }
        public EmployeeBuilder firstName(String firstName) { this.firstName = firstName; return this; }
        public EmployeeBuilder lastName(String lastName) { this.lastName = lastName; return this; }
        public EmployeeBuilder email(String email) { this.email = email; return this; }
        public EmployeeBuilder phone(String phone) { this.phone = phone; return this; }
        public EmployeeBuilder department(String department) { this.department = department; return this; }
        public EmployeeBuilder position(String position) { this.position = position; return this; }
        public EmployeeBuilder hireDate(LocalDate hireDate) { this.hireDate = hireDate; return this; }
        public EmployeeBuilder salary(Double salary) { this.salary = salary; return this; }
        public EmployeeBuilder status(EmployeeStatus status) { this.status = status; return this; }
        public EmployeeBuilder performanceRating(Double performanceRating) { this.performanceRating = performanceRating; return this; }

        public Employee build() {
            return new Employee(id, user, firstName, lastName, email, phone, department, position, hireDate, salary, status, performanceRating);
        }
    }
}
