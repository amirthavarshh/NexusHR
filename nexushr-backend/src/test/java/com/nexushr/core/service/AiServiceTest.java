package com.nexushr.core.service;

import com.nexushr.core.model.*;
import com.nexushr.core.repository.AttendanceRepository;
import com.nexushr.core.repository.EmployeeRepository;
import com.nexushr.core.repository.LeaveRequestRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AiServiceTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private AttendanceRepository attendanceRepository;

    @Mock
    private LeaveRequestRepository leaveRequestRepository;

    @InjectMocks
    private AiService aiService;

    private Employee employee;

    @BeforeEach
    void setUp() {
        employee = new Employee();
        employee.setId(1L);
        employee.setFirstName("John");
        employee.setLastName("Doe");
        employee.setDepartment("IT");
        employee.setSalary(5000.0);
        employee.setPerformanceRating(4.5);
        employee.setStatus(EmployeeStatus.ACTIVE);
    }

    @Test
    void testPredictAttritionMinClamping() {
        // High salary, high performance (5.0), no late/absent, no unpaid leaves
        employee.setPerformanceRating(5.0);
        employee.setSalary(10000.0); // department average will be equal or lower

        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(attendanceRepository.findByEmployee_Id(1L)).thenReturn(new ArrayList<>());
        when(leaveRequestRepository.findByEmployee_Id(1L)).thenReturn(new ArrayList<>());
        when(employeeRepository.findByDepartment("IT")).thenReturn(Collections.singletonList(employee));

        Map<String, Object> result = aiService.predictAttrition(1L);

        assertNotNull(result);
        double riskScore = (Double) result.get("riskScore");
        // Risk math:
        // Base = 15.0
        // late/absent = 0 -> +0
        // performance = 5.0 (exceeds 4.0 by 1.0) -> subtract (1.0 * 10.0) = -10.0
        // unpaid leaves = 0 -> +0
        // underpaid = 0 -> +0
        // total before clamp = 15 - 10 = 5.0
        // Clamped: Max(5.0, Min(95.0, 5.0)) = 5.0
        assertEquals(5.0, riskScore, 0.01);
        assertEquals("LOW", result.get("riskCategory"));
    }

    @Test
    void testPredictAttritionMaxClamping() {
        // Poor performance, low salary compared to department, many late/absent, many unpaid leaves
        employee.setPerformanceRating(1.0);
        employee.setSalary(2000.0); // Underpaid compared to other IT members

        Employee richITMember = new Employee();
        richITMember.setId(2L);
        richITMember.setDepartment("IT");
        richITMember.setSalary(8000.0);

        List<Employee> dept = List.of(employee, richITMember);

        // 10 Late/Absent attendances
        List<Attendance> attendances = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            Attendance a = new Attendance();
            a.setStatus(AttendanceStatus.ABSENT);
            attendances.add(a);
        }

        // 5 Unpaid leaves
        List<LeaveRequest> leaves = new ArrayList<>();
        for (int i = 0; i < 5; i++) {
            LeaveRequest l = new LeaveRequest();
            l.setType(LeaveType.UNPAID);
            leaves.add(l);
        }

        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(attendanceRepository.findByEmployee_Id(1L)).thenReturn(attendances);
        when(leaveRequestRepository.findByEmployee_Id(1L)).thenReturn(leaves);
        when(employeeRepository.findByDepartment("IT")).thenReturn(dept);

        Map<String, Object> result = aiService.predictAttrition(1L);

        assertNotNull(result);
        double riskScore = (Double) result.get("riskScore");
        // Risk score should be clamped to max value of 95.0
        assertEquals(95.0, riskScore, 0.01);
        assertEquals("HIGH", result.get("riskCategory"));
    }

    @Test
    void testPredictAttritionWithNullPerformanceRating() {
        // Employee has no review yet (performanceRating = null)
        employee.setPerformanceRating(null);

        when(employeeRepository.findById(1L)).thenReturn(Optional.of(employee));
        when(attendanceRepository.findByEmployee_Id(1L)).thenReturn(new ArrayList<>());
        when(leaveRequestRepository.findByEmployee_Id(1L)).thenReturn(new ArrayList<>());
        when(employeeRepository.findByDepartment("IT")).thenReturn(Collections.singletonList(employee));

        Map<String, Object> result = assertDoesNotThrow(() -> aiService.predictAttrition(1L));

        assertNotNull(result);
        assertEquals(15.0, (Double) result.get("riskScore"), 0.01);
    }
}
