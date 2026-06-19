package com.nexushr.core.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class LeaveRequestDto {
    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    @NotBlank(message = "Reason is required")
    private String reason;

    @NotBlank(message = "Leave type is required (ANNUAL, SICK, UNPAID)")
    private String type;

    // Constructors
    public LeaveRequestDto() {}

    public LeaveRequestDto(LocalDate startDate, LocalDate endDate, String reason, String type) {
        this.startDate = startDate;
        this.endDate = endDate;
        this.reason = reason;
        this.type = type;
    }

    // Getters and Setters
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
}
