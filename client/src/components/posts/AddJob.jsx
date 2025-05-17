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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-800 dark:text-gray-100 font-sans transition-colors">
      {/* Top Navigation */}
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
                {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 pt-10">
        <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600 mb-8">
          Add New Job Post
        </h2>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
          {message && (
            <p className="mb-4 text-sm font-medium text-green-600 dark:text-green-400">
              {message}
            </p>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                Company
              </label>
              <input
                type="text"
                name="company"
                value={form.company}
                onChange={handleChange}
                placeholder="Company"
                required
                className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                Company Overview
              </label>
              <textarea
                name="companyOverview"
                value={form.companyOverview}
                onChange={handleChange}
                placeholder="Brief about the company"
                required
                rows="3"
                className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                Job Title
              </label>
              <input
                type="text"
                name="jobTitle"
                value={form.jobTitle}
                onChange={handleChange}
                placeholder="Job Title"
                required
                className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                Work Experience
              </label>
              <input
                type="text"
                name="workExperience"
                value={form.workExperience}
                onChange={handleChange}
                placeholder="e.g. 2+ years"
                required
                className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                Skills Needed
              </label>
              <input
                type="text"
                name="skillsNeeded"
                value={form.skillsNeeded}
                onChange={handleChange}
                placeholder="Comma-separated skills"
                required
                className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                Job Roles
              </label>
              <input
                type="text"
                name="jobRoles"
                value={form.jobRoles}
                onChange={handleChange}
                placeholder="Comma-separated roles"
                required
                className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                Job Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Job Description"
                required
                rows="4"
                className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 mt-4 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-semibold text-lg rounded-xl shadow-lg transition-all hover:shadow-xl"
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
