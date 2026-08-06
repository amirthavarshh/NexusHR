package com.nexushr.core.service;

import com.nexushr.core.model.*;
import com.nexushr.core.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Orchestrates the chatbot interaction:
 *
 *  1. Guards against action-intent messages (approve/reject/delete)
 *  2. Builds a personal-data context string scoped to the logged-in user
 *  3. Delegates to RagService for RAG + LLM answer generation
 *  4. Logs each interaction for audit purposes
 */
@Service
public class ChatService {

    private static final Logger log = LoggerFactory.getLogger(ChatService.class);

    // Keywords that signal a write-action intent — bot should not attempt these
    private static final List<String> ACTION_KEYWORDS = List.of(
        "approve", "reject", "delete", "remove", "fire", "terminate",
        "cancel leave", "cancel my leave", "submit leave", "apply leave"
    );

    @Autowired private RagService ragService;
    @Autowired private EmployeeRepository employeeRepository;
    @Autowired private LeaveRequestRepository leaveRequestRepository;
    @Autowired private AttendanceRepository attendanceRepository;
    @Autowired private PayrollRepository payrollRepository;

    // ── Public API ────────────────────────────────────────────────────────────

    /**
     * Process a user chat message.
     *
     * @param message  Raw user message (already validated for length in DTO)
     * @param username Authenticated username from JWT
     * @param role     User's role string (EMPLOYEE, MANAGER, HR, ADMIN)
     */
    public Map<String, Object> chat(String message, String username, String role) {
        log.info("AUDIT chat: user={} role={} msgLen={}", username, role, message.length());

        // 1. Action-intent guard
        String lower = message.toLowerCase();
        for (String keyword : ACTION_KEYWORDS) {
            if (lower.contains(keyword)) {
                return buildDeflection(keyword);
            }
        }

        // 2. Build personal data context (scoped — never other employees' data)
        String personalContext = buildPersonalContext(username, role);

        // 3. Delegate to RAG pipeline
        return ragService.answer(message, personalContext, role, username);
    }

    // ── Personal context builder ──────────────────────────────────────────────

    private String buildPersonalContext(String username, String role) {
        try {
            Optional<Employee> empOpt = employeeRepository.findByUser_Username(username);
            if (empOpt.isEmpty()) {
                // User hasn't completed their profile yet — no personal data to add
                return "";
            }
            Employee emp = empOpt.get();
            StringBuilder ctx = new StringBuilder();

            ctx.append(String.format("Employee: %s %s | Position: %s | Department: %s\n",
                emp.getFirstName(), emp.getLastName(), emp.getPosition(), emp.getDepartment()));

            // Leave summary — only for this employee
            List<LeaveRequest> leaves = leaveRequestRepository.findByEmployee_Id(emp.getId());
            long approvedLeaves = leaves.stream().filter(l -> l.getStatus() == LeaveStatus.APPROVED).count();
            long pendingLeaves  = leaves.stream().filter(l ->
                l.getStatus() == LeaveStatus.PENDING_MANAGER_APPROVAL ||
                l.getStatus() == LeaveStatus.PENDING_HR_APPROVAL ||
                l.getStatus() == LeaveStatus.PENDING_ADMIN_APPROVAL).count();
            long annualUsed     = leaves.stream().filter(l ->
                l.getStatus() == LeaveStatus.APPROVED && l.getType() == LeaveType.ANNUAL).count();

            ctx.append(String.format("Leave: %d approved leave(s), %d pending, %d annual leave(s) taken this cycle.\n",
                approvedLeaves, pendingLeaves, annualUsed));

            // Attendance this month
            LocalDate startOfMonth = LocalDate.now().withDayOfMonth(1);
            List<Attendance> monthAtt = attendanceRepository.findByEmployee_Id(emp.getId()).stream()
                .filter(a -> !a.getDate().isBefore(startOfMonth))
                .collect(Collectors.toList());
            long present = monthAtt.stream().filter(a -> a.getStatus() == AttendanceStatus.PRESENT).count();
            long late    = monthAtt.stream().filter(a -> a.getStatus() == AttendanceStatus.LATE).count();
            long absent  = monthAtt.stream().filter(a -> a.getStatus() == AttendanceStatus.ABSENT).count();
            ctx.append(String.format("Attendance this month: %d present, %d late, %d absent.\n", present, late, absent));

            // Latest payslip summary (net salary only — no raw salary figure exposed unless asked)
            List<Payroll> payrolls = payrollRepository.findByEmployee_User_Username(username);
            if (!payrolls.isEmpty()) {
                Payroll latest = payrolls.get(payrolls.size() - 1);
                ctx.append(String.format("Latest payslip: Period %s – %s | Net salary: $%.2f | Status: %s\n",
                    latest.getPayPeriodStart(), latest.getPayPeriodEnd(),
                    latest.getNetSalary(), latest.getStatus()));
            }

            // Manager info
            if (emp.getManager() != null) {
                ctx.append(String.format("Direct manager: %s %s\n",
                    emp.getManager().getFirstName(), emp.getManager().getLastName()));
            }

            // For MANAGER role — add brief team size stat (no individual data)
            if ("MANAGER".equals(role)) {
                List<Employee> team = employeeRepository.findByManager_Id(emp.getId());
                ctx.append(String.format("Team size: %d direct reports.\n", team.size()));
            }

            return ctx.toString();
        } catch (Exception e) {
            log.warn("Could not build personal context for user {}: {}", username, e.getMessage());
            return "";
        }
    }

    // ── Deflection response ───────────────────────────────────────────────────

    private Map<String, Object> buildDeflection(String detectedIntent) {
        String answer = "I can answer questions about HR policies and your personal HR data, " +
            "but I'm not able to perform actions like **" + detectedIntent + "** directly. " +
            "\n\nTo manage leaves, please visit the **Time Off** page. " +
            "For payroll actions, use the **Payroll** section. " +
            "Goal updates can be made from the **Goals** tab in your portal.";

        return Map.of(
            "answer", answer,
            "sources", List.of(),
            "timestamp", java.time.Instant.now().toString()
        );
    }
}
