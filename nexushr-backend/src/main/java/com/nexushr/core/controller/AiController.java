package com.nexushr.core.controller;

import com.nexushr.core.service.AiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/ai")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AiController {

    @Autowired
    private AiService aiService;

    @GetMapping("/attrition/{employeeId}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN', 'HR')")
    public ResponseEntity<Map<String, Object>> predictAttrition(@PathVariable Long employeeId) {
        return ResponseEntity.ok(aiService.predictAttrition(employeeId));
    }

    @GetMapping("/skillgap/{employeeId}")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'MANAGER', 'ADMIN', 'HR')")
    public ResponseEntity<Map<String, Object>> analyzeSkillGap(@PathVariable Long employeeId) {
        return ResponseEntity.ok(aiService.analyzeSkillGap(employeeId));
    }
}