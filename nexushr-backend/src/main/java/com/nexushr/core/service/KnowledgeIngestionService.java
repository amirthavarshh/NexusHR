package com.nexushr.core.service;

import com.nexushr.core.model.KnowledgeChunk;
import com.nexushr.core.repository.KnowledgeChunkRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Seeds the knowledge_chunks table with NexusHR policy content on first startup.
 * Each topic is a separate chunk covering one HR policy area.
 * Embeddings are computed lazily via EmbeddingService; if no API key is set
 * the chunks still exist with empty embeddings and keyword fallback is used.
 */
@Service
public class KnowledgeIngestionService {

    private static final Logger log = LoggerFactory.getLogger(KnowledgeIngestionService.class);

    @Autowired
    private KnowledgeChunkRepository knowledgeChunkRepository;

    @Autowired
    private EmbeddingService embeddingService;

    /**
     * Seeds all policy chunks into the database if the table is empty.
     * Idempotent — safe to call on every startup.
     */
    public void seedIfEmpty() {
        if (knowledgeChunkRepository.count() > 0) {
            log.info("Knowledge chunks already seeded ({} rows). Skipping.", knowledgeChunkRepository.count());
            return;
        }
        log.info("Seeding HR knowledge base...");

        List<KnowledgeChunk> chunks = buildPolicyChunks();
        for (KnowledgeChunk chunk : chunks) {
            try {
                float[] embedding = embeddingService.embed(chunk.getTitle() + ". " + chunk.getContent());
                chunk.setEmbedding(embedding);
            } catch (Exception e) {
                log.warn("Could not embed chunk '{}': {}. Storing with empty embedding.", chunk.getTitle(), e.getMessage());
                chunk.setEmbedding(new float[0]);
            }
            knowledgeChunkRepository.save(chunk);
        }
        log.info("Seeded {} knowledge chunks.", chunks.size());
    }

    // ── Policy content ────────────────────────────────────────────────────────

    private List<KnowledgeChunk> buildPolicyChunks() {
        return List.of(

            // ── Leave Policy ─────────────────────────────────────────────────
            new KnowledgeChunk("leave_policy", "Annual Leave Entitlement",
                "All full-time employees receive 20 annual leave days per calendar year. " +
                "Annual leave accrues from the date of hire. New employees hired after July 1 " +
                "receive 10 days in their first calendar year. Leave rolls over by a maximum of " +
                "5 days to the next year. Any unused days beyond 5 are forfeited."),

            new KnowledgeChunk("leave_policy", "Sick Leave Policy",
                "Employees are entitled to 10 sick leave days per year. Sick leave does not " +
                "roll over to the following year. For absences exceeding 3 consecutive days, " +
                "a medical certificate signed by a licensed physician is required. Sick leave " +
                "is paid at full basic salary."),

            new KnowledgeChunk("leave_policy", "Unpaid Leave & Approval Workflow",
                "Unpaid leave may be requested when all paid leave days are exhausted. " +
                "Unpaid leave deducts from the monthly salary at the daily rate (basic salary / 22 working days). " +
                "Leave approval follows a three-stage workflow: " +
                "EMPLOYEE submits → MANAGER approves → HR approves → ADMIN final approval. " +
                "Managers may only approve leave for their direct reports. " +
                "Admins can override any stage. Leave status moves through: " +
                "PENDING_MANAGER_APPROVAL → PENDING_HR_APPROVAL → APPROVED (or REJECTED). " +
                "To apply for leave, visit the Time Off page in your portal."),

            // ── Payroll Rules ─────────────────────────────────────────────────
            new KnowledgeChunk("payroll_rules", "Payroll Calculation Formula",
                "Net salary is calculated as: Net = Basic Salary + Allowances − Deductions. " +
                "Allowances are fixed at 10% of basic salary. " +
                "Deductions are computed from approved unpaid leave days in the pay period: " +
                "Deductions = (Basic Salary / 22) × Unpaid Leave Days. " +
                "Payroll is generated per pay period (start date to end date). " +
                "Status moves from DRAFT → PAID when processed by HR/Admin. " +
                "Employees can view their payslips on the Payroll page in the employee portal."),

            new KnowledgeChunk("payroll_rules", "Payroll Schedule & Processing",
                "Payroll is run monthly by HR. The payroll cycle covers the 1st to the 28th " +
                "or 31st of each month. Salaries are processed within 3 business days after the " +
                "cycle closes. Employees receive notification when their payslip is generated. " +
                "Pay disputes should be raised with HR within 5 business days of payslip release."),

            // ── Attendance Policy ─────────────────────────────────────────────
            new KnowledgeChunk("attendance_policy", "Clock-In Rules & Late Policy",
                "Employees must clock in by 9:00 AM. A grace period of 15 minutes applies " +
                "(clock-in by 9:15 AM is recorded as PRESENT). Clock-in after 9:15 AM is " +
                "recorded as LATE. Three or more LATE records in a month triggers an automatic " +
                "HR notification. Failure to clock in at all is recorded as ABSENT. " +
                "Employees can clock in and out via the Attendance tab in their portal."),

            // ── Onboarding Checklist ──────────────────────────────────────────
            new KnowledgeChunk("onboarding_checklist", "New Hire Onboarding Steps",
                "When a new employee joins NexusHR, the following onboarding steps apply: " +
                "1. HR creates a user account and assigns the EMPLOYEE role. " +
                "2. Employee logs in and completes their profile card (name, position, department, salary). " +
                "3. Manager assigns the employee to their team. " +
                "4. HR sets up attendance tracking and leave balances. " +
                "5. First performance goals are set within 30 days of hire. " +
                "6. First performance review is scheduled at the 90-day mark."),

            // ── Performance Review ─────────────────────────────────────────────
            new KnowledgeChunk("performance_review", "Performance Review Cycle & Rating Scale",
                "Performance reviews occur quarterly (every 3 months). " +
                "Ratings are on a 1.0–5.0 scale: " +
                "1.0–2.0 = Needs Improvement, 2.1–3.0 = Developing, " +
                "3.1–4.0 = Meeting Expectations, 4.1–5.0 = Exceeding Expectations. " +
                "Managers submit written feedback and a rating score. " +
                "Employees can view their review history on the Dashboard. " +
                "Performance ratings influence the attrition risk score computed by the AI module."),

            // ── Goals Workflow ─────────────────────────────────────────────────
            new KnowledgeChunk("goals_workflow", "Goals & OKR Workflow",
                "Employees and managers collaborate to set goals (OKRs). " +
                "Goals move through three statuses: PENDING → IN_PROGRESS → COMPLETED. " +
                "Goals have a title, description, target completion date, and priority (LOW / MEDIUM / HIGH). " +
                "Managers can create goals for their direct reports. " +
                "Employees can update the status of their own goals. " +
                "Overdue goals (past target date and still PENDING or IN_PROGRESS) are flagged for review. " +
                "Visit the Goals tab in your portal to view and update your goals.")
        );
    }
}
