package com.example.backend.model;

import java.io.Serializable;
import java.util.Date;

public class JobPost implements Serializable {

    private String id;
    private String userId; // User who created the post
    private String company;
    private String companyOverview;
    private String jobTitle;
    private String workExperience; // e.g., "2+ years"
    private String skillsNeeded; // comma-separated
    private String jobRoles; // comma-separated
    private String description;
    private Date postedDate;

    public JobPost() {
    }

    // Getters
    public String getId() {
        return id;
    }

    public String getUserId() {
        return userId;
    }

    public String getCompany() {
        return company;
    }

    public String getCompanyOverview() {
        return companyOverview;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public String getWorkExperience() {
        return workExperience;
    }

    public String getSkillsNeeded() {
        return skillsNeeded;
    }

    public String getJobRoles() {
        return jobRoles;
    }

    public String getDescription() {
        return description;
    }

    public Date getPostedDate() {
        return postedDate;
    }

    // Setters
    public void setId(String id) {
        this.id = id;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public void setCompanyOverview(String companyOverview) {
        this.companyOverview = companyOverview;
    }

    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }

    public void setWorkExperience(String workExperience) {
        this.workExperience = workExperience;
    }

    public void setSkillsNeeded(String skillsNeeded) {
        this.skillsNeeded = skillsNeeded;
    }

    public void setJobRoles(String jobRoles) {
        this.jobRoles = jobRoles;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setPostedDate(Date postedDate) {
        this.postedDate = postedDate;
    }
}
