package com.nexushr.core.controller;

import com.nexushr.core.dto.PerformanceReviewRequest;
import com.nexushr.core.model.PerformanceReview;
import com.nexushr.core.service.PerformanceReviewService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

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
        return ResponseEntity.ok(reviewService.createReview(request, reviewerUsername));
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<PerformanceReview>> getEmployeeReviews(@PathVariable Long employeeId) {
        return ResponseEntity.ok(reviewService.getEmployeeReviews(employeeId));
    }
}
