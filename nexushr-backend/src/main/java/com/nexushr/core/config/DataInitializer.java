package com.nexushr.core.config;

import com.nexushr.core.model.*;
import com.nexushr.core.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @Autowired
    private PayrollRepository payrollRepository;

    @Autowired
    private PerformanceReviewRepository performanceReviewRepository;

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // 1. Create Users
        if (!userRepository.existsByUsername("admin")) {
            User adminUser = User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin123"))
                    .email("admin@nexushr.com")
                    .role(Role.ADMIN)
                    .build();
            userRepository.save(adminUser);
        }

        User managerUser = null;
        if (!userRepository.existsByUsername("manager")) {
            managerUser = User.builder()
                    .username("manager")
                    .password(passwordEncoder.encode("manager123"))
                    .email("sarah.connor@nexushr.com")
                    .role(Role.MANAGER)
                    .build();
            userRepository.save(managerUser);
        } else {
            managerUser = userRepository.findByUsername("manager").orElse(null);
        }

        User empUser1 = null;
        if (!userRepository.existsByUsername("alice")) {
            empUser1 = User.builder()
                    .username("alice")
                    .password(passwordEncoder.encode("employee123"))
                    .email("alice.smith@nexushr.com")
                    .role(Role.EMPLOYEE)
                    .build();
            userRepository.save(empUser1);
        } else {
            empUser1 = userRepository.findByUsername("alice").orElse(null);
        }

        User empUser2 = null;
        if (!userRepository.existsByUsername("bob")) {
            empUser2 = User.builder()
                    .username("bob")
                    .password(passwordEncoder.encode("employee123"))
                    .email("bob.johnson@nexushr.com")
                    .role(Role.EMPLOYEE)
                    .build();
            userRepository.save(empUser2);
        } else {
            empUser2 = userRepository.findByUsername("bob").orElse(null);
        }

        User hrUser = null;
        if (!userRepository.existsByUsername("hr")) {
            hrUser = User.builder()
                    .username("hr")
                    .password(passwordEncoder.encode("hr123"))
                    .email("hr@nexushr.com")
                    .role(Role.HR)
                    .build();
            userRepository.save(hrUser);
        } else {
            hrUser = userRepository.findByUsername("hr").orElse(null);
        }

        // 2. Create Employees
        Employee managerEmp = employeeRepository.findByEmail("sarah.connor@nexushr.com").orElse(null);
        if (managerEmp == null && managerUser != null) {
            managerEmp = Employee.builder()
                    .user(managerUser)
                    .firstName("Sarah")
                    .lastName("Connor")
                    .email("sarah.connor@nexushr.com")
                    .phone("+1 555-0199")
                    .department("Engineering")
                    .position("Director of Engineering")
                    .hireDate(LocalDate.of(2023, 1, 15))
                    .salary(11500.0)
                    .status(EmployeeStatus.ACTIVE)
                    .performanceRating(4.8)
                    .build();
            managerEmp = employeeRepository.save(managerEmp);
        }

        Employee aliceEmp = employeeRepository.findByEmail("alice.smith@nexushr.com").orElse(null);
        if (aliceEmp == null && empUser1 != null) {
            aliceEmp = Employee.builder()
                    .user(empUser1)
                    .firstName("Alice")
                    .lastName("Smith")
                    .email("alice.smith@nexushr.com")
                    .phone("+1 555-0122")
                    .department("Engineering")
                    .position("Senior Java Engineer")
                    .hireDate(LocalDate.of(2024, 3, 10))
                    .salary(7800.0)
                    .status(EmployeeStatus.ACTIVE)
                    .performanceRating(4.2)
                    .build();
            aliceEmp = employeeRepository.save(aliceEmp);
        }

        Employee bobEmp = employeeRepository.findByEmail("bob.johnson@nexushr.com").orElse(null);
        if (bobEmp == null && empUser2 != null) {
            bobEmp = Employee.builder()
                    .user(empUser2)
                    .firstName("Bob")
                    .lastName("Johnson")
                    .email("bob.johnson@nexushr.com")
                    .phone("+1 555-0144")
                    .department("Engineering")
                    .position("Junior QA Tester")
                    .hireDate(LocalDate.of(2025, 8, 1))
                    .salary(3800.0)
                    .status(EmployeeStatus.ACTIVE)
                    .performanceRating(2.3)
                    .build();
            bobEmp = employeeRepository.save(bobEmp);
        }

        Employee hrEmp = employeeRepository.findByEmail("jessica.day@nexushr.com").orElse(null);
        if (hrEmp == null && hrUser != null) {
            hrEmp = Employee.builder()
                    .user(hrUser)
                    .firstName("Jessica")
                    .lastName("Day")
                    .email("jessica.day@nexushr.com")
                    .phone("+1 555-0155")
                    .department("HR")
                    .position("HR Director")
                    .hireDate(LocalDate.of(2024, 6, 1))
                    .salary(6500.0)
                    .status(EmployeeStatus.ACTIVE)
                    .performanceRating(4.5)
                    .build();
            hrEmp = employeeRepository.save(hrEmp);
        }

        // 3. Create Attendance Logs
        if (attendanceRepository.count() == 0) {
            LocalDate yesterday = LocalDate.now().minusDays(1);
            LocalDate twoDaysAgo = LocalDate.now().minusDays(2);

            // Alice logs (Ideal employee: Present on-time)
            attendanceRepository.save(Attendance.builder()
                    .employee(aliceEmp)
                    .date(twoDaysAgo)
                    .clockIn(LocalTime.of(8, 55))
                    .clockOut(LocalTime.of(17, 30))
                    .status(AttendanceStatus.PRESENT)
                    .build());
            attendanceRepository.save(Attendance.builder()
                    .employee(aliceEmp)
                    .date(yesterday)
                    .clockIn(LocalTime.of(8, 48))
                    .clockOut(LocalTime.of(17, 00))
                    .status(AttendanceStatus.PRESENT)
                    .build());

            // Bob logs (Flight risk: Late arrivals and absences)
            attendanceRepository.save(Attendance.builder()
                    .employee(bobEmp)
                    .date(twoDaysAgo)
                    .clockIn(LocalTime.of(9, 45)) // LATE (shift starts 9am, threshold 9:15)
                    .clockOut(LocalTime.of(17, 10))
                    .status(AttendanceStatus.LATE)
                    .build());
            attendanceRepository.save(Attendance.builder()
                    .employee(bobEmp)
                    .date(yesterday)
                    .clockIn(LocalTime.of(10, 05)) // LATE
                    .clockOut(LocalTime.of(16, 45))
                    .status(AttendanceStatus.LATE)
                    .build());
        }

        // 4. Create Leaves
        if (leaveRequestRepository.count() == 0) {
            leaveRequestRepository.save(LeaveRequest.builder()
                    .employee(aliceEmp)
                    .startDate(LocalDate.now().plusWeeks(2))
                    .endDate(LocalDate.now().plusWeeks(2).plusDays(4))
                    .reason("Family summer trip")
                    .type(LeaveType.ANNUAL)
                    .status(LeaveStatus.APPROVED)
                    .approvedBy("manager")
                    .build());

            leaveRequestRepository.save(LeaveRequest.builder()
                    .employee(bobEmp)
                    .startDate(LocalDate.now().plusDays(5))
                    .endDate(LocalDate.now().plusDays(6))
                    .reason("Medical emergency")
                    .type(LeaveType.SICK)
                    .status(LeaveStatus.PENDING)
                    .build());

            // Bob has unpaid leave which will trigger payroll deduction
            leaveRequestRepository.save(LeaveRequest.builder()
                    .employee(bobEmp)
                    .startDate(LocalDate.now().minusWeeks(2))
                    .endDate(LocalDate.now().minusWeeks(2).plusDays(2))
                    .reason("Personal urgent matters")
                    .type(LeaveType.UNPAID)
                    .status(LeaveStatus.APPROVED)
                    .approvedBy("manager")
                    .build());
        }

        // 5. Create Performance Reviews
        if (performanceReviewRepository.count() == 0) {
            performanceReviewRepository.save(PerformanceReview.builder()
                    .employee(aliceEmp)
                    .reviewer(managerUser)
                    .reviewDate(LocalDate.now().minusMonths(3))
                    .rating(4.2)
                    .feedback("Alice maintains excellent quality in code reviews and has helped drive our spring security configurations. Keep it up!")
                    .goals("Lead the microservices architecture planning in Q3.")
                    .build());

            performanceReviewRepository.save(PerformanceReview.builder()
                    .employee(bobEmp)
                    .reviewer(managerUser)
                    .reviewDate(LocalDate.now().minusMonths(1))
                    .rating(2.3)
                    .feedback("Bob has missed several deadlines and late clock-ins are affecting sprint velocity. Needs support in QA test automation scripts.")
                    .goals("Complete basic Java training and achieve 90% test coverage target next cycle.")
                    .build());
        }

        // 6. Create Payroll History
        if (payrollRepository.count() == 0) {
            payrollRepository.save(Payroll.builder()
                    .employee(aliceEmp)
                    .payPeriodStart(LocalDate.now().minusMonths(1).withDayOfMonth(1))
                    .payPeriodEnd(LocalDate.now().minusMonths(1).withDayOfMonth(28))
                    .basicSalary(7800.0)
                    .allowances(780.0)
                    .deductions(0.0)
                    .netSalary(8580.0)
                    .status(PayrollStatus.PAID)
                    .processedAt(LocalDateTime.now().minusWeeks(2))
                    .build());

            // Bob has unpaid leaves, so his pay period deductions will be calculated
            payrollRepository.save(Payroll.builder()
                    .employee(bobEmp)
                    .payPeriodStart(LocalDate.now().minusMonths(1).withDayOfMonth(1))
                    .payPeriodEnd(LocalDate.now().minusMonths(1).withDayOfMonth(28))
                    .basicSalary(3800.0)
                    .allowances(380.0)
                    .deductions(518.18) // Deductions for 3 unpaid leave days
                    .netSalary(3661.82)
                    .status(PayrollStatus.PAID)
                    .processedAt(LocalDateTime.now().minusWeeks(2))
                    .build());
        }

        // 7. Create Goals
        if (goalRepository.count() == 0) {
            goalRepository.save(Goal.builder()
                    .employee(aliceEmp)
                    .title("Kubernetes Migration")
                    .description("Migrate local services to a Dockerized Minikube orchestration cluster.")
                    .status(GoalStatus.IN_PROGRESS)
                    .targetDate(LocalDate.now().plusMonths(2))
                    .createdAt(LocalDate.now())
                    .build());

            goalRepository.save(Goal.builder()
                    .employee(bobEmp)
                    .title("Java Automation Frameworks")
                    .description("Complete introductory Selenium and JUnit automation certification coursework.")
                    .status(GoalStatus.PENDING)
                    .targetDate(LocalDate.now().plusMonths(1))
                    .createdAt(LocalDate.now())
                    .build());
        }
    }
}
