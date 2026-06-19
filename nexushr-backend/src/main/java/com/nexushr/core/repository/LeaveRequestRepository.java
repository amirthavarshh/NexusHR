package com.nexushr.core.repository;

import com.nexushr.core.model.LeaveRequest;
import com.nexushr.core.model.LeaveStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    List<LeaveRequest> findByEmployee_Id(Long employeeId);
    List<LeaveRequest> findByEmployee_User_Username(String username);
    List<LeaveRequest> findByStatus(LeaveStatus status);
}
