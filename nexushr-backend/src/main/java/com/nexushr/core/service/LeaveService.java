package com.nexushr.core.service;

import com.nexushr.core.dto.LeaveRequestDto;
import com.nexushr.core.model.*;
import com.nexushr.core.repository.EmployeeRepository;
import com.nexushr.core.repository.LeaveRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class LeaveService {

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    public LeaveRequest applyLeave(LeaveRequestDto dto, String username) {
        Employee employee = employeeRepository.findByUser_Username(username)
                .orElseThrow(() -> new IllegalArgumentException("Employee profile not found"));

        if (dto.getStartDate().isAfter(dto.getEndDate())) {
            throw new IllegalArgumentException("Start date cannot be after end date");
        }

        Role userRole = employee.getUser().getRole();
        LeaveStatus initialStatus;
        if (userRole == Role.ADMIN) {
            initialStatus = LeaveStatus.APPROVED;
        } else if (userRole == Role.HR) {
            initialStatus = LeaveStatus.PENDING_ADMIN_APPROVAL;
        } else if (userRole == Role.MANAGER) {
            initialStatus = LeaveStatus.PENDING_HR_APPROVAL;
        } else {
            initialStatus = LeaveStatus.PENDING_MANAGER_APPROVAL;
        }

        LeaveRequest request = LeaveRequest.builder()
                .employee(employee)
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .reason(dto.getReason())
                .type(LeaveType.valueOf(dto.getType().toUpperCase()))
                .status(initialStatus)
                .build();

        if (initialStatus == LeaveStatus.APPROVED) {
            request.setApprovedBy(username);
            employee.setStatus(EmployeeStatus.ON_LEAVE);
            employeeRepository.save(employee);
        }

        return leaveRequestRepository.save(request);
    }

    public LeaveRequest approveLeave(Long id, String managerUsername) {
        LeaveRequest request = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Leave request not found"));

        Employee approver = employeeRepository.findByUser_Username(managerUsername)
                .orElseThrow(() -> new IllegalArgumentException("Approver profile not found"));
        Role approverRole = approver.getUser().getRole();
        LeaveStatus currentStatus = request.getStatus();

        if (approverRole == Role.MANAGER && currentStatus == LeaveStatus.PENDING_MANAGER_APPROVAL) {
            if (request.getEmployee().getManager() == null || !request.getEmployee().getManager().getId().equals(approver.getId())) {
                throw new IllegalArgumentException("Manager can only approve leave for direct reports");
            }
            request.setStatus(LeaveStatus.PENDING_HR_APPROVAL);
        } else if (approverRole == Role.HR && currentStatus == LeaveStatus.PENDING_HR_APPROVAL) {
            request.setStatus(LeaveStatus.APPROVED);
        } else if (approverRole == Role.ADMIN && currentStatus == LeaveStatus.PENDING_ADMIN_APPROVAL) {
            request.setStatus(LeaveStatus.APPROVED);
        } else if (approverRole == Role.ADMIN) {
            // Admin override
            request.setStatus(LeaveStatus.APPROVED);
        } else {
            throw new IllegalArgumentException("You do not have permission to approve this leave at its current stage");
        }

        request.setApprovedBy(managerUsername);

        if (request.getStatus() == LeaveStatus.APPROVED) {
            // Transition employee status if the leave is currently active
            Employee employee = request.getEmployee();
            employee.setStatus(EmployeeStatus.ON_LEAVE);
            employeeRepository.save(employee);
        }

        return leaveRequestRepository.save(request);
    }

    public LeaveRequest rejectLeave(Long id, String managerUsername) {
        LeaveRequest request = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Leave request not found"));

        request.setStatus(LeaveStatus.REJECTED);
        request.setApprovedBy(managerUsername);

        return leaveRequestRepository.save(request);
    }

    public List<LeaveRequest> getMyLeaveRequests(String username) {
        return leaveRequestRepository.findByEmployee_User_Username(username);
    }

    public List<LeaveRequest> getAllLeaveRequests() {
        return leaveRequestRepository.findAll();
    }
}
