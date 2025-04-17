package com.example.backend.model;

import java.io.Serializable;

public class Links implements Serializable {

    private String github;
    private String linkedin;
    private String website;

    public Links() {}

    public String getGithub() {
        return github;
    }

    public void setGithub(String github) {
        this.github = github;
    }

    public String getLinkedin() {
        return linkedin;
    }

    public void setLinkedin(String linkedin) {
        this.linkedin = linkedin;
    }

    public String getWebsite() {
        return website;
    }

    public void setWebsite(String website) {
        this.website = website;
    }
}
