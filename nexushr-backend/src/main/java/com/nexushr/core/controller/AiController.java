package com.nexushr.core.controller;

import com.nexushr.core.model.Employee;
import com.nexushr.core.model.User;
import com.nexushr.core.repository.EmployeeRepository;
import com.nexushr.core.repository.UserRepository;
import com.nexushr.core.service.AiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/ai")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AiController {

    @Autowired
    private AiService aiService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    private void verifyOwnership(Long targetEmployeeId, Authentication auth) {
        User user = userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        if (user.getRole().name().equals("EMPLOYEE")) {
            Employee emp = employeeRepository.findByUser(user)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee profile not found"));
            if (!emp.getId().equals(targetEmployeeId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
            }
        } else if (user.getRole().name().equals("MANAGER")) {
            Employee targetEmp = employeeRepository.findById(targetEmployeeId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Employee not found"));
            if (targetEmp.getManager() == null || !targetEmp.getManager().getUser().getUsername().equals(auth.getName())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied: Not the direct manager");
            }
        }
    }

    @GetMapping("/attrition/{employeeId}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN', 'HR')")
    public ResponseEntity<Map<String, Object>> predictAttrition(@PathVariable Long employeeId, Authentication authentication) {
        verifyOwnership(employeeId, authentication);
        return ResponseEntity.ok(aiService.predictAttrition(employeeId));
    }

    @GetMapping("/skillgap/{employeeId}")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER', 'ADMIN', 'HR')")
    public ResponseEntity<Map<String, Object>> analyzeSkillGap(@PathVariable Long employeeId, Authentication authentication) {
        verifyOwnership(employeeId, authentication);
        return ResponseEntity.ok(aiService.analyzeSkillGap(employeeId));
    }
}