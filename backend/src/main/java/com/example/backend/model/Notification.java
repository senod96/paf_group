package com.example.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.List;

@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;

    private String senderId;
    private String receiverId;
    private String message;
    private boolean isRead;
    private Date createdAt;
    private String type;
    private List<String> following; 

    // --- Getters ---
    public String getId() {
        return id;
    }

    public String getSenderId() {
        return senderId;
    }

    public String getReceiverId() {
        return receiverId;
    }

    public String getMessage() {
        return message;
    }

    public boolean isRead() {
        return isRead;
    }

    public Date getCreatedAt() {
        return createdAt;
    }
    public String getType() {
         return type;
    }
    public List<String> getFollowing() {
        return following;
    }
    // --- Setters ---
    public void setId(String id) {
        this.id = id;
    }

    public void setSenderId(String senderId) {
        this.senderId = senderId;
    }

    public void setReceiverId(String receiverId) {
        this.receiverId = receiverId;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public void setIsRead(boolean isRead) {
        this.isRead = isRead;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }
    public void setType(String type) { 
        this.type = type; 
    }
    public void setFollowing(List<String> following) {
        this.following = following;
    }
}



/*package com.example.backend.model;

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
    private boolean isRead;
    private Date createdAt;

    // --- Getters ---
    public String getId() {
        return id;
    }

    public String getSenderId() {
        return senderId;
    }

    public String getReceiverId() {
        return receiverId;
    }

    public String getMessage() {
        return message;
    }

    public boolean isRead() {
        return isRead;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    // --- Setters ---
    public void setId(String id) {
        this.id = id;
    }

    public void setSenderId(String senderId) {
        this.senderId = senderId;
    }

    public void setReceiverId(String receiverId) {
        this.receiverId = receiverId;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public void setIsRead(boolean isRead) {
        this.isRead = isRead;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }
}
*/