package com.nexushr.core.service;

import com.nexushr.core.dto.NotificationDTO;
import com.nexushr.core.model.Notification;
import com.nexushr.core.model.NotificationType;
import com.nexushr.core.model.User;
import com.nexushr.core.model.Employee;
import com.nexushr.core.repository.NotificationRepository;
import com.nexushr.core.repository.UserRepository;
import com.nexushr.core.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @org.springframework.beans.factory.annotation.Value("${app.notification.email.enabled:false}")
    private boolean emailEnabled;

    @org.springframework.beans.factory.annotation.Value("${app.notification.sms.enabled:false}")
    private boolean smsEnabled;

    @org.springframework.beans.factory.annotation.Value("${app.notification.email.provider:SIMULATED}")
    private String emailProvider;

    @org.springframework.beans.factory.annotation.Value("${app.notification.sms.provider:SIMULATED}")
    private String smsProvider;

    public void sendNotification(String title, String message, NotificationType type, Long recipientId, Long senderId) {
        Notification notification = new Notification();
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setRecipientId(recipientId);
        notification.setSenderId(senderId);

        Notification savedNotification = notificationRepository.save(notification);

        // Send to WebSocket
        try {
            messagingTemplate.convertAndSendToUser(
                    recipientId.toString(),
                    "/queue/notifications",
                    convertToDTO(savedNotification)
            );
        } catch (Exception e) {
            System.err.println("WebSocket dispatch failed: " + e.getMessage());
        }

        // Send simulated Email / SMS alerts
        try {
            User recipient = userRepository.findById(recipientId).orElse(null);
            if (recipient != null) {
                String email = recipient.getEmail();
                Employee employee = employeeRepository.findByUser(recipient).orElse(null);
                String phone = (employee != null) ? employee.getPhone() : null;

                if (emailEnabled) {
                    System.out.println(String.format("[EMAIL SERVICE - %s] Dispatched email notification to: %s", emailProvider, email));
                    System.out.println(String.format("Subject: %s | Message: %s", title, message));
                }
                if (smsEnabled && phone != null && !phone.trim().isEmpty()) {
                    System.out.println(String.format("[SMS SERVICE - %s] Dispatched SMS notification to: %s", smsProvider, phone));
                    System.out.println(String.format("Message: %s", message));
                }
            }
        } catch (Exception e) {
            System.err.println("Simulated Email/SMS alert dispatch failed: " + e.getMessage());
        }
    }


    public List<NotificationDTO> getUserNotifications(Long userId) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId)
                .stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByRecipientIdAndIsRead(userId, false);
    }

    @Transactional
    public void markAsRead(Long notificationId) {
        notificationRepository.findById(notificationId).ifPresent(notification -> {
            notification.setRead(true);
            notificationRepository.save(notification);
        });
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository.findByRecipientIdAndIsReadOrderByCreatedAtDesc(userId, false);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    public void deleteNotification(Long notificationId) {
        notificationRepository.deleteById(notificationId);
    }

    private NotificationDTO convertToDTO(Notification notification) {
        NotificationDTO dto = new NotificationDTO();
        dto.setId(notification.getId());
        dto.setTitle(notification.getTitle());
        dto.setMessage(notification.getMessage());
        dto.setType(notification.getType());
        dto.setRecipientId(notification.getRecipientId());
        dto.setSenderId(notification.getSenderId());
        dto.setRead(notification.isRead());
        dto.setCreatedAt(notification.getCreatedAt());
        return dto;
    }
}
