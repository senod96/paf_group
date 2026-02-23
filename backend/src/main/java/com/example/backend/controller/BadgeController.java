package com.example.backend.controller;

import com.example.backend.model.User;
import com.example.backend.model.LearningPlan;
import com.example.backend.repository.UserRepository;
import com.example.backend.repository.LearningPlanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/badges")
@CrossOrigin(origins = "http://localhost:3000")
public class BadgeController {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private LearningPlanRepository learningPlanRepo;

    // 🎖️ Get all badges for a user
    @GetMapping("/user/{id}")
    public List<String> getUserBadges(@PathVariable String id) {
        User user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getBadges();
    }

    // 🎖️ Add a new badge to the user
    @PostMapping("/user/{id}/add")
    public User addBadge(@PathVariable String id, @RequestBody String badgeUrl) {
        badgeUrl = cleanBadgeUrl(badgeUrl); // Remove any extra quotes

        User user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getBadges().contains(badgeUrl)) {
            user.getBadges().add(badgeUrl);
        }

        return userRepo.save(user);
    }

    // 🎖️ Set the current badge for a user
    @PutMapping("/user/{id}/current")
    public User setCurrentBadge(@PathVariable String id, @RequestBody String badgeUrl) {
        badgeUrl = cleanBadgeUrl(badgeUrl); // Remove any extra quotes

        User user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getBadges().contains(badgeUrl)) {
            throw new RuntimeException("Badge URL not found in user's badges.");
        }

        user.setCurrentBadge(badgeUrl);
        return userRepo.save(user);
    }

    // 🎖️ Remove a badge from the user
    @DeleteMapping("/user/{id}/remove")
    public User removeBadge(@PathVariable String id, @RequestBody String badgeUrl) {
        badgeUrl = cleanBadgeUrl(badgeUrl); // Remove any extra quotes

        User user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.getBadges().remove(badgeUrl);

        if (badgeUrl.equals(user.getCurrentBadge())) {
            user.setCurrentBadge(null);
        }

        return userRepo.save(user);
    }

    // 🎖️ Get the Badge URL directly by Learning Plan ID
    @GetMapping("/plan/{learningPlanId}")
    public String getBadgeByPlanId(@PathVariable String learningPlanId) {
        LearningPlan plan = learningPlanRepo.findById(learningPlanId)
                .orElseThrow(() -> new RuntimeException("Learning Plan not found."));
        return plan.getBadge();
    }

    // ✅ Utility Method to Clean Badge URL (Remove Quotes)
    private String cleanBadgeUrl(String url) {
        return url.replaceAll("^\"|\"$", "");
    }
}
