package com.nexushr.core;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.nexushr.core.repository.UserRepository;
import com.nexushr.core.model.User;

@SpringBootTest
class BackendApplicationTests {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserRepository userRepository;

    @Test
    void testPasswordMatching() {
        System.out.println("GEN_HASH_ADMIN: " + passwordEncoder.encode("admin123"));
        System.out.println("GEN_HASH_MANAGER: " + passwordEncoder.encode("manager123"));
        System.out.println("GEN_HASH_EMPLOYEE: " + passwordEncoder.encode("employee123"));
    }
}
