package com.example.backend.controller;

import com.example.backend.model.Post;
import com.example.backend.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true", allowedHeaders = "*", methods = {
        RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS })
public class PostController {

    @Autowired
    private PostRepository postRepository;

    // ✅ Get all posts
    @GetMapping
    public List<Post> getAllPosts() {
        return postRepository.findAll();
    }

    // ✅ Get a single post by custom postId field
    @GetMapping("/{id}")
    public Post getPostByPostId(@PathVariable String id) {
        return postRepository.findByPostId(id)
                .orElseThrow(() -> new RuntimeException("Post not found with ID: " + id));
    }

    // ✅ Create a new post
    @PostMapping
    public Post createPost(@RequestBody Post post) {
        return postRepository.save(post);
    }

    // ✅ Search posts by keyword
    @GetMapping("/search")
    public List<Post> searchPosts(@RequestParam("q") String query) {
        return postRepository.findByPostContainingIgnoreCase(query);
    }

    // ✅ Update post using custom postId
    @PutMapping("/{id}")
    public Post updatePost(@PathVariable String id, @RequestBody Post updatedPost) {
        Optional<Post> optionalPost = postRepository.findByPostId(id);
        if (optionalPost.isPresent()) {
            Post existingPost = optionalPost.get();

            existingPost.setUserId(updatedPost.getUserId());
            existingPost.setPost(updatedPost.getPost());
            existingPost.setDescription(updatedPost.getDescription());
            existingPost.setTags(updatedPost.getTags());
            existingPost.setDate(updatedPost.getDate());
            existingPost.setLikes(updatedPost.getLikes());
            existingPost.setImageUrls(updatedPost.getImageUrls());
            existingPost.setVideoUrl(updatedPost.getVideoUrl());

            return postRepository.save(existingPost);
        } else {
            throw new RuntimeException("Post not found with ID: " + id);
        }
    }

    // ✅ Delete post using custom postId
    @DeleteMapping("/{id}")
    public void deletePost(@PathVariable String id) {
        Optional<Post> optionalPost = postRepository.findByPostId(id);
        optionalPost.ifPresent(postRepository::delete);
    }

    // ✅ Updated Like/Unlike toggle method
    @PutMapping("/{id}/like")
    public Post likeOrUnlikePost(@PathVariable String id, @RequestParam String userId) {
        return postRepository.findById(id)
                .map(post -> {
                    if (post.getLikedBy() == null) {
                        post.setLikedBy(new ArrayList<>());
                    }
                    if (post.getLikedBy().contains(userId)) {
                        // 🔥 Already liked → Unlike
                        post.setLikes(Math.max(0, post.getLikes() - 1));
                        post.getLikedBy().remove(userId);
                    } else {
                        // 🔥 Not liked yet → Like
                        post.setLikes(post.getLikes() + 1);
                        post.getLikedBy().add(userId);
                    }
                    return postRepository.save(post);
                })
                .orElseThrow(() -> new RuntimeException("Post not found with ID: " + id));
    }
}
