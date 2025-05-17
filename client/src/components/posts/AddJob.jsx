import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Settings } from "lucide-react";

const AddJob = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );
  const [showSettings, setShowSettings] = useState(false);

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

  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

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
          ...form,
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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 font-sans">
      {/* Top Navigation Bar */}
      <div className="dark:bg-gray-800/80 dark:text-gray-100 bg-white/80 backdrop-blur-sm shadow-sm px-6 py-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
        <h1
          className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent dark:from-blue-400 dark:to-blue-300 cursor-pointer"
          onClick={() => navigate("/admin")}
        >
          Skillora Admin
        </h1>
        <div className="relative">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          {showSettings && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 overflow-hidden">
              <button
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center gap-2"
                onClick={() => setDarkMode(!darkMode)}
              >
                {darkMode ? (
                  <>
                    <span>☀️</span> Light Mode
                  </>
                ) : (
                  <>
                    <span>🌙</span> Dark Mode
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Page Title */}
      <div className="px-6 pt-10 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600 mb-6">
          Add New Job Post
        </h2>

        {/* Job Form Card */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
          {message && (
            <p className="mb-4 text-sm font-medium text-green-600 dark:text-green-400">
              {message}
            </p>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="company"
              value={form.company}
              onChange={handleChange}
              placeholder="Company"
              required
              className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <textarea
              name="companyOverview"
              value={form.companyOverview}
              onChange={handleChange}
              placeholder="Company Overview"
              required
              className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <input
              type="text"
              name="jobTitle"
              value={form.jobTitle}
              onChange={handleChange}
              placeholder="Job Title"
              required
              className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <input
              type="text"
              name="workExperience"
              value={form.workExperience}
              onChange={handleChange}
              placeholder="Work Experience (e.g. 2+ years)"
              required
              className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <input
              type="text"
              name="skillsNeeded"
              value={form.skillsNeeded}
              onChange={handleChange}
              placeholder="Skills (comma-separated)"
              required
              className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <input
              type="text"
              name="jobRoles"
              value={form.jobRoles}
              onChange={handleChange}
              placeholder="Job Roles (comma-separated)"
              required
              className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Job Description"
              required
              className="w-full border p-2 rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700 transition-colors"
            >
              Post Job
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddJob;
