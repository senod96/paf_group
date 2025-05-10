package com.example.backend.repository;

import com.example.backend.model.LearningPlan;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;

import java.util.List;

@Repository
public interface LearningPlanRepository extends MongoRepository<LearningPlan, String> {
    List<LearningPlan> findByUserId(String userId);

}
