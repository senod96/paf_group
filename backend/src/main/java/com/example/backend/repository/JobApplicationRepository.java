package com.example.backend.repository;

import com.example.backend.model.JobApplication;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface JobApplicationRepository extends MongoRepository<JobApplication, String> {
    List<JobApplication> findByJobId(String jobId);
}
