package com.example.backend.repository;
import org.springframework.data.mongodb.repository.Query;
import com.example.backend.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    Optional<User> findByVerificationToken(String token); // ✅ Add this
    @Query("{ 'name': { $regex: ?0, $options: 'i' } }")
    List<User> findByNameRegex(String name);
}
