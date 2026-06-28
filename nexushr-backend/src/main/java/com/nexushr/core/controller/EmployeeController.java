package com.nexushr.core.controller;

import com.nexushr.core.model.Employee;
import com.nexushr.core.service.EmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/employees")
@CrossOrigin(origins = "*", maxAge = 3600)
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;

    @PostMapping
    public ResponseEntity<Employee> createEmployee(
            @RequestBody Employee employee,
            @RequestParam(required = false) String username,
            Authentication authentication) {
        String targetUsername = username;
        if (targetUsername == null || targetUsername.trim().isEmpty()) {
            targetUsername = authentication.getName();
        } else {
            // Check if caller is MANAGER, ADMIN, or HR
            boolean isPrivileged = authentication.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_MANAGER") ||
                                   a.getAuthority().equals("ROLE_ADMIN") ||
                                   a.getAuthority().equals("ROLE_HR"));
            if (!isPrivileged) {
                return ResponseEntity.status(403).build(); // Forbidden
            }
        }
        return ResponseEntity.ok(employeeService.createEmployee(employee, targetUsername));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN', 'HR')")
    public ResponseEntity<List<Employee>> getAllEmployees() {
        return ResponseEntity.ok(employeeService.getAllEmployees());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Employee> getEmployeeById(@PathVariable Long id) {
        return ResponseEntity.ok(employeeService.getEmployeeById(id));
    }

    @GetMapping("/me")
    public ResponseEntity<Employee> getMyProfile(Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(employeeService.getEmployeeByUsername(username));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Employee> updateEmployee(@PathVariable Long id, @RequestBody Employee employee) {
        return ResponseEntity.ok(employeeService.updateEmployee(id, employee));
    }

    @GetMapping("/metrics")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN', 'HR')")
    public ResponseEntity<Map<String, Object>> getWorkforceMetrics() {
        return ResponseEntity.ok(employeeService.getWorkforceMetrics());
    }
}
