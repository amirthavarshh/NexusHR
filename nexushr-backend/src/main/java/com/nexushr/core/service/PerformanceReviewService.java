package com.nexushr.core.service;

import com.nexushr.core.dto.PerformanceReviewRequest;
import com.nexushr.core.model.Employee;
import com.nexushr.core.model.PerformanceReview;
import com.nexushr.core.model.User;
import com.nexushr.core.repository.EmployeeRepository;
import com.nexushr.core.repository.PerformanceReviewRepository;
import com.nexushr.core.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class PerformanceReviewService {

    @Autowired
    private PerformanceReviewRepository performanceReviewRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private UserRepository userRepository;

    public PerformanceReview createReview(PerformanceReviewRequest request, String reviewerUsername) {
        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new IllegalArgumentException("Employee profile not found"));

        User reviewer = userRepository.findByUsername(reviewerUsername)
                .orElseThrow(() -> new IllegalArgumentException("Reviewing user not found"));

        PerformanceReview review = PerformanceReview.builder()
                .employee(employee)
                .reviewer(reviewer)
                .reviewDate(LocalDate.now())
                .rating(request.getRating())
                .feedback(request.getFeedback())
                .goals(request.getGoals())
                .build();

        PerformanceReview saved = performanceReviewRepository.save(review);

        // Update employee average rating
        List<PerformanceReview> allReviews = performanceReviewRepository.findByEmployee_Id(employee.getId());
        double avg = allReviews.stream()
                .mapToDouble(PerformanceReview::getRating)
                .average()
                .orElse(request.getRating());
        
        employee.setPerformanceRating(Math.round(avg * 100.0) / 100.0);
        employeeRepository.save(employee);

        return saved;
    }

    public List<PerformanceReview> getEmployeeReviews(Long employeeId) {
        return performanceReviewRepository.findByEmployee_Id(employeeId);
    }
}
