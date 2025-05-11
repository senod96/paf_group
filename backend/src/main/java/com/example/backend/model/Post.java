package com.example.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Document(collection = "posts")
public class Post {

    @Id
    private String postId;

    private String userId;
    private String post;
    private String description;
    private List<String> tags;
    private String date;
    private int likes;

    // ✅ Media fields (Firebase URLs)
    private List<String> imageUrls;
    private String videoUrl;

    // ✅ 🆕 LikedBy field
    private List<String> likedBy;

    // --- Getters ---
    public String getPostId() {
        return postId;
    }

    public String getUserId() {
        return userId;
    }

    public String getPost() {
        return post;
    }

    public String getDescription() {
        return description;
    }

    public List<String> getTags() {
        return tags;
    }

    public String getDate() {
        return date;
    }

    public int getLikes() {
        return likes;
    }

    public List<String> getImageUrls() {
        return imageUrls;
    }

    public String getVideoUrl() {
        return videoUrl;
    }

    public List<String> getLikedBy() {
        return likedBy;
    }

    // --- Setters ---
    public void setPostId(String postId) {
        this.postId = postId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public void setPost(String post) {
        this.post = post;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public void setLikes(int likes) {
        this.likes = likes;
    }

    public void setImageUrls(List<String> imageUrls) {
        this.imageUrls = imageUrls;
    }

    public void setVideoUrl(String videoUrl) {
        this.videoUrl = videoUrl;
    }

    public void setLikedBy(List<String> likedBy) {
        this.likedBy = likedBy;
    }
}
