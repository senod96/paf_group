package com.example.backend.repository;

import com.example.backend.model.Comment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface CommentRepository extends MongoRepository<Comment, String> {
    // Find comments by postId
    List<Comment> findByPostId(String postId);

    // Find comments by commentorId (user ID)
    List<Comment> findByCommentorId(String commentorId);

    // Find comments by parentCommentId (used for replies)
    List<Comment> findByParentCommentId(String parentCommentId);
}
