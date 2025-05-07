package com.example.backend.controller;

import com.example.backend.model.JobApplication;
import com.example.backend.model.JobPost;
import com.example.backend.repository.JobApplicationRepository;
import com.example.backend.repository.JobPostRepository;
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

    @PostMapping("/{jobId}/apply")
    public ResponseEntity<String> uploadCvAndAnalyze(
            @PathVariable String jobId,
            @RequestParam("userId") String userId,
            @RequestParam("fullName") String fullName,
            @RequestParam("address") String address,
            @RequestParam("workExperience") String workExperience,
            @RequestParam("age") int age,
            @RequestParam("gender") String gender,
            @RequestParam("contactNumber") String contactNumber,
            @RequestParam("email") String email,
            @RequestParam("cv") MultipartFile file) {

        try {
            JobPost job = jobPostRepository.findById(jobId)
                    .orElseThrow(() -> new RuntimeException("Job not found"));

            // Extract text from CV
            PDDocument document = PDDocument.load(file.getInputStream());
            PDFTextStripper stripper = new PDFTextStripper();
            String extractedText = stripper.getText(document).toLowerCase();
            document.close();

            // Match keywords
            String[] jobKeywords = (job.getSkillsNeeded() + "," + job.getWorkExperience()).toLowerCase().split(",");
            int matchCount = 0;
            for (String keyword : jobKeywords) {
                if (!keyword.trim().isEmpty() && extractedText.contains(keyword.trim())) {
                    matchCount++;
                }
            }

            // Create application object
            JobApplication app = new JobApplication();
            app.setUserId(userId);
            app.setJobId(jobId);
            app.setFullName(fullName);
            app.setAddress(address);
            app.setWorkExperience(workExperience);
            app.setAge(age);
            app.setGender(gender);
            app.setContactNumber(contactNumber);
            app.setEmail(email);
            app.setText(extractedText);
            app.setMatchingKeywords(matchCount);
            app.setPosition(0); // unranked

            jobApplicationRepository.save(app);
            return ResponseEntity.ok("Uploaded and processed successfully");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error processing file: " + e.getMessage());
        }
    }

    @GetMapping("/{jobId}/top5")
    public List<JobApplication> getTop5Applicants(@PathVariable String jobId) {
        List<JobApplication> all = jobApplicationRepository.findByJobId(jobId);
        List<JobApplication> top5 = all.stream()
                .sorted((a, b) -> Integer.compare(b.getMatchingKeywords(), a.getMatchingKeywords()))
                .limit(5)
                .collect(Collectors.toList());

        for (int i = 0; i < top5.size(); i++) {
            top5.get(i).setPosition(i + 1);
        }

        return top5;
    }

    @GetMapping("/{jobId}/all")
    public List<JobApplication> getAllApplicants(@PathVariable String jobId) {
        return jobApplicationRepository.findByJobId(jobId);
    }
}
