package com.example.backend.controller;

import com.example.backend.model.User;
import com.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class UserController {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private JavaMailSender mailSender;

    private final String FROM_EMAIL = "bandaralahiru9@gmail.com";
    private final String APP_URL = "http://localhost:3000";

    // === LOGIN ===
    @PostMapping("/login")
    public Object login(@RequestBody LoginRequest request) {
        Optional<User> userOpt = userRepo.findByEmail(request.getEmail());

        if (userOpt.isEmpty()) {
            return new ErrorResponse("User not found");
        }

        User user = userOpt.get();

        if (!user.isVerified()) {
            return new ErrorResponse("Email not verified");
        }

        if (!user.getPassword().equals(request.getPassword())) {
            return new ErrorResponse("Invalid password");
        }

        return user;
    }

    static class LoginRequest {
        private String email;
        private String password;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    static class ErrorResponse {
        private String message;
        public ErrorResponse(String message) { this.message = message; }
        public String getMessage() { return message; }
    }

    // === CRUD & SEARCH ===
    @GetMapping
    public List<User> getAllUsers() {
        return userRepo.findAll();
    }

    @GetMapping("/{id}")
    public Optional<User> getUserById(@PathVariable String id) {
        return userRepo.findById(id);
    }

    @PostMapping
    public User createUser(@RequestBody User user) {
        user.setCreatedAt(new Date());
        user.setUpdatedAt(new Date());
        if (user.getSubscriptionType() == null) {
            user.setSubscriptionType("free");
        }
        return userRepo.save(user);
    }

    @GetMapping("/search")
    public List<User> searchUsers(@RequestParam String name) {
        return userRepo.findByNameRegex(name);
    }

    @PutMapping("/{id}")
    public User updateUser(@PathVariable String id, @RequestBody User updatedUser) {
    return userRepo.findById(id).map(user -> {
        user.setName(updatedUser.getName());
        user.setHeadline(updatedUser.getHeadline());
        user.setBio(updatedUser.getBio());
        user.setLocation(updatedUser.getLocation());
        user.setSkills(updatedUser.getSkills());
        user.setBackgroundImage(updatedUser.getBackgroundImage());
        user.setProfilePicture(updatedUser.getProfilePicture()); // ✅ Add this line!
        user.setExperience(updatedUser.getExperience());
        user.setEducation(updatedUser.getEducation());
        user.setLinks(updatedUser.getLinks());
        user.setMobile(updatedUser.getMobile());
        user.setUpdatedAt(new Date());
        user.setSubscriptionType(updatedUser.getSubscriptionType() != null ? updatedUser.getSubscriptionType() : user.getSubscriptionType());
        return userRepo.save(user);
    }).orElseThrow(() -> new RuntimeException("User not found"));
}


    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable String id) {
        userRepo.deleteById(id);
    }

    // === FOLLOW / UNFOLLOW ===
    @PostMapping("/{id}/follow/{targetId}")
    public User followUser(@PathVariable String id, @PathVariable String targetId) {
        User user = userRepo.findById(id).orElseThrow();
        User target = userRepo.findById(targetId).orElseThrow();

        if (!user.getFollowing().contains(targetId)) {
            user.getFollowing().add(targetId);
            target.getFollowers().add(id);
            userRepo.save(target);
        }
        return userRepo.save(user);
    }

    @PostMapping("/{id}/unfollow/{targetId}")
    public User unfollowUser(@PathVariable String id, @PathVariable String targetId) {
        User user = userRepo.findById(id).orElseThrow();
        User target = userRepo.findById(targetId).orElseThrow();

        user.getFollowing().remove(targetId);
        target.getFollowers().remove(id);
        userRepo.save(target);
        return userRepo.save(user);
    }

    // === REGISTRATION & VERIFICATION ===
    @PostMapping("/register")
    public User registerUser(@RequestBody User user) {
        if (userRepo.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered.");
        }

        user.setCreatedAt(new Date());
        user.setUpdatedAt(new Date());
        user.setVerified(false);
        user.setSubscriptionType("free");

        String token = UUID.randomUUID().toString();
        user.setVerificationToken(token);

        User savedUser = userRepo.save(user);

        SimpleMailMessage mail = new SimpleMailMessage();
        mail.setFrom(FROM_EMAIL);
        mail.setTo(user.getEmail());
        mail.setSubject("Verify your Skillora account");
        mail.setText("Hi " + user.getName() + ",\n\nClick to verify your account:\n" +
                APP_URL + "/verify?token=" + token + "\n\nThanks!");

        mailSender.send(mail);

        return savedUser;
    }
    // ✅ NEW ENDPOINT: Get users not followed by current user
@GetMapping("/{id}/suggestions")
public List<User> getSuggestions(@PathVariable String id) {
    User currentUser = userRepo.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
    Set<String> following = new HashSet<>(currentUser.getFollowing());
    following.add(id); // Exclude current user

    return userRepo.findAll().stream()
            .filter(user -> !following.contains(user.getId()))
            .limit(10) // Limit to top 10 suggestions
            .toList();
}

    @GetMapping("/verify")
    public String verifyUser(@RequestParam("token") String token) {
        Optional<User> optional = userRepo.findByVerificationToken(token);
        if (optional.isPresent()) {
            User user = optional.get();
            user.setVerified(true);
            user.setVerificationToken(null);
            userRepo.save(user);
            return "✅ Email verified successfully!";
        }
        return "❌ Invalid or expired token.";
    }

    // === GOOGLE LOGIN ===
    @PostMapping("/google-login")
    public User googleLogin(@RequestBody User googleUser) {
        Optional<User> existing = userRepo.findByEmail(googleUser.getEmail());
        if (existing.isPresent()) return existing.get();

        googleUser.setVerified(true);
        googleUser.setCreatedAt(new Date());
        googleUser.setUpdatedAt(new Date());
        googleUser.setSubscriptionType("free");

        return userRepo.save(googleUser);
    }

    // === SUBSCRIPTION UPDATE ===
    @PutMapping("/{id}/subscription")
    public User updateSubscription(@PathVariable String id, @RequestBody Map<String, String> body) {
        String newType = body.get("subscriptionType");
        return userRepo.findById(id).map(user -> {
            user.setSubscriptionType(newType);
            user.setUpdatedAt(new Date());
            return userRepo.save(user);
        }).orElseThrow(() -> new RuntimeException("User not found"));
    }
}

