package com.nexushr.core.repository;

import com.nexushr.core.model.Goal;
import com.nexushr.core.model.GoalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GoalRepository extends JpaRepository<Goal, Long> {
    List<Goal> findByEmployeeId(Long employeeId);
    List<Goal> findByEmployeeIdAndStatus(Long employeeId, GoalStatus status);
}
