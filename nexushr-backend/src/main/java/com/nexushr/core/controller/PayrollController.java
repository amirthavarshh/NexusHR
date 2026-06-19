package com.nexushr.core.controller;

import com.nexushr.core.model.Payroll;
import com.nexushr.core.service.PayrollService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/payroll")
@CrossOrigin(origins = "*", maxAge = 3600)
public class PayrollController {

    @Autowired
    private PayrollService payrollService;

    @PostMapping("/run")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN', 'HR')")
    public ResponseEntity<List<Payroll>> runPayroll(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return ResponseEntity.ok(payrollService.runPayroll(start, end));
    }

    @PostMapping("/{id}/pay")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN', 'HR')")
    public ResponseEntity<Payroll> paySalary(@PathVariable Long id) {
        return ResponseEntity.ok(payrollService.paySalary(id));
    }

    @GetMapping("/my-slips")
    public ResponseEntity<List<Payroll>> getMyPayrolls(Authentication authentication) {
        String username = authentication.getName();
        return ResponseEntity.ok(payrollService.getMyPayrolls(username));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN', 'HR')")
    public ResponseEntity<List<Payroll>> getAllPayrolls() {
        return ResponseEntity.ok(payrollService.getAllPayrolls());
    }
}
