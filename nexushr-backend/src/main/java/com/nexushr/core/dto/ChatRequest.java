package com.nexushr.core.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request body for POST /api/ai/chat
 */
public class ChatRequest {

    @NotBlank(message = "Message must not be blank")
    @Size(max = 500, message = "Message must not exceed 500 characters")
    private String message;

    public ChatRequest() {}

    public ChatRequest(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
