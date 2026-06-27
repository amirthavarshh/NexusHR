package com.nexushr.core.service;

import com.nexushr.core.dto.LeaveRequestDto;
import com.nexushr.core.model.*;
import com.nexushr.core.repository.EmployeeRepository;
import com.nexushr.core.repository.LeaveRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class LeaveService {

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private NotificationService notificationService;

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

            LocalDate today = LocalDate.now();
            if (!today.isBefore(dto.getStartDate()) && !today.isAfter(dto.getEndDate())) {
                employee.setStatus(EmployeeStatus.ON_LEAVE);
                employeeRepository.save(employee);
            }
        }

        LeaveRequest savedRequest = leaveRequestRepository.save(request);

        // Notify manager
        try {
            Employee manager = employee.getManager();
            if (manager != null && manager.getUser() != null) {
                String title = "New Leave Request";
                String message = String.format("Employee %s %s has requested %s leave starting from %s. Reason: %s",
                        employee.getFirstName(), employee.getLastName(), dto.getType(), dto.getStartDate(),
                        dto.getReason());
                notificationService.sendNotification(
                        title,
                        message,
                        NotificationType.LEAVE_REQUEST,
                        manager.getUser().getId(),
                        employee.getUser().getId());
            }
        } catch (Exception e) {
            System.err.println("Failed to send notification for applied leave: " + e.getMessage());
        }

        return savedRequest;
    }

    public LeaveRequest approveLeave(Long id, String managerUsername) {
        LeaveRequest request = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Leave request not found"));

        Employee approver = employeeRepository.findByUser_Username(managerUsername)
                .orElseThrow(() -> new IllegalArgumentException("Approver profile not found"));
        Role approverRole = approver.getUser().getRole();
        LeaveStatus currentStatus = request.getStatus();

        if (currentStatus == LeaveStatus.APPROVED || currentStatus == LeaveStatus.REJECTED) {
            throw new IllegalArgumentException("This leave request has already been finalized");
        }

        if (approverRole == Role.MANAGER && currentStatus == LeaveStatus.PENDING_MANAGER_APPROVAL) {
            if (request.getEmployee().getManager() == null
                    || !request.getEmployee().getManager().getId().equals(approver.getId())) {
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
            Employee employee = request.getEmployee();
            LocalDate today = LocalDate.now();
            if (!today.isBefore(request.getStartDate()) && !today.isAfter(request.getEndDate())) {
                employee.setStatus(EmployeeStatus.ON_LEAVE);
                employeeRepository.save(employee);
            }
        }

        LeaveRequest savedRequest = leaveRequestRepository.save(request);

        // Notify employee
        try {
            Employee employee = savedRequest.getEmployee();
            if (employee != null && employee.getUser() != null) {
                String title = "Leave Request Update";
                String message = String.format("Your leave request starting %s has been set to: %s by %s.",
                        savedRequest.getStartDate(), savedRequest.getStatus(), managerUsername);
                notificationService.sendNotification(
                        title,
                        message,
                        NotificationType.LEAVE_APPROVED,
                        employee.getUser().getId(),
                        approver.getUser().getId());
            }
        } catch (Exception e) {
            System.err.println("Failed to send notification for approved leave: " + e.getMessage());
        }

        return savedRequest;
    }

    public LeaveRequest rejectLeave(Long id, String managerUsername) {
        LeaveRequest request = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Leave request not found"));

        Employee approver = employeeRepository.findByUser_Username(managerUsername)
                .orElseThrow(() -> new IllegalArgumentException("Approver profile not found"));
        Role approverRole = approver.getUser().getRole();
        LeaveStatus currentStatus = request.getStatus();

        if (currentStatus == LeaveStatus.APPROVED || currentStatus == LeaveStatus.REJECTED) {
            throw new IllegalArgumentException("This leave request has already been finalized");
        }

        boolean canReject = (approverRole == Role.MANAGER && currentStatus == LeaveStatus.PENDING_MANAGER_APPROVAL
                && request.getEmployee().getManager() != null
                && request.getEmployee().getManager().getId().equals(approver.getId()))
                || (approverRole == Role.HR && currentStatus == LeaveStatus.PENDING_HR_APPROVAL)
                || (approverRole == Role.ADMIN); // admin override allowed at any pending stage

        if (!canReject) {
            throw new IllegalArgumentException("You do not have permission to reject this leave at its current stage");
        }

        request.setStatus(LeaveStatus.REJECTED);
        request.setApprovedBy(managerUsername);

        LeaveRequest savedRequest = leaveRequestRepository.save(request);

        // Notify employee
        try {
            Employee employee = savedRequest.getEmployee();
            Employee manager = employeeRepository.findByUser_Username(managerUsername).orElse(null);
            Long managerUserId = (manager != null && manager.getUser() != null) ? manager.getUser().getId() : null;

            if (employee != null && employee.getUser() != null) {
                String title = "Leave Request Rejected";
                String message = String.format("Your leave request starting %s has been rejected by %s.",
                        savedRequest.getStartDate(), managerUsername);
                notificationService.sendNotification(
                        title,
                        message,
                        NotificationType.LEAVE_REJECTED,
                        employee.getUser().getId(),
                        managerUserId);
            }
        } catch (Exception e) {
            System.err.println("Failed to send notification for rejected leave: " + e.getMessage());
        }

        return savedRequest;
    }

    public List<LeaveRequest> getMyLeaveRequests(String username) {
        return leaveRequestRepository.findByEmployee_User_Username(username);
    }

    public List<LeaveRequest> getAllLeaveRequests() {
        return leaveRequestRepository.findAll();
    }
}
