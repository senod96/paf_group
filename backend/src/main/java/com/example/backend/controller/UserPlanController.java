package com.example.backend.controller;

import com.example.backend.repository.LearningPlanRepository;
import com.example.backend.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.Optional;

@RestController
@RequestMapping("/userplans")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class UserPlanController {

    @Autowired
    private LearningPlanRepository learningPlanRepository;

    @PostMapping("/add")
    public ResponseEntity<String> addUserPlan(@RequestBody AddUserPlanRequest request) {
        Optional<LearningPlan> originalOpt = learningPlanRepository.findById(request.getPlanId());

        if (originalOpt.isEmpty() || !"site".equals(originalOpt.get().getType())) {
            return ResponseEntity.badRequest().body("Invalid site plan ID");
        }

        LearningPlan original = originalOpt.get();

        LearningPlan cloned = new LearningPlan();
        cloned.setUserId(request.getUserId());
        cloned.setType("my");
        cloned.setPlans(original.getPlans());
        cloned.setImage(original.getImage());
        cloned.setBadge(original.getBadge());
        cloned.setParentId(original.getId());
        cloned.setCreatedAt(new Date());
        cloned.setUpdatedAt(new Date());

        learningPlanRepository.save(cloned);

        return ResponseEntity.ok("Plan cloned successfully");
    }
}
