package com.example.backend.repository;

import com.example.backend.model.LearningPlan;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LearningPlanRepository extends MongoRepository<LearningPlan, String> {

    // For user's own learning plans
    List<LearningPlan> findByUserId(String userId);

    // For fetching site-wide plans (admin-created)
    List<LearningPlan> findByType(String type);

    // For fetching only user-specific plans (type + userId)
    List<LearningPlan> findByUserIdAndType(String userId, String type);
}
