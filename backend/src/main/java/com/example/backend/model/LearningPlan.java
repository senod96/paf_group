package com.example.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.List;

@Document(collection = "learningplans")
public class LearningPlan {

    @Id
    private String id;

    private String userId;
    private Date createdAt;
    private Date updatedAt;
    private String type; // "site" or "my"
    private String image; // badge or plan preview image
    private String parentId; // reference to original site plan (optional)
    private String badge; // URL of the badge image
    private List<PlanItem> plans;

    // Inner class 1: Main Plan item
    public static class PlanItem {
        private String mainTitle;
        private List<TodoTask> tasks;

        // Getters & Setters
        public String getMainTitle() { return mainTitle; }
        public void setMainTitle(String mainTitle) { this.mainTitle = mainTitle; }

        public List<TodoTask> getTasks() { return tasks; }
        public void setTasks(List<TodoTask> tasks) { this.tasks = tasks; }
    }

    // Inner class 2: Todo Task inside PlanItem
    public static class TodoTask {
        private String title;
        private String description;
        private String status;
        private String startTime;
        private String endTime;

        // Getters & Setters
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public String getStartTime() { return startTime; }
        public void setStartTime(String startTime) { this.startTime = startTime; }

        public String getEndTime() { return endTime; }
        public void setEndTime(String endTime) { this.endTime = endTime; }
    }

    // === LearningPlan getters/setters ===
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }
    public String getBadge() {
        return badge;
    }
    
    public void setBadge(String badge) {
        this.badge = badge;
    }
    
    public String getParentId() { return parentId; }
    public void setParentId(String parentId) { this.parentId = parentId; }
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }

    public Date getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Date updatedAt) { this.updatedAt = updatedAt; }

    public List<PlanItem> getPlans() { return plans; }
    public void setPlans(List<PlanItem> plans) { this.plans = plans; }
}
