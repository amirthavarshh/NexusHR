package com.nexushr.core.service;

import com.nexushr.core.model.*;
import com.nexushr.core.repository.EmployeeRepository;
import com.nexushr.core.repository.LeaveRequestRepository;
import com.nexushr.core.repository.PayrollRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PayrollServiceTest {

    @Mock
    private PayrollRepository payrollRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private LeaveRequestRepository leaveRequestRepository;

    @InjectMocks
    private PayrollService payrollService;

    private Employee employee;

    @BeforeEach
    void setUp() {
        employee = new Employee();
        employee.setId(1L);
        employee.setFirstName("Alice");
        employee.setSalary(4400.0); // 4400 / 22 = 200 per day standard rate
        employee.setStatus(EmployeeStatus.ACTIVE);
    }

    @Test
    void testRunPayrollStandardMonth() {
        // May 1 to May 31, 2026 (21 weekdays in May 2026, let's verify weekdays)
        // May 1 is Friday. May 31 is Sunday.
        // Let's count weekdays in May 2026:
        // May 1 (1), May 4-8 (5), May 11-15 (5), May 18-22 (5), May 25-29 (5) = 21 weekdays.
        LocalDate start = LocalDate.of(2026, 5, 1);
        LocalDate end = LocalDate.of(2026, 5, 31);

        when(employeeRepository.findAll()).thenReturn(Collections.singletonList(employee));
        when(leaveRequestRepository.findByEmployee_Id(1L)).thenReturn(new ArrayList<>());
        when(payrollRepository.save(any(Payroll.class))).thenAnswer(invocation -> invocation.getArgument(0));

        List<Payroll> results = payrollService.runPayroll(start, end);

        assertNotNull(results);
        assertEquals(1, results.size());
        Payroll payroll = results.get(0);
        
        // periodWorkingDays = 21 weekdays.
        // proRatedBasic = basic * 21 / 22 = 4400 * 21 / 22 = 4200.0
        assertEquals(4200.0, payroll.getBasicSalary(), 0.01);
        assertEquals(420.0, payroll.getAllowances(), 0.01); // 10% of 4200
        assertEquals(0.0, payroll.getDeductions(), 0.01);
        assertEquals(4620.0, payroll.getNetSalary(), 0.01); // 4200 + 420
    }

    @Test
    void testRunPayrollShortPeriodWithUnpaidLeaveDeduction() {
        // Short 2-week period (10 weekdays)
        // June 1 to June 12, 2026 (10 weekdays)
        LocalDate start = LocalDate.of(2026, 6, 1);
        LocalDate end = LocalDate.of(2026, 6, 12);

        // Mock 2 unpaid leave days inside this period
        LeaveRequest leave = new LeaveRequest();
        leave.setStatus(LeaveStatus.APPROVED);
        leave.setType(LeaveType.UNPAID);
        leave.setStartDate(LocalDate.of(2026, 6, 3));
        leave.setEndDate(LocalDate.of(2026, 6, 4));

        when(employeeRepository.findAll()).thenReturn(Collections.singletonList(employee));
        when(leaveRequestRepository.findByEmployee_Id(1L)).thenReturn(Collections.singletonList(leave));
        when(payrollRepository.save(any(Payroll.class))).thenAnswer(invocation -> invocation.getArgument(0));

        List<Payroll> results = payrollService.runPayroll(start, end);

        assertNotNull(results);
        assertEquals(1, results.size());
        Payroll payroll = results.get(0);

        // periodWorkingDays = 10.
        // proRatedBasic = basic * 10 / 22 = 4400 * 10 / 22 = 2000.0
        // dailyRate = basic / 10 = 4400 / 10 = 440.0 per day
        // deductions = dailyRate * 2 unpaid days = 440 * 2 = 880.0
        // allowances = 10% of 2000 = 200.0
        // net = 2000 + 200 - 880 = 1320.0
        assertEquals(2000.0, payroll.getBasicSalary(), 0.01);
        assertEquals(200.0, payroll.getAllowances(), 0.01);
        assertEquals(880.0, payroll.getDeductions(), 0.01);
        assertEquals(1320.0, payroll.getNetSalary(), 0.01);
    }
}
