package com.example.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;

@Document(collection = "notifications")
public class Notification {
    @Id
    private String id;
    private String senderId;
    private String receiverId;
    private String message;
    private boolean isRead = false;
    private Date createdAt = new Date();

    // Constructors, getters, and setters
    public Notification() {}

    public Notification(String senderId, String receiverId, String message) {
        this.senderId = senderId;
        this.receiverId = receiverId;
        this.message = message;
    }

    // Getter and Setter for id
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    // Getter and Setter for senderId
    public String getSenderId() {
        return senderId;
    }

    public void setSenderId(String senderId) {
        this.senderId = senderId;
    }

    // Getter and Setter for receiverId
    public String getReceiverId() {
        return receiverId;
    }

    public void setReceiverId(String receiverId) {
        this.receiverId = receiverId;
    }

    // Getter and Setter for message
    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    // Getter and Setter for isRead
    public boolean isRead() {
        return isRead;
    }

    public void setRead(boolean isRead) {
        this.isRead = isRead;
    }

    // Getter and Setter for createdAt
    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }
}
