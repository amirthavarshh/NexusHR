package com.nexushr.core.repository;

import com.nexushr.core.model.PerformanceReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PerformanceReviewRepository extends JpaRepository<PerformanceReview, Long> {
    List<PerformanceReview> findByEmployee_Id(Long employeeId);
    List<PerformanceReview> findByEmployee_User_Username(String username);
}
