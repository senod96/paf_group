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

@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true", allowedHeaders = "*", methods = {
        RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS })
@RestController
@RequestMapping("/applications")
public class JobApplicationController {

    @Autowired
    private JobPostRepository jobPostRepository;

    @Autowired
    private JobApplicationRepository jobApplicationRepository;

    // ✅ Upload and process CV and form fields
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

            // ✅ Extract text from uploaded CV
            PDDocument doc = PDDocument.load(file.getInputStream());
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(doc).toLowerCase();
            doc.close();

            // ✅ Match keywords
            String[] jobKeywords = (job.getSkillsNeeded() + "," + job.getWorkExperience())
                    .toLowerCase().split(",");
            int matchCount = 0;
            for (String keyword : jobKeywords) {
                if (!keyword.trim().isEmpty() && text.contains(keyword.trim())) {
                    matchCount++;
                }
            }

            // ✅ Save full application
            JobApplication app = new JobApplication();
            app.setUserId(userId);
            app.setJobId(jobId);
            app.setText(text);
            app.setMatchingKeywords(matchCount);
            app.setPosition(0); // default position

            app.setFullName(fullName);
            app.setAddress(address);
            app.setWorkExperience(workExperience);
            app.setAge(age);
            app.setGender(gender);
            app.setContactNumber(contactNumber);
            app.setEmail(email);

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

        List<JobApplication> top5 = all.stream()
                .sorted((a, b) -> b.getMatchingKeywords() - a.getMatchingKeywords())
                .limit(5)
                .collect(Collectors.toList());

        for (int i = 0; i < top5.size(); i++) {
            top5.get(i).setPosition(i + 1);
        }

        return top5;
    }

    // ✅ Get all applicants sorted by keyword matches
    @GetMapping("/{jobId}/all")
    public List<JobApplication> getAllApplicants(@PathVariable String jobId) {
        List<JobApplication> all = jobApplicationRepository.findByJobId(jobId);

        return all.stream()
                .sorted((a, b) -> b.getMatchingKeywords() - a.getMatchingKeywords())
                .collect(Collectors.toList());
    }

    // ✅ Delete an applicant
    @DeleteMapping("/{applicationId}")
    public ResponseEntity<String> deleteApplicant(@PathVariable String applicationId) {
        Optional<JobApplication> optionalApplication = jobApplicationRepository.findById(applicationId);
        if (optionalApplication.isPresent()) {
            jobApplicationRepository.deleteById(applicationId);
            return ResponseEntity.ok("Applicant deleted successfully");
        } else {
            return ResponseEntity.status(404).body("Applicant not found");
        }
    }
}
