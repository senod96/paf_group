package com.example.backend.controller;

import com.example.backend.model.LearningPlan;
import com.example.backend.repository.LearningPlanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/learningplans")
public class LearningPlanController {

    @Autowired
    private LearningPlanRepository learningPlanRepository;

    // 🟢 Get ALL learning plans
    @GetMapping
    public List<LearningPlan> getAllPlans() {
        return learningPlanRepository.findAll();
    }

    // 🟢 Get learning plans for a specific user
    @GetMapping("/user/{userId}")
    public List<LearningPlan> getPlansByUserId(@PathVariable String userId) {
        return learningPlanRepository.findByUserId(userId);
    }

    // 🟢 Get single plan by ID
    @GetMapping("/{id}")
    public ResponseEntity<LearningPlan> getPlanById(@PathVariable String id) {
        Optional<LearningPlan> plan = learningPlanRepository.findById(id);
        return plan.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // 🟢 Create new learning plan
    @PostMapping
    public LearningPlan createPlan(@RequestBody LearningPlan plan) {
        plan.setCreatedAt(new Date());
        plan.setUpdatedAt(new Date());
        return learningPlanRepository.save(plan);
    }

    // 🟢 Update existing plan by ID
    @PutMapping("/{id}")
    public ResponseEntity<LearningPlan> updatePlan(@PathVariable String id, @RequestBody LearningPlan updatedPlan) {
        Optional<LearningPlan> optional = learningPlanRepository.findById(id);
        if (!optional.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        LearningPlan plan = optional.get();

        // Optional fields update
        if (updatedPlan.getUserId() != null) {
            plan.setUserId(updatedPlan.getUserId());
        }

        if (updatedPlan.getPlans() != null && !updatedPlan.getPlans().isEmpty()) {
            plan.setPlans(updatedPlan.getPlans());
        }

        plan.setUpdatedAt(new Date());
        return ResponseEntity.ok(learningPlanRepository.save(plan));
    }

    // 🔴 Delete a plan
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePlan(@PathVariable String id) {
        if (!learningPlanRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        learningPlanRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
