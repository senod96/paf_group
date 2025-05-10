package com.example.backend.repository;

import com.example.backend.model.JobPost;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobPostRepository extends MongoRepository<JobPost, String> {
    List<JobPost> findByUserId(String userId);

    List<JobPost> findByCompany(String company);

    List<JobPost> findByJobTitle(String jobTitle);
}
