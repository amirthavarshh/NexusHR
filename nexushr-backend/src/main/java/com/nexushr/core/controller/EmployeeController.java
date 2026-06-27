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
    public ResponseEntity<Employee> createEmployee(@RequestBody Employee employee,
            @RequestParam(required = false) String username,
            Authentication authentication) {
        String callerUsername = authentication.getName();
        String targetUsername = (username != null && !username.trim().isEmpty()) ? username : callerUsername;

        if (!targetUsername.equals(callerUsername)) {
            boolean isPrivileged = authentication.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")
                            || a.getAuthority().equals("ROLE_HR")
                            || a.getAuthority().equals("ROLE_MANAGER"));
            if (!isPrivileged) {
                throw new org.springframework.security.access.AccessDeniedException(
                        "You cannot create an employee profile for another user");
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
    public ResponseEntity<Employee> getEmployeeById(@PathVariable Long id, Authentication authentication) {
        boolean isPrivileged = authentication.getAuthorities().stream()
                .anyMatch(a -> List.of("ROLE_ADMIN", "ROLE_HR", "ROLE_MANAGER").contains(a.getAuthority()));

        if (!isPrivileged) {
            Employee self = employeeService.getEmployeeByUsername(authentication.getName());
            if (!self.getId().equals(id)) {
                throw new org.springframework.security.access.AccessDeniedException("Access denied");
            }
        }
        return ResponseEntity.ok(employeeService.getEmployeeById(id));
    }

    @GetMapping("/me")
    public ResponseEntity<Employee> getMyProfile(Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(employeeService.getEmployeeByUsername(username));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    public ResponseEntity<Employee> updateEmployee(@PathVariable Long id, @RequestBody Employee employee, Authentication authentication) {
        if (authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_MANAGER")) &&
            authentication.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_HR"))) {
            Employee targetEmp = employeeService.getEmployeeById(id);
            if (targetEmp.getManager() == null || !targetEmp.getManager().getUser().getUsername().equals(authentication.getName())) {
                throw new org.springframework.security.access.AccessDeniedException("You can only update your direct reports");
            }
        }
        return ResponseEntity.ok(employeeService.updateEmployee(id, employee));
    }

    @GetMapping("/metrics")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN', 'HR')")
    public ResponseEntity<Map<String, Object>> getWorkforceMetrics() {
        return ResponseEntity.ok(employeeService.getWorkforceMetrics());
    }

    @GetMapping("/manager/{id}/teammates")
    public ResponseEntity<List<Employee>> getTeammates(@PathVariable Long id, Authentication authentication) {
        boolean isPrivileged = authentication.getAuthorities().stream()
                .anyMatch(a -> List.of("ROLE_ADMIN", "ROLE_HR").contains(a.getAuthority()));
        
        if (!isPrivileged) {
            Employee emp = employeeService.getEmployeeByUsername(authentication.getName());
            if (!emp.getId().equals(id)) {
                throw new org.springframework.security.access.AccessDeniedException("Access denied");
            }
        }
        return ResponseEntity.ok(employeeService.getTeammates(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN', 'HR')")
    public ResponseEntity<Void> deleteEmployee(@PathVariable Long id, Authentication authentication) {
        if (authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_MANAGER")) &&
            authentication.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_HR"))) {
            Employee targetEmp = employeeService.getEmployeeById(id);
            if (targetEmp.getManager() == null || !targetEmp.getManager().getUser().getUsername().equals(authentication.getName())) {
                throw new org.springframework.security.access.AccessDeniedException("You can only delete your direct reports");
            }
        }
        employeeService.deleteEmployee(id);
        return ResponseEntity.noContent().build();
    }
}
