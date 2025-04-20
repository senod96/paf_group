package com.example.backend.controller;

import com.example.backend.model.JobPost;
import com.example.backend.model.JobApplication;
import com.example.backend.repository.JobPostRepository;
import com.example.backend.repository.JobApplicationRepository;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*")
@RestController
@RequestMapping("/applications")
public class JobApplicationController {

    @Autowired
    private JobPostRepository jobPostRepository;

    @Autowired
    private JobApplicationRepository jobApplicationRepository;

    // ✅ Upload and process CV
    @PostMapping("/{jobId}/apply")
    public ResponseEntity<String> uploadCvAndAnalyze(
            @PathVariable String jobId,
            @RequestParam("userId") String userId,
            @RequestParam("cv") MultipartFile file) {

        try {
            JobPost job = jobPostRepository.findById(jobId)
                    .orElseThrow(() -> new RuntimeException("Job not found"));

            // Extract text using PDFBox
            PDDocument doc = PDDocument.load(file.getInputStream());
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(doc).toLowerCase();
            doc.close();

            // Match keywords from skillsNeeded + workExperience
            String[] jobKeywords = (job.getSkillsNeeded() + "," + job.getWorkExperience())
                    .toLowerCase().split(",");
            int matchCount = 0;
            for (String keyword : jobKeywords) {
                if (!keyword.trim().isEmpty() && text.contains(keyword.trim())) {
                    matchCount++;
                }
            }

            // Save application
            JobApplication app = new JobApplication();
            app.setUserId(userId);
            app.setJobId(jobId);
            app.setText(text);
            app.setMatchingKeywords(matchCount);
            app.setPosition(0); // Will be assigned in top5 endpoint

            jobApplicationRepository.save(app);

            return ResponseEntity.ok("Uploaded and processed successfully");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error processing file: " + e.getMessage());
        }
    }

    // ✅ Get top 5 ranked applicants
    @GetMapping("/{jobId}/top5")
    public List<JobApplication> getTop5Applicants(@PathVariable String jobId) {
        List<JobApplication> all = jobApplicationRepository.findByJobId(jobId);

        // Sort by matchingKeywords descending
        List<JobApplication> top5 = all.stream()
                .sorted((a, b) -> b.getMatchingKeywords() - a.getMatchingKeywords())
                .limit(5)
                .collect(Collectors.toList());

        // Assign rank (position) to top 5
        for (int i = 0; i < top5.size(); i++) {
            top5.get(i).setPosition(i + 1);
        }

        return top5;
    }

    // ✅ (Optional) Get all applicants for a job
    @GetMapping("/{jobId}/all")
    public List<JobApplication> getAllApplicants(@PathVariable String jobId) {
        return jobApplicationRepository.findByJobId(jobId);
    }
}
