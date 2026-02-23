package com.example.backend.repository;

import com.example.backend.model.Notification;

import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface NotificationRepository extends MongoRepository<Notification, String> {
    List<Notification> findByReceiverIdOrderByCreatedAtDesc(String receiverId);
    List<Notification> findByReceiverIdAndIsReadFalseOrderByCreatedAtDesc(String receiverId);
    void deleteByReceiverId(String receiverId);
    List<Notification> findByFollowingContaining(String userId);
    boolean existsByReceiverIdAndMessageContaining(String receiverId, String keyword);

}




/*package com.example.backend.repository;

import com.example.backend.model.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface NotificationRepository extends MongoRepository<Notification, String> {
    List<Notification> findByReceiverIdOrderByCreatedAtDesc(String receiverId);
    List<Notification> findByReceiverIdAndIsReadFalseOrderByCreatedAtDesc(String receiverId);
    boolean existsByReceiverIdAndMessageContaining(String receiverId, String keyword);
    void deleteByReceiverId(String receiverId);
}
*/