package com.example.backend.controller;
import java.text.ParseException;

import com.example.backend.model.Task;
import com.example.backend.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.text.SimpleDateFormat;
import java.util.*;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true", allowedHeaders = "*")
public class TaskController {

    @Autowired
    private TaskRepository taskRepo;

    @PostMapping
    public Task create(@RequestBody Task task) {
        task.setCreatedAt(new Date());
        task.setUpdatedAt(new Date());
        task.setStatus("free");
        return taskRepo.save(task);
    }

    @PutMapping("/{taskId}/assign")
public Task assignTask(
    @PathVariable String taskId,
    @RequestParam String userId,
    @RequestParam String deadline
) {
    Task task = taskRepo.findById(taskId).orElseThrow();
    task.setAssignedTo(userId);
    task.setStatus("assigned");

    try {
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm");
        task.setDeadline(formatter.parse(deadline));
    } catch (ParseException e) {
        throw new RuntimeException("Invalid deadline format", e);
    }

    return taskRepo.save(task);
}


    @PutMapping("/{id}/status")
    public Task updateStatus(@PathVariable String id, @RequestParam String status) {
        Task task = taskRepo.findById(id).orElseThrow();
        task.setStatus(status);
        task.setUpdatedAt(new Date());
        return taskRepo.save(task);
    }

    @PutMapping("/{id}")
    public Task updateTask(@PathVariable String id, @RequestBody Task updated) {
        return taskRepo.findById(id).map(t -> {
            t.setTitle(updated.getTitle());
            t.setUpdatedAt(new Date());
            return taskRepo.save(t);
        }).orElseThrow(() -> new RuntimeException("Task not found"));
    }

    @GetMapping("/project/{projectId}")
    public List<Task> getByProject(@PathVariable String projectId) {
        return taskRepo.findByProjectId(projectId);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        taskRepo.deleteById(id);
    }
}
