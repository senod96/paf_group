import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Settings,
  PlusCircle,
  BookOpen,
  Bookmark,
  Briefcase,
  FileText,
  List
} from "lucide-react";

const courseActions = [
  {
    title: "Add Courses",
    description: "Create and manage new courses.",
    route: "/AddCourse",
    icon: <PlusCircle className="w-8 h-8 text-blue-500" />
  },
  {
    title: "Published Courses",
    description: "View and manage your published courses.",
    route: "/MyCourses",
    icon: <BookOpen className="w-8 h-8 text-green-500" />
  }
];

const otherActions = [
  {
    title: "Learning Plans",
    description: "Setup guided learning paths for users.",
    route: "/adminlearning",
    icon: <Bookmark className="w-8 h-8 text-purple-500" />
  },
  {
    title: "Published Learning Plans",
    description: "View and manage your published Learning Plans",
    route: "/AdminLearningPlanView",
    icon: <FileText className="w-8 h-8 text-orange-500" />
  }
];

// ✅ Updated Job Management Section
const jobActions = [
  {
    title: "Create Job",
    description: "Post new job opportunities and roles.",
    route: "/AddJob",
    icon: <Briefcase className="w-8 h-8 text-red-500" />
  },
  {
    title: "Published Jobs",
    description: "View and manage all published job postings.",
    route: "/jobapplications", // ✅ Updated route here
    icon: <List className="w-8 h-8 text-teal-500" />
  }
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 font-sans relative">
      {/* Top Navigation Bar */}
      <div className="dark:bg-gray-800/80 dark:text-gray-100 bg-white/80 backdrop-blur-sm shadow-sm px-6 py-4 flex justify-between items-center z-50 relative border-b border-gray-200 dark:border-gray-700">
        <h1
          className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent dark:from-blue-400 dark:to-blue-300 cursor-pointer"
          onClick={() => {
            const user = localStorage.getItem("user");
            navigate(user ? "/dashboard" : "/login");
          }}
        >
          Skillora
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

      {/* Dashboard Content */}
      <div className="px-6 py-8 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              Admin Dashboard
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage your platform content and settings
            </p>
          </div>
        </div>

        {/* Courses Section */}
        <div className="mb-12">
          <div className="flex items-center mb-6">
            <div className="w-1 h-8 bg-blue-500 rounded-full mr-3"></div>
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
              Course Management
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {courseActions.map((action, index) => (
              <div
                key={index}
                onClick={() => navigate(action.route)}
                className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-blue-50 dark:bg-gray-700 group-hover:bg-blue-100 dark:group-hover:bg-gray-600 transition-colors">
                      {action.icon}
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
                        {action.title}
                      </h2>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        {action.description}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <span className="text-sm text-blue-500 dark:text-blue-400 font-medium group-hover:underline">
                      Go to section →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Learning Plans Section */}
        <div className="mb-12">
          <div className="flex items-center mb-6">
            <div className="w-1 h-8 bg-purple-500 rounded-full mr-3"></div>
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
              Learning Plans Management
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {otherActions.map((action, index) => (
              <div
                key={index}
                onClick={() => navigate(action.route)}
                className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-500 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-purple-50 dark:bg-gray-700 group-hover:bg-purple-100 dark:group-hover:bg-gray-600 transition-colors">
                      {action.icon}
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
                        {action.title}
                      </h2>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        {action.description}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <span className="text-sm text-purple-500 dark:text-purple-400 font-medium group-hover:underline">
                      Go to section →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Job Management Section */}
        <div className="mb-12">
          <div className="flex items-center mb-6">
            <div className="w-1 h-8 bg-red-500 rounded-full mr-3"></div>
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
              Job Management
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {jobActions.map((action, index) => (
              <div
                key={index}
                onClick={() => navigate(action.route)}
                className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-500 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-red-50 dark:bg-gray-700 group-hover:bg-red-100 dark:group-hover:bg-gray-600 transition-colors">
                      {action.icon}
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
                        {action.title}
                      </h2>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        {action.description}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <span className="text-sm text-red-500 dark:text-red-400 font-medium group-hover:underline">
                      Go to section →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
