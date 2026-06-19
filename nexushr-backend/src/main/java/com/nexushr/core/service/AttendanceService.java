package com.nexushr.core.service;

import com.nexushr.core.model.Attendance;
import com.nexushr.core.model.AttendanceStatus;
import com.nexushr.core.model.Employee;
import com.nexushr.core.repository.AttendanceRepository;
import com.nexushr.core.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    public Attendance clockIn(String username) {
        Employee employee = employeeRepository.findByUser_Username(username)
                .orElseThrow(() -> new IllegalArgumentException("Employee profile not found"));

        LocalDate today = LocalDate.now();
        Optional<Attendance> existing = attendanceRepository.findByEmployeeAndDate(employee, today);

        if (existing.isPresent()) {
            throw new IllegalArgumentException("Already clocked in for today");
        }

        LocalTime now = LocalTime.now();
        AttendanceStatus status = AttendanceStatus.PRESENT;

        // Shift starts at 9:00 AM. Clocking in after 9:15 AM is marked as LATE.
        if (now.isAfter(LocalTime.of(9, 15))) {
            status = AttendanceStatus.LATE;
        }

        Attendance attendance = Attendance.builder()
                .employee(employee)
                .date(today)
                .clockIn(now)
                .status(status)
                .build();

        return attendanceRepository.save(attendance);
    }

    public Attendance clockOut(String username) {
        Employee employee = employeeRepository.findByUser_Username(username)
                .orElseThrow(() -> new IllegalArgumentException("Employee profile not found"));

        LocalDate today = LocalDate.now();
        Attendance attendance = attendanceRepository.findByEmployeeAndDate(employee, today)
                .orElseThrow(() -> new IllegalArgumentException("Must clock in first before clocking out"));

        if (attendance.getClockOut() != null) {
            throw new IllegalArgumentException("Already clocked out for today");
        }

        attendance.setClockOut(LocalTime.now());
        return attendanceRepository.save(attendance);
    }

    public Attendance getTodayAttendance(String username) {
        Employee employee = employeeRepository.findByUser_Username(username)
                .orElseThrow(() -> new IllegalArgumentException("Employee profile not found"));

        return attendanceRepository.findByEmployeeAndDate(employee, LocalDate.now())
                .orElse(null);
    }

    public List<Attendance> getAttendanceHistory(String username) {
        Employee employee = employeeRepository.findByUser_Username(username)
                .orElseThrow(() -> new IllegalArgumentException("Employee profile not found"));

        return attendanceRepository.findByEmployee_Id(employee.getId());
    }

    public List<Attendance> getAllAttendance() {
        return attendanceRepository.findAll();
    }
}
