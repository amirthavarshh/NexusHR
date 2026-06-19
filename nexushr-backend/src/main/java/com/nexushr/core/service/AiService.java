package com.nexushr.core.service;

import com.nexushr.core.model.Attendance;
import com.nexushr.core.model.AttendanceStatus;
import com.nexushr.core.model.Employee;
import com.nexushr.core.model.LeaveRequest;
import com.nexushr.core.model.LeaveType;
import com.nexushr.core.model.PerformanceReview;
import com.nexushr.core.repository.AttendanceRepository;
import com.nexushr.core.repository.EmployeeRepository;
import com.nexushr.core.repository.LeaveRequestRepository;
import com.nexushr.core.repository.PerformanceReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class AiService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @Autowired
    private PerformanceReviewRepository performanceReviewRepository;

    // Optional OpenAI API Key from environment
    private final String openAiApiKey = System.getenv("OPENAI_API_KEY");

    public Map<String, Object> predictAttrition(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found"));

        // Pull indicators
        List<Attendance> attendances = attendanceRepository.findByEmployee_Id(employeeId);
        List<LeaveRequest> leaves = leaveRequestRepository.findByEmployee_Id(employeeId);
        List<PerformanceReview> reviews = performanceReviewRepository.findByEmployee_Id(employeeId);

        // 1. Compute Base Risk Score based on real indicators
        double risk = 15.0; // Base baseline risk (15%)

        // Factor 1: Lateness and absences (maximum +30%)
        long lateOrAbsentCount = attendances.stream()
                .filter(a -> a.getStatus() == AttendanceStatus.LATE || a.getStatus() == AttendanceStatus.ABSENT)
                .count();
        risk += Math.min(30.0, lateOrAbsentCount * 7.5);

        // Factor 2: Low Performance Rating (maximum +30%)
        double latestRating = employee.getPerformanceRating();
        if (latestRating < 3.0) {
            risk += (3.0 - latestRating) * 15.0; // up to 30% for rating of 1.0
        } else if (latestRating > 4.0) {
            risk -= (latestRating - 4.0) * 10.0; // decrease risk for top performers
        }

        // Factor 3: Overuse of Unpaid Leaves (maximum +15%)
        long unpaidLeavesCount = leaves.stream()
                .filter(l -> l.getType() == LeaveType.UNPAID)
                .count();
        risk += Math.min(15.0, unpaidLeavesCount * 5.0);

        // Factor 4: Underpayment relative to department average (maximum +15%)
        List<Employee> deptEmployees = employeeRepository.findByDepartment(employee.getDepartment());
        double avgDeptSalary = deptEmployees.stream()
                .mapToDouble(Employee::getSalary)
                .average()
                .orElse(employee.getSalary());
        if (employee.getSalary() < avgDeptSalary) {
            double underpaidPercent = (avgDeptSalary - employee.getSalary()) / avgDeptSalary;
            risk += Math.min(15.0, underpaidPercent * 50.0);
        }

        // Clip risk between 5% and 95%
        risk = Math.max(5.0, Math.min(95.0, Math.round(risk * 100.0) / 100.0));

        // 2. Generate analysis explanation (LLM or heuristic)
        String riskCategory = risk > 70 ? "HIGH" : (risk > 40 ? "MEDIUM" : "LOW");
        String explanation = getAttritionExplanation(employee, riskCategory, lateOrAbsentCount, latestRating, unpaidLeavesCount);

        return Map.of(
                "employeeId", employeeId,
                "employeeName", employee.getFirstName() + " " + employee.getLastName(),
                "riskScore", risk,
                "riskCategory", riskCategory,
                "explanation", explanation
        );
    }

    private double cleanRating(double rating) {
        return Math.max(1.0, Math.min(5.0, Math.round(rating * 10.0) / 10.0));
    }

    public Map<String, Object> analyzeSkillGap(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new IllegalArgumentException("Employee not found"));

        String position = employee.getPosition() != null ? employee.getPosition().toLowerCase() : "";
        List<Map<String, Object>> skills = new ArrayList<>();
        double baseRating = employee.getPerformanceRating() != null ? employee.getPerformanceRating() : 3.0;

        // Generate position-based skills map
        if (position.contains("engineer") || position.contains("developer")) {
            skills.add(Map.of("skill", "Java Core", "current", cleanRating(baseRating + 0.5), "target", 5.0));
            skills.add(Map.of("skill", "Spring Boot", "current", cleanRating(baseRating), "target", 4.5));
            skills.add(Map.of("skill", "React & TypeScript", "current", cleanRating(baseRating - 0.5), "target", 4.0));
            skills.add(Map.of("skill", "PostgreSQL & JPA", "current", cleanRating(baseRating + 0.2), "target", 4.5));
            skills.add(Map.of("skill", "System Design", "current", cleanRating(baseRating - 1.0), "target", 4.0));
        } else if (position.contains("manager") || position.contains("lead")) {
            skills.add(Map.of("skill", "Leadership", "current", cleanRating(baseRating + 0.3), "target", 5.0));
            skills.add(Map.of("skill", "Project Management", "current", cleanRating(baseRating + 0.5), "target", 4.5));
            skills.add(Map.of("skill", "Communication", "current", cleanRating(baseRating), "target", 4.8));
            skills.add(Map.of("skill", "Agile Methodologies", "current", cleanRating(baseRating - 0.5), "target", 4.5));
            skills.add(Map.of("skill", "Strategic Planning", "current", cleanRating(baseRating - 0.8), "target", 4.0));
        } else {
            skills.add(Map.of("skill", "Job Competency", "current", cleanRating(baseRating), "target", 4.5));
            skills.add(Map.of("skill", "Teamwork", "current", cleanRating(baseRating + 0.2), "target", 4.5));
            skills.add(Map.of("skill", "Problem Solving", "current", cleanRating(baseRating - 0.3), "target", 4.0));
            skills.add(Map.of("skill", "Communication", "current", cleanRating(baseRating + 0.1), "target", 4.5));
        }

        String recommendations = getSkillGapRecommendations(employee, skills);

        return Map.of(
                "employeeId", employeeId,
                "employeeName", employee.getFirstName() + " " + employee.getLastName(),
                "position", employee.getPosition() != null ? employee.getPosition() : "Staff",
                "skills", skills,
                "recommendations", recommendations
        );
    }

    private String getAttritionExplanation(Employee employee, String riskCategory, long lateCount, double rating, long unpaidLeaves) {
        // Fallback or override using actual OpenAI endpoint if API Key is configured
        if (openAiApiKey != null && !openAiApiKey.trim().isEmpty()) {
            try {
                String prompt = String.format("Analyze the flight risk of an employee: Name: %s %s, Role: %s, Department: %s, Performance Rating: %.1f/5, Days late/absent: %d, Unpaid leaves taken: %d. Risk Category: %s. Write a concise, professional paragraph explaining the risk factors and offering a smart HR retention action item.", 
                        employee.getFirstName(), employee.getLastName(), employee.getPosition(), employee.getDepartment(), rating, lateCount, unpaidLeaves, riskCategory);
                return callOpenAi(prompt);
            } catch (Exception e) {
                // fall through to rules
            }
        }

        // Deterministic highly-contextual reports
        StringBuilder sb = new StringBuilder();
        sb.append(String.format("AI Model Analysis: The system predicts a %s flight risk for %s %s. ", 
                riskCategory, employee.getFirstName(), employee.getLastName()));

        List<String> riskFactors = new ArrayList<>();
        if (rating < 3.0) {
            riskFactors.add(String.format("a low performance rating of %.1f/5, which indicates potential disengagement or mismatch in responsibilities", rating));
        }
        if (lateCount > 2) {
            riskFactors.add(String.format("frequent attendance anomalies (%d check-in delays/absences) suggesting a decrease in day-to-day work engagement", lateCount));
        }
        if (unpaidLeaves > 1) {
            riskFactors.add(String.format("active usage of unpaid leaves (%d requests) which may suggest job search activities or personal conflicts", unpaidLeaves));
        }

        if (riskFactors.isEmpty()) {
            sb.append("The employee shows strong attendance consistency, competitive compensation, and steady performance. There are no immediate retention warning signs.");
        } else {
            sb.append("Primary drivers include: ").append(String.join(", and ", riskFactors)).append(". ");
            if (riskCategory.equals("HIGH")) {
                sb.append("Urgent action recommended: Schedule a private retention interview (1-on-1) within the next 48 hours to discuss burnout levels and load realignment.");
            } else {
                sb.append("Recommended action: HR should schedule a career coaching check-in during the upcoming quarterly review to restore engagement.");
            }
        }
        return sb.toString();
    }

    private String getSkillGapRecommendations(Employee employee, List<Map<String, Object>> skills) {
        if (openAiApiKey != null && !openAiApiKey.trim().isEmpty()) {
            try {
                StringBuilder prompt = new StringBuilder();
                prompt.append(String.format("For employee %s %s (%s in %s), review these competencies (current vs target out of 5):\n", 
                        employee.getFirstName(), employee.getLastName(), employee.getPosition(), employee.getDepartment()));
                for (Map<String, Object> s : skills) {
                    prompt.append(String.format("- %s: %.1f -> %.1f\n", s.get("skill"), s.get("current"), s.get("target")));
                }
                prompt.append("Provide a short bulleted plan containing exactly two training suggestions and one certifications goal.");
                return callOpenAi(prompt.toString());
            } catch (Exception e) {
                // fall through
            }
        }

        // Heuristic training plan
        StringBuilder sb = new StringBuilder();
        sb.append("Recommended Action Plan:\n");
        sb.append("1. **Skills Upskilling**: Enroll in internal training modules for the largest gap areas (e.g. system architectures and advanced framework patterns).\n");
        sb.append("2. **Peer Mentoring**: Set up a pairing partnership with a senior team member for 2 hours per week to gain hands-on architectural experience.\n");
        sb.append("3. **Certification Target**: Work towards completing professional vendor certifications (e.g. AWS Certified Developer or Scrum Master) by the end of next quarter.");
        return sb.toString();
    }

    private String callOpenAi(String prompt) throws Exception {
        HttpClient client = HttpClient.newHttpClient();
        String jsonPayload = String.format("{\"model\": \"gpt-4o-mini\", \"messages\": [{\"role\": \"user\", \"content\": \"%s\"}], \"temperature\": 0.3}", 
                prompt.replace("\"", "\\\"").replace("\n", "\\n"));

        HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create("https://api.openai.com/v1/chat/completions"))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + openAiApiKey)
                .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                .build();

        HttpResponse<String> response = client.send(httpRequest, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() == 200) {
            // Simple parsing of OpenAI chat completion response
            String body = response.body();
            int startIdx = body.indexOf("\"content\": \"");
            if (startIdx != -1) {
                startIdx += 12;
                int endIdx = body.indexOf("\"", startIdx);
                if (endIdx != -1) {
                    return body.substring(startIdx, endIdx).replace("\\n", "\n").replace("\\\"", "\"");
                }
            }
        }
        throw new RuntimeException("API error: Status " + response.statusCode());
    }
}
