package com.nexushr.core.controller;

import com.nexushr.core.dto.NotificationDTO;
import com.nexushr.core.model.User;
import com.nexushr.core.repository.UserRepository;
import com.nexushr.core.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserRepository userRepository;

    private Long getCurrentUserId(Authentication auth) {
        User user = userRepository.findByUsername(auth.getName()).orElseThrow();
        return user.getId();
    }

    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getMyNotifications(Authentication auth) {
        return ResponseEntity.ok(notificationService.getUserNotifications(getCurrentUserId(auth)));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(Authentication auth) {
        return ResponseEntity.ok(notificationService.getUnreadCount(getCurrentUserId(auth)));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id, Authentication auth) {
        notificationService.markAsRead(id, getCurrentUserId(auth));
        return ResponseEntity.ok().build();
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(Authentication auth) {
        notificationService.markAllAsRead(getCurrentUserId(auth));
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id, Authentication auth) {
        notificationService.deleteNotification(id, getCurrentUserId(auth));
        return ResponseEntity.ok().build();
    }
}
