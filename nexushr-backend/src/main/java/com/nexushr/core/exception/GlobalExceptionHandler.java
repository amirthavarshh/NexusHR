package com.nexushr.core.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Handles @Valid validation failures (e.g., username too short, email invalid)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationErrors(MethodArgumentNotValidException ex) {
        String errorMessage = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .findFirst()
                .orElse("Validation error");
        Map<String, String> error = new HashMap<>();
        error.put("message", errorMessage);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    // Handles ResponseStatusException thrown by controllers (e.g., 403, 404, 400).
    // MUST be declared before the generic Exception handler so it is not swallowed.
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> handleResponseStatus(ResponseStatusException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("message", ex.getReason() != null ? ex.getReason() : ex.getMessage());
        return ResponseEntity.status(ex.getStatusCode()).body(error);
    }

    // Handles Spring Security's @PreAuthorize and manual AccessDeniedException
    // throws.
    // Returns 403 instead of letting it fall through to the 500 generic handler.
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, String>> handleAccessDenied(AccessDeniedException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("message", "Access denied: you do not have permission to perform this action");
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }

    // Handles authentication failures (e.g., bad password, user not found) thrown
    // by AuthenticationManager.
    @ExceptionHandler(org.springframework.security.core.AuthenticationException.class)
    public ResponseEntity<Map<String, String>> handleAuthenticationException(
            org.springframework.security.core.AuthenticationException ex) {
        ex.printStackTrace(); // Added for debugging
        Map<String, String> error = new HashMap<>();
        error.put("message", "Invalid username or password");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    // Handles business logic errors (e.g., username already taken)
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException ex) {
        Map<String, String> error = new HashMap<>();
        String msg = ex.getMessage();
        error.put("message", msg);
        if (msg != null && msg.toLowerCase().contains("not found")) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } else if (msg != null && (msg.toLowerCase().contains("already") || msg.toLowerCase().contains("taken"))) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    // Handles invalid enum values (e.g., bad role string)
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, String>> handleIllegalState(IllegalStateException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    // Handles all other unexpected errors
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGenericException(Exception ex) {
        ex.printStackTrace(); // Added for debugging
        Map<String, String> error = new HashMap<>();
        String msg = ex.getMessage();
        // Friendly messages for common causes
        if (msg != null && msg.contains("No enum constant")) {
            error.put("message", "Invalid role. Must be one of: EMPLOYEE, MANAGER, HR, ADMIN");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } else if (msg != null && (msg.contains("DataIntegrityViolation") || msg.contains("not-null"))) {
            error.put("message", "Please fill in all required profile fields");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } else {
            error.put("message", "An unexpected error occurred. Please try again.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
