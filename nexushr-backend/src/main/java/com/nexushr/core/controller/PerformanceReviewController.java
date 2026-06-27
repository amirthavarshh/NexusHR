package com.nexushr.core.controller;

import com.nexushr.core.dto.PerformanceReviewRequest;
import com.nexushr.core.model.Employee;
import com.nexushr.core.model.PerformanceReview;
import com.nexushr.core.model.User;
import com.nexushr.core.repository.EmployeeRepository;
import com.nexushr.core.repository.UserRepository;
import com.nexushr.core.service.PerformanceReviewService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/reviews")
@CrossOrigin(origins = "*", maxAge = 3600)
public class PerformanceReviewController {

    @Autowired
    private PerformanceReviewService reviewService;

    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN', 'HR')")
    public ResponseEntity<PerformanceReview> createReview(
            @Valid @RequestBody PerformanceReviewRequest request,
            Authentication authentication) {
        String reviewerUsername = authentication.getName();
        
        if (authentication.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_MANAGER")) &&
            authentication.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_HR"))) {
            Employee targetEmp = employeeRepository.findById(request.getEmployeeId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee not found"));
            if (targetEmp.getManager() == null || !targetEmp.getManager().getUser().getUsername().equals(reviewerUsername)) {
                throw new org.springframework.security.access.AccessDeniedException("You can only review your direct reports");
            }
        }
        
        return ResponseEntity.ok(reviewService.createReview(request, reviewerUsername));
    }

    @Autowired
    private EmployeeRepository employeeRepository;
    @Autowired
    private UserRepository userRepository;

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<PerformanceReview>> getEmployeeReviews(@PathVariable Long employeeId,
            Authentication auth) {
        User user = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        if (user.getRole().name().equals("EMPLOYEE")) {
            Employee emp = employeeRepository.findByUser(user)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee profile not found"));
            if (!emp.getId().equals(employeeId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
            }
        }
        return ResponseEntity.ok(reviewService.getEmployeeReviews(employeeId));
    }
}
