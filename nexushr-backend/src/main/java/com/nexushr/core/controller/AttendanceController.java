package com.nexushr.core.controller;

import com.nexushr.core.model.Attendance;
import com.nexushr.core.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/attendance")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    @PostMapping("/clock-in")
    public ResponseEntity<Attendance> clockIn(Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(attendanceService.clockIn(username));
    }

    @PostMapping("/clock-out")
    public ResponseEntity<Attendance> clockOut(Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(attendanceService.clockOut(username));
    }

    @GetMapping("/today")
    public ResponseEntity<Attendance> getTodayAttendance(Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(attendanceService.getTodayAttendance(username));
    }

    @GetMapping("/my-history")
    public ResponseEntity<List<Attendance>> getMyAttendanceHistory(Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(attendanceService.getAttendanceHistory(username));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN', 'HR')")
    public ResponseEntity<List<Attendance>> getAllAttendance() {
        return ResponseEntity.ok(attendanceService.getAllAttendance());
    }
}
