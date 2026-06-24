package com.nexushr.core.service;

import com.nexushr.core.model.Employee;
import com.nexushr.core.model.EmployeeStatus;
import com.nexushr.core.model.User;
import com.nexushr.core.repository.EmployeeRepository;
import com.nexushr.core.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.nexushr.core.model.Role;

@Service
public class EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public Employee createEmployee(Employee employee, String username) {
        User user = userRepository.findByUsername(username)
                .orElseGet(() -> {
                    User newUser = User.builder()
                            .username(username)
                            .password(passwordEncoder.encode("password123"))
                            .email(employee.getEmail())
                            .role(Role.EMPLOYEE)
                            .build();
                    return userRepository.save(newUser);
                });

        if (employeeRepository.findByUser(user).isPresent()) {
            throw new IllegalArgumentException("Employee profile already exists for this user account");
        }

        employee.setUser(user);
        employee.setStatus(EmployeeStatus.ACTIVE);
        
        if (employee.getManager() != null && employee.getManager().getId() != null) {
            Employee manager = getEmployeeById(employee.getManager().getId());
            employee.setManager(manager);
        } else {
            employee.setManager(null);
        }
        
        if (employee.getPerformanceRating() == null) {
            employee.setPerformanceRating(3.0); // Neutral default rating
        }
        if (employee.getHireDate() == null) {
            employee.setHireDate(java.time.LocalDate.now());
        }
        return employeeRepository.save(employee);
    }

    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    public Employee getEmployeeById(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found with id: " + id));
    }

    public Employee getEmployeeByUsername(String username) {
        return employeeRepository.findByUser_Username(username)
                .orElseThrow(() -> new IllegalArgumentException("Employee profile not found for user: " + username));
    }

    public Employee updateEmployee(Long id, Employee updatedEmployee) {
        Employee employee = getEmployeeById(id);
        employee.setFirstName(updatedEmployee.getFirstName());
        employee.setLastName(updatedEmployee.getLastName());
        employee.setEmail(updatedEmployee.getEmail());
        employee.setPhone(updatedEmployee.getPhone());
        employee.setDepartment(updatedEmployee.getDepartment());
        employee.setPosition(updatedEmployee.getPosition());
        employee.setSalary(updatedEmployee.getSalary());
        
        if (updatedEmployee.getManager() != null && updatedEmployee.getManager().getId() != null) {
            Employee manager = getEmployeeById(updatedEmployee.getManager().getId());
            employee.setManager(manager);
        } else {
            employee.setManager(null);
        }
        if (updatedEmployee.getStatus() != null) {
            employee.setStatus(updatedEmployee.getStatus());
        }
        if (updatedEmployee.getPerformanceRating() != null) {
            employee.setPerformanceRating(updatedEmployee.getPerformanceRating());
        }
        return employeeRepository.save(employee);
    }

    public Map<String, Object> getWorkforceMetrics() {
        List<Employee> employees = employeeRepository.findAll();
        
        long totalEmployees = employees.size();
        double avgSalary = employees.stream()
                .mapToDouble(Employee::getSalary)
                .average()
                .orElse(0.0);

        double avgPerformance = employees.stream()
                .mapToDouble(Employee::getPerformanceRating)
                .average()
                .orElse(0.0);

        Map<String, Long> departmentDistribution = employees.stream()
                .collect(Collectors.groupingBy(Employee::getDepartment, Collectors.counting()));

        return Map.of(
                "totalEmployees", totalEmployees,
                "averageSalary", avgSalary,
                "averagePerformance", avgPerformance,
                "departmentDistribution", departmentDistribution
        );
    }

    public List<Employee> getTeammates(Long managerId) {
        return employeeRepository.findByManager_Id(managerId);
    }

    public void deleteEmployee(Long id) {
        Employee employee = getEmployeeById(id);
        employee.setStatus(EmployeeStatus.TERMINATED);
        employeeRepository.save(employee);
    }
}
