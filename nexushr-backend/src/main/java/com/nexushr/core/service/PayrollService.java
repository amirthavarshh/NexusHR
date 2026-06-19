package com.nexushr.core.service;

import com.nexushr.core.model.*;
import com.nexushr.core.repository.EmployeeRepository;
import com.nexushr.core.repository.LeaveRequestRepository;
import com.nexushr.core.repository.PayrollRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
public class PayrollService {

    @Autowired
    private PayrollRepository payrollRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    public List<Payroll> runPayroll(LocalDate start, LocalDate end) {
        List<Employee> employees = employeeRepository.findAll();
        List<Payroll> results = new ArrayList<>();

        for (Employee employee : employees) {
            if (employee.getStatus() == EmployeeStatus.TERMINATED) {
                continue;
            }

            double basic = employee.getSalary();
            double allowances = Math.round(basic * 0.10 * 100.0) / 100.0; // 10% allowance

            // Calculate deductions based on UNPAID leaves approved during this pay period
            List<LeaveRequest> leaves = leaveRequestRepository.findByEmployee_Id(employee.getId());
            long unpaidDays = 0;
            for (LeaveRequest leave : leaves) {
                if (leave.getStatus() == LeaveStatus.APPROVED && leave.getType() == LeaveType.UNPAID) {
                    // Check intersection of leave dates with pay period
                    LocalDate overlapStart = leave.getStartDate().isBefore(start) ? start : leave.getStartDate();
                    LocalDate overlapEnd = leave.getEndDate().isAfter(end) ? end : leave.getEndDate();

                    if (!overlapStart.isAfter(overlapEnd)) {
                        unpaidDays += ChronoUnit.DAYS.between(overlapStart, overlapEnd) + 1;
                    }
                }
            }

            // Deduct salary per day (assuming 22 working days per month average)
            double dailyRate = basic / 22.0;
            double deductions = Math.round(dailyRate * unpaidDays * 100.0) / 100.0;
            double net = basic + allowances - deductions;

            Payroll payroll = Payroll.builder()
                    .employee(employee)
                    .payPeriodStart(start)
                    .payPeriodEnd(end)
                    .basicSalary(basic)
                    .allowances(allowances)
                    .deductions(deductions)
                    .netSalary(Math.max(0.0, Math.round(net * 100.0) / 100.0))
                    .status(PayrollStatus.DRAFT)
                    .build();

            results.add(payrollRepository.save(payroll));
        }

        return results;
    }

    public Payroll paySalary(Long id) {
        Payroll payroll = payrollRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Payroll statement not found"));
        payroll.setStatus(PayrollStatus.PAID);
        payroll.setProcessedAt(LocalDateTime.now());
        return payrollRepository.save(payroll);
    }

    public List<Payroll> getMyPayrolls(String username) {
        return payrollRepository.findByEmployee_User_Username(username);
    }

    public List<Payroll> getAllPayrolls() {
        return payrollRepository.findAll();
    }
}
