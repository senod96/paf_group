package com.example.backend.controller;

import com.example.backend.model.User;
import com.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/badges")
@CrossOrigin(origins = "http://localhost:3000")
public class BadgeController {

    @Autowired
    private UserRepository userRepo;

    // 🎖️ Get all badges for a user
    @GetMapping("/{id}")
    public List<String> getUserBadges(@PathVariable String id) {
        User user = userRepo.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        return user.getBadges();
    }

    // 🎖️ Add a new badge to the user
    @PostMapping("/{id}/add")
    public User addBadge(@PathVariable String id, @RequestBody String badgeUrl) {
        User user = userRepo.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        if (!user.getBadges().contains(badgeUrl)) {
            user.getBadges().add(badgeUrl);
        }
        return userRepo.save(user);
    }

    // 🎖️ Set the current badge
    @PutMapping("/{id}/current")
    public User setCurrentBadge(@PathVariable String id, @RequestBody String badgeUrl) {
        User user = userRepo.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        if (!user.getBadges().contains(badgeUrl)) {
            throw new RuntimeException("Badge URL not found in user's badges.");
        }
        user.setCurrentBadge(badgeUrl);
        return userRepo.save(user);
    }

    // 🎖️ Remove a badge
    @DeleteMapping("/{id}/remove")
    public User removeBadge(@PathVariable String id, @RequestBody String badgeUrl) {
        User user = userRepo.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.getBadges().remove(badgeUrl);
        if (badgeUrl.equals(user.getCurrentBadge())) {
            user.setCurrentBadge(null); // Clear current badge if removed
        }
        return userRepo.save(user);
    }
}
