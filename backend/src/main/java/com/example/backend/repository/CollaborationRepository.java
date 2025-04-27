package com.example.backend.repository;

import com.example.backend.model.Collaboration;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface CollaborationRepository extends MongoRepository<Collaboration, String> {

    List<Collaboration> findByCreatedBy(String userId);

    List<Collaboration> findByMembersContaining(String userId);
}
