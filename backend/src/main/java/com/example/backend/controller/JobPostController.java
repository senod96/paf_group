package com.example.backend.controller;

import com.example.backend.model.JobPost;
import com.example.backend.repository.JobPostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
@RestController
@RequestMapping("/jobposts")
public class JobPostController {

    @Autowired
    private JobPostRepository jobPostRepository;

    // 🟢 Get all job posts
    @GetMapping
    public List<JobPost> getAllJobPosts() {
        return jobPostRepository.findAll();
    }

    // 🟢 Get job posts by user
    @GetMapping("/user/{userId}")
    public List<JobPost> getJobPostsByUserId(@PathVariable String userId) {
        return jobPostRepository.findByUserId(userId);
    }

    // 🟢 Get job posts by company
    @GetMapping("/company/{company}")
    public List<JobPost> getJobPostsByCompany(@PathVariable String company) {
        return jobPostRepository.findByCompany(company);
    }

    // 🟢 Get job posts by job title
    @GetMapping("/title/{jobTitle}")
    public List<JobPost> getJobPostsByJobTitle(@PathVariable String jobTitle) {
        return jobPostRepository.findByJobTitle(jobTitle);
    }

    // 🟢 Get single job post by ID
    @GetMapping("/{id}")
    public ResponseEntity<JobPost> getJobPostById(@PathVariable String id) {
        Optional<JobPost> jobPost = jobPostRepository.findById(id);
        return jobPost.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // 🟢 Create a new job post
    @PostMapping
    public JobPost createJobPost(@RequestBody JobPost post) {
        post.setPostedDate(new Date());
        return jobPostRepository.save(post);
    }

    // 🟢 Update an existing job post
    @PutMapping("/{id}")
    public ResponseEntity<JobPost> updateJobPost(@PathVariable String id, @RequestBody JobPost updatedPost) {
        Optional<JobPost> optional = jobPostRepository.findById(id);
        if (!optional.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        JobPost post = optional.get();

        if (updatedPost.getUserId() != null) {
            post.setUserId(updatedPost.getUserId());
        }
        if (updatedPost.getCompany() != null) {
            post.setCompany(updatedPost.getCompany());
        }
        if (updatedPost.getCompanyOverview() != null) {
            post.setCompanyOverview(updatedPost.getCompanyOverview());
        }
        if (updatedPost.getJobTitle() != null) {
            post.setJobTitle(updatedPost.getJobTitle());
        }
        if (updatedPost.getWorkExperience() != null) {
            post.setWorkExperience(updatedPost.getWorkExperience());
        }
        if (updatedPost.getSkillsNeeded() != null) {
            post.setSkillsNeeded(updatedPost.getSkillsNeeded());
        }
        if (updatedPost.getJobRoles() != null) {
            post.setJobRoles(updatedPost.getJobRoles());
        }
        if (updatedPost.getDescription() != null) {
            post.setDescription(updatedPost.getDescription());
        }

        post.setPostedDate(new Date()); // Update timestamp
        return ResponseEntity.ok(jobPostRepository.save(post));
    }

    // 🔴 Delete a job post
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJobPost(@PathVariable String id) {
        if (!jobPostRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        jobPostRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
