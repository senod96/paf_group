package com.example.backend.service;

import com.example.backend.model.LearningPlan;
import com.example.backend.model.Notification;
import com.example.backend.repository.LearningPlanRepository;
import com.example.backend.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class LearningPlanDeadlineChecker {

    @Autowired
    private LearningPlanRepository learningPlanRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd"); // match your date format

    @Scheduled(cron = "0 0 * * * *") // Every hour
    public void checkLearningPlanDeadlines() {
        LocalDate today = LocalDate.now();

        List<LearningPlan> allPlans = learningPlanRepository.findAll(); // Get all plans

        for (LearningPlan plan : allPlans) {
            if (plan.getPlans() == null) continue;

            for (LearningPlan.PlanItem planItem : plan.getPlans()) {
                if (planItem.getTasks() == null) continue;

                for (LearningPlan.TodoTask task : planItem.getTasks()) {
                    try {
                        if (task.getEndTime() != null && !task.getEndTime().isEmpty()) {
                            LocalDate taskEndDate = LocalDate.parse(task.getEndTime(), formatter);

                            // Check if the task deadline is today or overdue
                            if (!taskEndDate.isAfter(today)) {
                                // Check if notification already sent for this task
                                boolean alreadyNotified = notificationRepository.existsByReceiverIdAndMessageContaining(
                                    plan.getUserId(),
                                    task.getTitle()
                                );
                                

                                if (!alreadyNotified) {
                                    Notification notification = new Notification();
                                    notification.setReceiverId(plan.getUserId());
                                    notification.setMessage("Your task '" + task.getTitle() + "' in plan '" + planItem.getMainTitle() + "' has reached its deadline.");
                                    notification.setCreatedAt(new java.util.Date());

                                    notificationRepository.save(notification);
                                }
                            }
                        }
                    } catch (Exception e) {
                        System.err.println("Error parsing date for task: " + task.getTitle());
                    }
                }
            }
        }
    }
}
