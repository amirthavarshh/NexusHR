package com.nexushr.core.repository;

import com.nexushr.core.model.LeaveRequest;
import com.nexushr.core.model.LeaveStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    List<LeaveRequest> findByEmployee_Id(Long employeeId);

    List<LeaveRequest> findByEmployee_User_Username(String username);

    List<LeaveRequest> findByStatus(LeaveStatus status);

    List<LeaveRequest> findByStatusAndStartDate(LeaveStatus status, LocalDate startDate);

    List<LeaveRequest> findByStatusAndEndDate(LeaveStatus status, LocalDate endDate);

    @org.springframework.data.jpa.repository.Query("SELECT l FROM LeaveRequest l WHERE l.employee.id = :employeeId " +
            "AND l.status != com.nexushr.core.model.LeaveStatus.REJECTED " +
            "AND l.startDate <= :endDate AND l.endDate >= :startDate")
    List<LeaveRequest> findOverlappingLeaves(
            @org.springframework.data.repository.query.Param("employeeId") Long employeeId,
            @org.springframework.data.repository.query.Param("startDate") LocalDate startDate,
            @org.springframework.data.repository.query.Param("endDate") LocalDate endDate);
}
