package com.example.backend.controller;

import com.example.backend.model.FollowRequest;
import com.example.backend.model.User;
import com.example.backend.repository.FollowRequestRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})

@RestController
@RequestMapping("/api/follow-requests")
public class FollowRequestController {

    @Autowired
    private FollowRequestRepository requestRepo;

    @Autowired
    private UserRepository userRepo;

    @PostMapping("/send")
    public FollowRequest sendRequest(@RequestBody FollowRequest req) {
        // Prevent duplicate requests in either direction
        Optional<FollowRequest> existing = requestRepo.findBySenderIdAndReceiverId(req.getSenderId(), req.getReceiverId());
        Optional<FollowRequest> reverse = requestRepo.findBySenderIdAndReceiverId(req.getReceiverId(), req.getSenderId());

        if (existing.isPresent() || reverse.isPresent()) {
            throw new RuntimeException("Follow request already exists between these users.");
        }

        // Optional: prevent request if already followed
        User sender = userRepo.findById(req.getSenderId()).orElseThrow();
        if (sender.getFollowing().contains(req.getReceiverId())) {
            throw new RuntimeException("You already follow this user.");
        }

        req.setStatus("pending");
        req.setCreatedAt(new Date());
        return requestRepo.save(req);
    }

    @GetMapping("/pending/{userId}")
    public List<FollowRequest> getPendingRequests(@PathVariable String userId) {
        return requestRepo.findByReceiverIdAndStatus(userId, "pending");
    }

    @PutMapping("/{id}/accept")
    public String acceptRequest(@PathVariable String id) {
        FollowRequest req = requestRepo.findById(id).orElseThrow();
        req.setStatus("accepted");
        requestRepo.save(req);

        User sender = userRepo.findById(req.getSenderId()).orElseThrow();
        User receiver = userRepo.findById(req.getReceiverId()).orElseThrow();

        if (!sender.getFollowing().contains(receiver.getId())) {
            sender.getFollowing().add(receiver.getId());
        }

        if (!receiver.getFollowers().contains(sender.getId())) {
            receiver.getFollowers().add(sender.getId());
        }

        userRepo.save(sender);
        userRepo.save(receiver);

        return "Request accepted";
    }

    @PutMapping("/{id}/reject")
    public String rejectRequest(@PathVariable String id) {
        FollowRequest req = requestRepo.findById(id).orElseThrow();
        req.setStatus("rejected");
        requestRepo.save(req);
       
        return "Request rejected";
    }
    
}
