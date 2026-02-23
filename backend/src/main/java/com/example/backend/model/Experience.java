package com.example.backend.model;

import java.io.Serializable;
import java.util.Date;

public class Experience implements Serializable {

    private String company;
    private String title;
    private Date startDate;
    private Date endDate;
    private String description;
    private String[] badges; 

    public Experience() {}

    
    public String getCompany() { return company; }
    public void setCompany(String company) { this.company = company; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public Date getStartDate() { return startDate; }
    public void setStartDate(Date startDate) { this.startDate = startDate; }

    public Date getEndDate() { return endDate; }
    public void setEndDate(Date endDate) { this.endDate = endDate; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String[] getBadges() { return badges; }
    public void setBadges(String[] badges) { this.badges = badges; }
}
