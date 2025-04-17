package com.example.backend.controller;

import com.example.backend.model.Comment;
import com.example.backend.repository.CommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/comments")
public class CommentController {

    @Autowired
    private CommentRepository commentRepository;

    // ✅ Create a new comment
    @PostMapping
    public Comment addComment(@RequestBody Comment comment) {
        return commentRepository.save(comment);
    }

    // ✅ Get all comments (optional)
    @GetMapping
    public List<Comment> getAllComments() {
        return commentRepository.findAll();
    }

    // ✅ Get comments by postId (used in CommentList)
    @GetMapping("/post/{postId}")
    public List<Comment> getCommentsByPostId(@PathVariable String postId) {
        return commentRepository.findByPostId(postId);
    }

    // ✅ Update a specific comment
    @PutMapping("/{commentId}")
    public Comment updateComment(@PathVariable String commentId, @RequestBody Comment updatedComment) {
        return commentRepository.findById(commentId)
                .map(existing -> {
                    existing.setComment(updatedComment.getComment());
                    existing.setLikes(updatedComment.getLikes());
                    return commentRepository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("Comment not found with ID: " + commentId));
    }

    // ✅ Delete a comment
    @DeleteMapping("/{commentId}")
    public void deleteComment(@PathVariable String commentId) {
        commentRepository.deleteById(commentId);
    }
}
