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
    private String description; // ✅ New
    private List<String> tags; // ✅ New
    private String date; // ✅ New (can be ISO string or formatted date)
    private int likes;

    private List<String> imageBase64List;
    private String videoBase64;

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

    public List<String> getImageBase64List() {
        return imageBase64List;
    }

    public String getVideoBase64() {
        return videoBase64;
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

    public void setImageBase64List(List<String> imageBase64List) {
        this.imageBase64List = imageBase64List;
    }

    public void setVideoBase64(String videoBase64) {
        this.videoBase64 = videoBase64;
    }
}
