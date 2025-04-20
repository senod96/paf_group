package com.example.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document("job_applications")
public class JobApplication {

    @Id
    private String id;

    private String userId;
    private String jobId;
    private String text;
    private int matchingKeywords;
    private int position; // 1-5 if ranked

    // Getters & setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getJobId() {
        return jobId;
    }

    public void setJobId(String jobId) {
        this.jobId = jobId;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public int getMatchingKeywords() {
        return matchingKeywords;
    }

    public void setMatchingKeywords(int matchingKeywords) {
        this.matchingKeywords = matchingKeywords;
    }

    public int getPosition() {
        return position;
    }

    public void setPosition(int position) {
        this.position = position;
    }
}
