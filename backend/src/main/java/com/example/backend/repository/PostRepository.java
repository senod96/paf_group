package com.example.backend.repository;

import com.example.backend.model.Post;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface PostRepository extends MongoRepository<Post, String> {

    // Search posts by keyword in content
    List<Post> findByPostContainingIgnoreCase(String keyword);

    // 🔍 Find a post by custom postId field (not _id)
    Optional<Post> findByPostId(String postId);
}
