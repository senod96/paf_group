package com.example.backend.model;

import org.springframework.data.annotation.Id;
import java.util.Date;

public class Message {

    @Id
    private String id;

    private String projectId;
    private String senderId;
    private String content;

    private Date timestamp = new Date();

    public Message() {}

    // Getters & Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getProjectId() { return projectId; }
    public void setProjectId(String projectId) { this.projectId = projectId; }

    public String getSenderId() { return senderId; }
    public void setSenderId(String senderId) { this.senderId = senderId; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public Date getTimestamp() { return timestamp; }
    public void setTimestamp(Date timestamp) { this.timestamp = timestamp; }
}
