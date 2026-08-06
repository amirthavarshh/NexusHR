package com.nexushr.core.service;

import com.nexushr.core.model.Employee;
import com.nexushr.core.model.EmployeeStatus;
import com.nexushr.core.repository.EmployeeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class EmployeeServiceTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @InjectMocks
    private EmployeeService employeeService;

    private Employee existingEmployee;

    @BeforeEach
    void setUp() {
        existingEmployee = new Employee();
        existingEmployee.setId(1L);
        existingEmployee.setFirstName("Alice");
        existingEmployee.setLastName("Smith");
        existingEmployee.setEmail("alice@nexushr.com");
        existingEmployee.setPhone("12345678");
        existingEmployee.setDepartment("Engineering");
        existingEmployee.setPosition("Developer");
        existingEmployee.setSalary(5000.0);
        existingEmployee.setStatus(EmployeeStatus.ACTIVE);
        existingEmployee.setPerformanceRating(4.0);
    }

    @Test
    void testUpdateEmployeeNonPrivilegedCall() {
        Employee updateReq = new Employee();
        updateReq.setFirstName("Bob");
        updateReq.setLastName("Jones");
        updateReq.setEmail("bob@nexushr.com");
        updateReq.setPhone("87654321");
        
        // Try to update privileged fields (should be ignored)
        updateReq.setDepartment("Marketing");
        updateReq.setSalary(8000.0);
        updateReq.setPosition("Director");

        when(employeeRepository.findById(1L)).thenReturn(Optional.of(existingEmployee));
        when(employeeRepository.save(any(Employee.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Employee result = employeeService.updateEmployee(1L, updateReq, false);

        assertNotNull(result);
        assertEquals("Bob", result.getFirstName());
        assertEquals("Jones", result.getLastName());
        assertEquals("bob@nexushr.com", result.getEmail());
        assertEquals("87654321", result.getPhone());
        
        // Privileged fields must NOT change
        assertEquals("Engineering", result.getDepartment());
        assertEquals(5000.0, result.getSalary());
        assertEquals("Developer", result.getPosition());
    }

    @Test
    void testUpdateEmployeePrivilegedCall() {
        Employee updateReq = new Employee();
        updateReq.setFirstName("Bob");
        updateReq.setDepartment("Marketing");
        updateReq.setSalary(8000.0);
        updateReq.setPosition("Director");
        updateReq.setStatus(EmployeeStatus.ACTIVE);

        when(employeeRepository.findById(1L)).thenReturn(Optional.of(existingEmployee));
        when(employeeRepository.save(any(Employee.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Employee result = employeeService.updateEmployee(1L, updateReq, true);

        assertNotNull(result);
        assertEquals("Bob", result.getFirstName());
        assertEquals("Marketing", result.getDepartment());
        assertEquals(8000.0, result.getSalary());
        assertEquals("Director", result.getPosition());
    }
}
