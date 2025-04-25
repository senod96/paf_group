package com.example.backend.controller;

import com.example.backend.model.Notification;
import com.example.backend.model.User;
import com.example.backend.repository.NotificationRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:3000")
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
        // Get sender's details
        User sender = userRepo.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
    
        // Create notification message with sender's name
        String message = "You have a follow request from " + sender.getName();
        
        Notification notification = new Notification(senderId, receiverId, message);
        return notificationRepo.save(notification);
    }
    @GetMapping("/received")
    public List<Notification> getReceivedNotifications(
            @RequestParam String userId,
            @RequestParam(required = false) Boolean unreadOnly
    ) {
        if (unreadOnly != null && unreadOnly) {
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
        return ResponseEntity.status(500).body("Error clearing notifications");
    }
}


@DeleteMapping("/{id}")
public ResponseEntity<?> deleteNotification(@PathVariable String id) {
    try {
        if (!notificationRepo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        notificationRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    } catch (Exception e) {
        return ResponseEntity.internalServerError()
                .body("Error deleting notification: " + e.getMessage());
    }
}

}