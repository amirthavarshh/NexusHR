package com.nexushr.core.controller;

import com.nexushr.core.model.Employee;
import com.nexushr.core.model.Goal;
import com.nexushr.core.model.GoalStatus;
import com.nexushr.core.model.User;
import com.nexushr.core.repository.EmployeeRepository;
import com.nexushr.core.repository.GoalRepository;
import com.nexushr.core.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/goals")
@CrossOrigin(origins = "*", maxAge = 3600)
public class GoalController {

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN', 'HR')")
    public ResponseEntity<Goal> createGoal(@RequestBody Map<String, Object> payload, Authentication authentication) {
        if (!payload.containsKey("employeeId") || payload.get("employeeId") == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "employeeId is required");
        }
        if (!payload.containsKey("title") || payload.get("title") == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "title is required");
        }
        if (!payload.containsKey("targetDate") || payload.get("targetDate") == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "targetDate is required");
        }

        Long employeeId = Long.valueOf(payload.get("employeeId").toString());
        String title = payload.get("title").toString();
        String description = payload.get("description") != null ? payload.get("description").toString() : "";
        LocalDate targetDate = LocalDate.parse(payload.get("targetDate").toString());

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee not found"));

        if (authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_MANAGER")) &&
            authentication.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_HR"))) {
            if (employee.getManager() == null || !employee.getManager().getUser().getUsername().equals(authentication.getName())) {
                throw new org.springframework.security.access.AccessDeniedException("You can only assign goals to your direct reports");
            }
        }

        Goal goal = Goal.builder()
                .employee(employee)
                .title(title)
                .description(description)
                .status(GoalStatus.PENDING)
                .targetDate(targetDate)
                .createdAt(LocalDate.now())
                .build();

        return ResponseEntity.ok(goalRepository.save(goal));
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<Goal>> getEmployeeGoals(@PathVariable Long employeeId, Authentication authentication) {
        // Verification: Employees can only view their own goals. Managers/HR/Admin can view any.
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        if (user.getRole().name().equals("EMPLOYEE")) {
            Employee emp = employeeRepository.findByUser(user)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee profile not found"));
            if (!emp.getId().equals(employeeId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
            }
        } else if (user.getRole().name().equals("MANAGER")) {
            Employee targetEmp = employeeRepository.findById(employeeId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee not found"));
            if (targetEmp.getManager() == null || !targetEmp.getManager().getUser().getUsername().equals(authentication.getName())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied: Not the direct manager");
            }
        }

        return ResponseEntity.ok(goalRepository.findByEmployeeId(employeeId));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Goal> updateGoalStatus(@PathVariable Long id, @RequestBody Map<String, String> payload, Authentication authentication) {
        String statusStr = payload.get("status");
        GoalStatus newStatus;
        try {
            newStatus = GoalStatus.valueOf(statusStr.toUpperCase());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status value");
        }

        Goal goal = goalRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Goal not found"));

        // Verification: Employees can only update their own goals. Managers/HR/Admin can update any.
        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        if (user.getRole().name().equals("EMPLOYEE")) {
            Employee emp = employeeRepository.findByUser(user)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee profile not found"));
            if (!emp.getId().equals(goal.getEmployee().getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
            }
        } else if (user.getRole().name().equals("MANAGER")) {
            Employee targetEmp = goal.getEmployee();
            if (targetEmp.getManager() == null || !targetEmp.getManager().getUser().getUsername().equals(authentication.getName())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied: Not the direct manager");
            }
        }

        goal.setStatus(newStatus);
        return ResponseEntity.ok(goalRepository.save(goal));
    }
}
