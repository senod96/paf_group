import React, { useState } from "react";

const AddJob = () => {
  const [form, setForm] = useState({
    userId: localStorage.getItem("user") || "",
    company: "",
    companyOverview: "",
    jobTitle: "",
    workExperience: "",
    skillsNeeded: "",
    jobRoles: "",
    description: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:8080/jobposts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setMessage("✅ Job post created successfully!");
        setForm({
          userId: form.userId,
          company: "",
          companyOverview: "",
          jobTitle: "",
          workExperience: "",
          skillsNeeded: "",
          jobRoles: "",
          description: "",
        });
      } else {
        setMessage("❌ Failed to create job post.");
      }
    } catch (err) {
      console.error("Error:", err);
      setMessage("❌ Error occurred while creating job post.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded">
      <h2 className="text-xl font-semibold mb-4">Add Job Post</h2>
      {message && <p className="mb-4 text-sm">{message}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="company"
          value={form.company}
          onChange={handleChange}
          placeholder="Company"
          required
          className="w-full border p-2 rounded"
        />

        <textarea
          name="companyOverview"
          value={form.companyOverview}
          onChange={handleChange}
          placeholder="Company Overview"
          required
          className="w-full border p-2 rounded"
        />

        <input
          type="text"
          name="jobTitle"
          value={form.jobTitle}
          onChange={handleChange}
          placeholder="Job Title"
          required
          className="w-full border p-2 rounded"
        />

        <input
          type="text"
          name="workExperience"
          value={form.workExperience}
          onChange={handleChange}
          placeholder="Work Experience (e.g. 2+ years)"
          required
          className="w-full border p-2 rounded"
        />

        <input
          type="text"
          name="skillsNeeded"
          value={form.skillsNeeded}
          onChange={handleChange}
          placeholder="Skills (comma-separated)"
          required
          className="w-full border p-2 rounded"
        />

        <input
          type="text"
          name="jobRoles"
          value={form.jobRoles}
          onChange={handleChange}
          placeholder="Job Roles (comma-separated)"
          required
          className="w-full border p-2 rounded"
        />

        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Job Description"
          required
          className="w-full border p-2 rounded"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Post Job
        </button>
      </form>
    </div>
  );
};

export default AddJob;
