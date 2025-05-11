package com.example.backend.controller;

import com.example.backend.model.Comment;
import com.example.backend.repository.CommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
@RestController
@RequestMapping("/api/comments")
public class CommentController {

    @Autowired
    private CommentRepository commentRepository;

    // ✅ Create a new comment (including replies)
    @PostMapping
    public Comment addComment(@RequestBody Comment comment) {
        comment.setTimestamp(java.time.LocalDateTime.now()); // Set current timestamp
        
        // If the comment has a parentCommentId, it's a reply
        if (comment.getParentCommentId() != null) {
            // Handle the reply logic (if needed, you may want to do something specific here)
        }

        // Save and return the comment/reply
        return commentRepository.save(comment);
    }

    // ✅ Get comments by postId, including replies (used in CommentList)
    @GetMapping("/post/{postId}")
    public List<Comment> getCommentsByPostId(@PathVariable String postId) {
        List<Comment> comments = commentRepository.findByPostId(postId);

        // Fetch replies for each comment
        comments.forEach(comment -> {
            List<Comment> replies = commentRepository.findByParentCommentId(comment.getCommentId());
            comment.setReplies(replies); // Attach replies to the comment
        });

        // Return only top-level comments (filter out replies)
        return comments.stream()
            .filter(comment -> comment.getParentCommentId() == null) // Filter out replies from top-level comments
            .toList();
    }

    // ✅ Get comments by commentorId (user ID)
    @GetMapping("/user/{userId}")
    public List<Comment> getCommentsByUserId(@PathVariable String userId) {
        List<Comment> comments = commentRepository.findByCommentorId(userId);

        // Format timestamps and handle replies
        comments.forEach(comment -> {
            List<Comment> replies = commentRepository.findByParentCommentId(comment.getCommentId());
            comment.setReplies(replies); // Attach replies to the comment
        });

        return comments;
    }


    // ✅ Delete a comment with ownership check and cascading delete of replies
    @DeleteMapping("/{commentId}/{userId}")
    public void deleteComment(@PathVariable String commentId, @PathVariable String userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found with ID: " + commentId));

        // Check if the user trying to delete the comment is the one who posted it
        if (!comment.getCommentorId().equals(userId)) {
            throw new RuntimeException("You are not authorized to delete this comment.");
        }

        // Delete all replies to this comment (cascade delete)
        List<Comment> replies = commentRepository.findByParentCommentId(commentId);
        for (Comment reply : replies) {
            commentRepository.deleteById(reply.getCommentId());
        }

        // Now delete the parent comment itself
        commentRepository.deleteById(commentId);
    }

@PutMapping("/{commentId}")
public ResponseEntity<Comment> updateComment(@PathVariable String commentId, @RequestBody Comment updatedComment) {
    return commentRepository.findById(commentId)
            .map(existing -> {
                existing.setComment(updatedComment.getComment());
                existing.setLikes(updatedComment.getLikes());
                Comment savedComment = commentRepository.save(existing);
                return ResponseEntity.ok(savedComment); // Return the updated comment
            })
            .orElseGet(() -> ResponseEntity.notFound().build()); // Return 404 if not found
}


}
