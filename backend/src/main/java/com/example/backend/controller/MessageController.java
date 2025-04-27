package com.example.backend.controller;

import com.example.backend.model.Message;
import com.example.backend.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class MessageController {

    @Autowired
    private MessageRepository messageRepo;

    @PostMapping
    public Message sendMessage(@RequestBody Message message) {
        message.setTimestamp(new Date());
        return messageRepo.save(message);
    }

    @GetMapping("/project/{projectId}")
    public List<Message> getProjectMessages(@PathVariable String projectId) {
        return messageRepo.findByProjectIdOrderByTimestampAsc(projectId);
    }
}
