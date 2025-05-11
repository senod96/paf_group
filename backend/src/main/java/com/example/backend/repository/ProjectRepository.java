package com.example.backend.repository;

import com.example.backend.model.Project;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ProjectRepository extends MongoRepository<Project, String> {

    List<Project> findByCollaborationId(String collabId);
}
