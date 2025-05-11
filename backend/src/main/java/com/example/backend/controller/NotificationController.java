package com.example.backend.controller;

import com.example.backend.model.Notification;
import com.example.backend.model.User;
import com.example.backend.repository.NotificationRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepo;

    @Autowired
    private UserRepository userRepo;

    @PostMapping("/follow")
    public Notification sendFollowRequest(
            @RequestParam String senderId,
            @RequestParam String receiverId
    ) {
        User sender = userRepo.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));

        String message = "You have a follow request from " + sender.getName();

        Notification notification = new Notification();
        notification.setSenderId(senderId);
        notification.setReceiverId(receiverId);
        notification.setMessage(message);
        notification.setIsRead(false);
        notification.setCreatedAt(new Date());

        return notificationRepo.save(notification);
    }

    // ✅ New: Send Like Notification
    @PostMapping("/like")
    public Notification sendLikeNotification(
            @RequestParam String senderId,
            @RequestParam String receiverId,
            @RequestParam String postTitle
    ) {
        User sender = userRepo.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));

        String message = sender.getName() + " liked your post: \"" + postTitle + "\"";

        Notification notification = new Notification();
        notification.setSenderId(senderId);
        notification.setReceiverId(receiverId);
        notification.setMessage(message);
        notification.setIsRead(false);
        notification.setCreatedAt(new Date());

        return notificationRepo.save(notification);
    }

    // ✅ New: Send Comment Notification
    @PostMapping("/comment")
    public Notification sendCommentNotification(
            @RequestParam String senderId,
            @RequestParam String receiverId,
            @RequestParam String postTitle
    ) {
        User sender = userRepo.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));

        String message = sender.getName() + " commented on your post: \"" + postTitle + "\"";

        Notification notification = new Notification();
        notification.setSenderId(senderId);
        notification.setReceiverId(receiverId);
        notification.setMessage(message);
        notification.setIsRead(false);
        notification.setCreatedAt(new Date());

        return notificationRepo.save(notification);
    }

    @GetMapping("/received")
    public List<Notification> getReceivedNotifications(
            @RequestParam String userId,
            @RequestParam(required = false) Boolean unreadOnly
    ) {
        if (Boolean.TRUE.equals(unreadOnly)) {
            return notificationRepo.findByReceiverIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        }
        return notificationRepo.findByReceiverIdOrderByCreatedAtDesc(userId);
    }

    @GetMapping("/for-receiver")
    public List<Notification> getNotificationsForReceiver(@RequestParam String receiverId) {
        return notificationRepo.findByReceiverIdOrderByCreatedAtDesc(receiverId);
    }

    @DeleteMapping("/clear")
    public ResponseEntity<?> clearNotifications(@RequestParam String receiverId) {
        try {
            notificationRepo.deleteByReceiverId(receiverId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error clearing notifications: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotification(@PathVariable String id) {
        if (!notificationRepo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        notificationRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
