package com.example.backend.repository;

import com.example.backend.model.FollowRequest;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface FollowRequestRepository extends MongoRepository<FollowRequest, String> {
    List<FollowRequest> findByReceiverIdAndStatus(String receiverId, String status);
    Optional<FollowRequest> findBySenderIdAndReceiverId(String senderId, String receiverId);
}
