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

        LeaveRequest request = LeaveRequest.builder()
                .employee(employee)
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .reason(dto.getReason())
                .type(LeaveType.valueOf(dto.getType().toUpperCase()))
                .status(LeaveStatus.PENDING)
                .build();

        return leaveRequestRepository.save(request);
    }

    public LeaveRequest approveLeave(Long id, String managerUsername) {
        LeaveRequest request = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Leave request not found"));

        request.setStatus(LeaveStatus.APPROVED);
        request.setApprovedBy(managerUsername);

        // Transition employee status if the leave is currently active
        Employee employee = request.getEmployee();
        employee.setStatus(EmployeeStatus.ON_LEAVE);
        employeeRepository.save(employee);

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
