package com.nexushr.core.dto;

import jakarta.validation.constraints.NotBlank;

public class GoalStatusRequest {
    @NotBlank(message = "Status is required")
    private String status;

    public GoalStatusRequest() {}

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
