package com.example.backend.controller;

import com.example.backend.model.Course;
import com.example.backend.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/courses")
@CrossOrigin(origins = "http://localhost:3000")
public class CourseController {

    @Autowired
    private CourseRepository courseRepository;

    @GetMapping
    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    @GetMapping("/{id}")
    public Course getCourseById(@PathVariable String id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found with ID: " + id));
    }

    @GetMapping("/instructor/{instructorId}")
    public List<Course> getCoursesByInstructor(@PathVariable String instructorId) {
        return courseRepository.findByInstructorId(instructorId);
    }

    @PostMapping
    public Course createCourse(@RequestBody Course course) {
        course.setCreatedAt(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));
        return courseRepository.save(course);
    }

    @PutMapping("/{id}")
    public Course updateCourse(@PathVariable String id, @RequestBody Course updatedCourse) {
        return courseRepository.findById(id)
                .map(course -> {
                    course.setTitle(updatedCourse.getTitle());
                    course.setDescription(updatedCourse.getDescription());
                    course.setCategory(updatedCourse.getCategory());
                    course.setDuration(updatedCourse.getDuration());
                    course.setLevel(updatedCourse.getLevel());
                    course.setRequirements(updatedCourse.getRequirements());
                    course.setWhatYouWillLearn(updatedCourse.getWhatYouWillLearn());
                    course.setImageUrl(updatedCourse.getImageUrl());
                    course.setVideoUrl(updatedCourse.getVideoUrl());
                    course.setQuiz(updatedCourse.getQuiz());
                    return courseRepository.save(course);
                })
                .orElseThrow(() -> new RuntimeException("Course not found with ID: " + id));
    }

    @DeleteMapping("/{id}")
    public void deleteCourse(@PathVariable String id) {
        courseRepository.deleteById(id);
    }

    @GetMapping("/search")
    public List<Course> searchCourses(@RequestParam("q") String query) {
        return courseRepository.findByTitleContainingIgnoreCaseOrDescriptionContainingIgnoreCase(query, query);
    }
    
}
