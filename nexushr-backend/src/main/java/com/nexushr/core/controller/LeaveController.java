package com.nexushr.core.controller;

import com.nexushr.core.dto.LeaveRequestDto;
import com.nexushr.core.model.LeaveRequest;
import com.nexushr.core.service.LeaveService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/leaves")
@CrossOrigin(origins = "*", maxAge = 3600)
public class LeaveController {

    @Autowired
    private LeaveService leaveService;

    @PostMapping
    public ResponseEntity<LeaveRequest> applyLeave(@Valid @RequestBody LeaveRequestDto dto, Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(leaveService.applyLeave(dto, username));
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN', 'HR')")
    public ResponseEntity<LeaveRequest> approveLeave(@PathVariable Long id, Authentication authentication) {
        String managerUsername = authentication.getName();
        return ResponseEntity.ok(leaveService.approveLeave(id, managerUsername));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN', 'HR')")
    public ResponseEntity<LeaveRequest> rejectLeave(@PathVariable Long id, Authentication authentication) {
        String managerUsername = authentication.getName();
        return ResponseEntity.ok(leaveService.rejectLeave(id, managerUsername));
    }

    @GetMapping("/my-requests")
    public ResponseEntity<List<LeaveRequest>> getMyLeaveRequests(Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(leaveService.getMyLeaveRequests(username));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN', 'HR')")
    public ResponseEntity<List<LeaveRequest>> getAllLeaveRequests() {
        return ResponseEntity.ok(leaveService.getAllLeaveRequests());
    }
}
