package com.example.backend.controller;

import com.example.backend.model.Project;
import com.example.backend.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true", allowedHeaders = "*")
public class ProjectController {

    @Autowired
    private ProjectRepository projectRepo;

    @PostMapping
    public Project create(@RequestBody Project project) {
        project.setCreatedAt(new Date());
        project.setUpdatedAt(new Date());
        return projectRepo.save(project);
    }

    @GetMapping("/collaboration/{collabId}")
    public List<Project> getByCollaboration(@PathVariable String collabId) {
        return projectRepo.findByCollaborationId(collabId);
    }

    @PutMapping("/{id}")
    public Project update(@PathVariable String id, @RequestBody Project updated) {
        return projectRepo.findById(id).map(p -> {
            p.setTitle(updated.getTitle());
            p.setDescription(updated.getDescription());
            p.setUpdatedAt(new Date());
            return projectRepo.save(p);
        }).orElseThrow(() -> new RuntimeException("Project not found"));
    }
    @GetMapping("/{id}")
    public Project getProjectById(@PathVariable String id) {
        return projectRepo.findById(id).orElseThrow(() -> new RuntimeException("Project not found"));
    }
    
    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        projectRepo.deleteById(id);
    }
}
