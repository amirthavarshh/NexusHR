package com.nexushr.core.dto;

public class AuthResponse {
    private String token;
    private String username;
    private String email;
    private String role;
    private Long employeeId;
    private Long id;

    // Constructors
    public AuthResponse() {}

    public AuthResponse(String token, String username, String email, String role, Long employeeId, Long id) {
        this.token = token;
        this.username = username;
        this.email = email;
        this.role = role;
        this.employeeId = employeeId;
        this.id = id;
    }

    // Getters and Setters
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public Long getEmployeeId() { return employeeId; }
    public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    // Builder
    public static AuthResponseBuilder builder() {
        return new AuthResponseBuilder();
    }

    public static class AuthResponseBuilder {
        private String token;
        private String username;
        private String email;
        private String role;
        private Long employeeId;
        private Long id;

        AuthResponseBuilder() {}

        public AuthResponseBuilder token(String token) { this.token = token; return this; }
        public AuthResponseBuilder username(String username) { this.username = username; return this; }
        public AuthResponseBuilder email(String email) { this.email = email; return this; }
        public AuthResponseBuilder role(String role) { this.role = role; return this; }
        public AuthResponseBuilder employeeId(Long employeeId) { this.employeeId = employeeId; return this; }
        public AuthResponseBuilder id(Long id) { this.id = id; return this; }

        public AuthResponse build() {
            return new AuthResponse(token, username, email, role, employeeId, id);
        }
    }
}
