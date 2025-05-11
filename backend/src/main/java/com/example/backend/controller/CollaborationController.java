package com.example.backend.controller;

import com.example.backend.model.Collaboration;
import com.example.backend.repository.CollaborationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/collaborations")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true", allowedHeaders = "*")
public class CollaborationController {

    @Autowired
    private CollaborationRepository collabRepo;

    @PostMapping
    public Collaboration create(@RequestBody Collaboration collab) {
    System.out.println("🔥 Creating collab: " + collab.getName());
    return collabRepo.save(collab);
}


@GetMapping("/user/{userId}")
public List<Collaboration> getUserCollabs(@PathVariable String userId) {
    List<Collaboration> owned = collabRepo.findByCreatedBy(userId);
    List<Collaboration> memberOf = collabRepo.findByMembersContaining(userId);

    Map<String, Collaboration> unique = new LinkedHashMap<>();
    for (Collaboration c : owned) {
        unique.put(c.getId(), c);
    }
    for (Collaboration c : memberOf) {
        unique.put(c.getId(), c);
    }

    return new ArrayList<>(unique.values());
}

    @PutMapping("/{id}/members")
    public Collaboration addMembers(@PathVariable String id, @RequestBody List<String> userIds) {
        Collaboration collab = collabRepo.findById(id).orElseThrow();
        collab.getMembers().addAll(userIds);
        collab.setUpdatedAt(new Date());
        return collabRepo.save(collab);
    }

    @GetMapping("/{id}")
    public Collaboration getOne(@PathVariable String id) {
        return collabRepo.findById(id).orElseThrow();
    }

    @DeleteMapping("/{id}")
    public void deleteCollab(@PathVariable String id) {
        collabRepo.deleteById(id);
    }
}
