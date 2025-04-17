package com.example.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "comments")
public class Comment {

    @Id
    private String commentId;

    private String postId;
    private String commentorId; // 🔥 New field
    private String comment;
    private int likes = 0; // 🔥 Default like count set to 0

    // --- Getters ---
    public String getCommentId() {
        return commentId;
    }

    public String getPostId() {
        return postId;
    }

    public String getCommentorId() {
        return commentorId;
    }

    public String getComment() {
        return comment;
    }

    public int getLikes() {
        return likes;
    }

    // --- Setters ---
    public void setCommentId(String commentId) {
        this.commentId = commentId;
    }

    public void setPostId(String postId) {
        this.postId = postId;
    }

    public void setCommentorId(String commentorId) {
        this.commentorId = commentorId;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public void setLikes(int likes) {
        this.likes = likes;
    }
}
