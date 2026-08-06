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

    private final java.util.concurrent.ConcurrentHashMap<String, io.github.bucket4j.Bucket> loginBuckets = new java.util.concurrent.ConcurrentHashMap<>();
    private final java.util.concurrent.ConcurrentHashMap<String, io.github.bucket4j.Bucket> registerBuckets = new java.util.concurrent.ConcurrentHashMap<>();

    private void consumeLoginToken(String ip) {
        io.github.bucket4j.Bucket bucket = loginBuckets.computeIfAbsent(ip, key -> 
            io.github.bucket4j.Bucket.builder()
                .addLimit(io.github.bucket4j.Bandwidth.classic(5, io.github.bucket4j.Refill.greedy(5, java.time.Duration.ofMinutes(1))))
                .build()
        );
        if (!bucket.tryConsume(1)) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.TOO_MANY_REQUESTS,
                "Too many login attempts. Please try again in a minute."
            );
        }
    }

    private void consumeRegisterToken(String ip) {
        io.github.bucket4j.Bucket bucket = registerBuckets.computeIfAbsent(ip, key -> 
            io.github.bucket4j.Bucket.builder()
                .addLimit(io.github.bucket4j.Bandwidth.classic(3, io.github.bucket4j.Refill.greedy(3, java.time.Duration.ofMinutes(1))))
                .build()
        );
        if (!bucket.tryConsume(1)) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.TOO_MANY_REQUESTS,
                "Too many registration attempts. Please try again in a minute."
            );
        }
    }

    private void addTokenCookie(String token, jakarta.servlet.http.HttpServletResponse response) {
        // httpOnly, Secure, SameSite=Strict cookie configuration
        String cookieHeader = String.format("token=%s; Path=/; Max-Age=86400; HttpOnly; Secure; SameSite=Strict", token);
        response.addHeader("Set-Cookie", cookieHeader);
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> registerUser(
            @Valid @RequestBody RegisterRequest signUpRequest,
            jakarta.servlet.http.HttpServletResponse response) {
        String ip = servletRequest.getRemoteAddr();
        consumeRegisterToken(ip);
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
        consumeLoginToken(ip);
        AuthResponse res = authService.login(loginRequest);
        addTokenCookie(res.getToken(), response);
        return ResponseEntity.ok(res);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(jakarta.servlet.http.HttpServletResponse response) {
        String cookieHeader = "token=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict";
        response.addHeader("Set-Cookie", cookieHeader);
        return ResponseEntity.ok().build();
    }
}
