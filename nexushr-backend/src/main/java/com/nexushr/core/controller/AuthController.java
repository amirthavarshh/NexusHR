package com.nexushr.core.controller;

import com.nexushr.core.dto.AuthRequest;
import com.nexushr.core.dto.AuthResponse;
import com.nexushr.core.dto.RegisterRequest;
import com.nexushr.core.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private jakarta.servlet.http.HttpServletRequest servletRequest;

    private final java.util.concurrent.ConcurrentHashMap<String, java.util.List<Long>> loginAttempts = new java.util.concurrent.ConcurrentHashMap<>();

    private void checkRateLimit(String ip) {
        long now = System.currentTimeMillis();
        long limitWindow = 60000; // 1 minute
        int maxAttempts = 5; // 5 attempts per minute

        java.util.List<Long> attempts = loginAttempts.computeIfAbsent(ip, k -> new java.util.concurrent.CopyOnWriteArrayList<>());
        attempts.removeIf(time -> now - time > limitWindow);

        if (attempts.size() >= maxAttempts) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.TOO_MANY_REQUESTS,
                "Too many login attempts. Please try again in a minute."
            );
        }
        attempts.add(now);
    }

    private void addTokenCookie(String token, jakarta.servlet.http.HttpServletResponse response) {
        jakarta.servlet.http.Cookie cookie = new jakarta.servlet.http.Cookie("token", token);
        cookie.setHttpOnly(true);
        cookie.setSecure(false); // Can be changed to true in production if running HTTPS
        cookie.setPath("/");
        cookie.setMaxAge(86400); // 1 day
        response.addCookie(cookie);
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> registerUser(
            @Valid @RequestBody RegisterRequest signUpRequest,
            jakarta.servlet.http.HttpServletResponse response) {
        AuthResponse res = authService.register(signUpRequest);
        addTokenCookie(res.getToken(), response);
        return ResponseEntity.ok(res);
    }

    @PostMapping("/invite")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<AuthResponse> inviteUser(@Valid @RequestBody RegisterRequest signUpRequest) {
        return ResponseEntity.ok(authService.invite(signUpRequest));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> authenticateUser(
            @Valid @RequestBody AuthRequest loginRequest,
            jakarta.servlet.http.HttpServletResponse response) {
        String ip = servletRequest.getRemoteAddr();
        checkRateLimit(ip);
        AuthResponse res = authService.login(loginRequest);
        addTokenCookie(res.getToken(), response);
        return ResponseEntity.ok(res);
    }
}
