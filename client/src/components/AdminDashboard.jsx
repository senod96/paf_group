import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Settings } from "lucide-react";

const actions = [
  {
    title: "Add Courses",
    description: "Create and manage new courses.",
    route: "/admin/add-course"
  },
  {
    title: "Add Learning Plans",
    description: "Setup guided learning paths for users.",
    route: "/adminlearning"
  },
  {
    title: "Add Jobs",
    description: "Post job opportunities and roles.",
    route: "/admin/add-job"
  }
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  // Apply dark mode class
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

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 font-sans relative">
      {/* 🔵 Top Navigation Bar */}
      <div className="dark:bg-gray-800 dark:text-gray-100 bg-white shadow px-6 py-4 flex justify-between items-center z-50 relative">
        <h1
          className="text-2xl font-bold text-blue-700 dark:text-blue-300 cursor-pointer"
          onClick={() => {
            const user = localStorage.getItem("user");
            navigate(user ? "/dashboard" : "/login");
          }}
        >
          Skillora
        </h1>

        <div className="relative">
          <Settings
            className="w-6 h-6 cursor-pointer text-gray-600 dark:text-gray-300 hover:text-blue-500 transition"
            onClick={() => setShowSettings(!showSettings)}
          />

          {showSettings && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50">
              <button
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                onClick={() => setDarkMode(!darkMode)}
              >
                {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 🔲 Dashboard Cards */}
      <div className="px-6 py-8">
        <h1 className="text-3xl font-bold mb-6 text-indigo-600 dark:text-indigo-400">
          Admin Dashboard
        </h1>

        <div className="grid gap-6 md:grid-cols-3">
          {actions.map((action, index) => (
            <div
              key={index}
              onClick={() => navigate(action.route)}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 cursor-pointer hover:shadow-lg transition"
            >
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                {action.title}
              </h2>
              <p className="text-gray-500 dark:text-gray-300 text-sm">
                {action.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
