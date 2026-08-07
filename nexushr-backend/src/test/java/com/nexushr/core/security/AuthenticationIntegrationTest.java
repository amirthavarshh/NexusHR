package com.nexushr.core.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexushr.core.dto.AuthRequest;
import com.nexushr.core.dto.RegisterRequest;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = "JWT_SECRET_KEY=ZGVmYXVsdC1uZXh1cy1oci1zdXBlci1zZWNyZXQtand0LWtleS0yNTYtYml0")
@AutoConfigureMockMvc
public class AuthenticationIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testRegisterLoginAndAccessProtectedFlow() throws Exception {
        String randomSuffix = UUID.randomUUID().toString().substring(0, 8);
        String username = "user_" + randomSuffix;
        String email = username + "@example.com";
        String password = "SecurePassword123!";

        // 1. Register a new user
        RegisterRequest registerReq = new RegisterRequest();
        registerReq.setUsername(username);
        registerReq.setEmail(email);
        registerReq.setPassword(password);
        registerReq.setRole("EMPLOYEE");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isOk());

        // 2. Login
        AuthRequest loginReq = new AuthRequest();
        loginReq.setUsername(username);
        loginReq.setPassword(password);

        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andReturn();

        // Extract the Set-Cookie header or check cookie list
        Cookie tokenCookie = loginResult.getResponse().getCookie("token");
        assertNotNull(tokenCookie, "Token cookie must be set on login");

        // 3. Access a protected endpoint (GET /api/departments) using the valid cookie
        mockMvc.perform(get("/api/departments")
                .cookie(tokenCookie))
                .andExpect(status().isOk());

        // 4. Access using a token signed with the WRONG secret
        SecretKey wrongKey = Keys.hmacShaKeyFor(
                "wrongsecretkeywrongsecretkeywrongsecretkeywrongsecretkeywrongsecretkey".getBytes()
        );
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", "ROLE_EMPLOYEE");
        String wrongSignedJwt = Jwts.builder()
                .claims(claims)
                .subject(username)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + 3600000))
                .signWith(wrongKey)
                .compact();

        Cookie wrongCookie = new Cookie("token", wrongSignedJwt);
        wrongCookie.setPath("/");
        wrongCookie.setHttpOnly(true);

        mockMvc.perform(get("/api/departments")
                .cookie(wrongCookie))
                .andExpect(status().isForbidden());
    }
}
