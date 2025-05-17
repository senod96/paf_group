import React, { useState } from "react";
import axios from "axios";
import { PlusCircle, Trash2, Settings } from "lucide-react";
import { uploadImageToFirebase } from "../../utils/firebaseUploader";
import { useNavigate } from "react-router-dom";

export default function CreateLearningPlanAdmin() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [darkMode, setDarkMode] = useState(localStorage.getItem("theme") === "dark");
  const [mainTitle, setMainTitle] = useState("");
  const [image, setImage] = useState("");
  const [badge, setBadge] = useState("");
  const [tasks, setTasks] = useState([{ title: "", description: "", status: "Pending", startTime: "", endTime: "" }]);
  const [previewFile, setPreviewFile] = useState(null);
  const [badgeFile, setBadgeFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = async () => {
    setLoading(true);
    try {
      const [imageUrl, badgeUrl] = await Promise.all([
        uploadImageToFirebase(previewFile),
        uploadImageToFirebase(badgeFile),
      ]);
      setImage(imageUrl);
      setBadge(badgeUrl);
      setStep(2);
    } catch (err) {
      console.error("Image upload failed", err);
      alert("Image upload failed");
    }
    setLoading(false);
  };

  const handleTaskChange = (index, field, value) => {
    const updated = [...tasks];
    updated[index][field] = value;
    setTasks(updated);
  };

  const addTask = () => setTasks([...tasks, { title: "", description: "", status: "Pending", startTime: "", endTime: "" }]);
  const removeTask = (index) => setTasks(tasks.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    const plan = { type: "site", image, badge, plans: [{ mainTitle, tasks }] };
    try {
      await axios.post("http://localhost:8080/learning-plans", plan);
      alert("✅ Learning Plan Created!");
      // Reset form
      setMainTitle("");
      setImage("");
      setBadge("");
      setPreviewFile(null);
      setBadgeFile(null);
      setTasks([{ title: "", description: "", status: "Pending", startTime: "", endTime: "" }]);
      setStep(1);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to create plan");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-8 text-gray-800 dark:text-gray-100 font-sans">
      {/* Top Navbar */}
      <div className="dark:bg-gray-800 bg-white shadow px-6 py-4 flex justify-between items-center z-50">
        <h1
          className="text-2xl font-bold text-blue-700 dark:text-blue-300 cursor-pointer"
          onClick={() => navigate("/dashboard")}
        >
          Skillora
        </h1>
        <div className="relative">
          <Settings
            className="w-6 h-6 cursor-pointer text-gray-600 dark:text-gray-300 hover:text-blue-500 transition"
            onClick={() => setShowSettings(!showSettings)}
          />
          {showSettings && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border rounded-md shadow-lg z-50">
              <button
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                onClick={() => {
                  setDarkMode(!darkMode);
                  localStorage.setItem("theme", darkMode ? "light" : "dark");
                  window.location.reload();
                }}
              >
                {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
              </button>
            </div>
          )}
        </div>
      </div>

      <h1 className="text-4xl font-extrabold mt-24 text-center text-indigo-700 dark:text-indigo-400 mb-10">
        Create Site Learning Plan
      </h1>

      <div className="max-w-3xl mx-auto mt-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block mb-2 font-semibold">Main Title</label>
              <input
                value={mainTitle}
                onChange={(e) => setMainTitle(e.target.value)}
                className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter Learning Plan Title..."
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold">Upload Preview Image</label>
              <input type="file" onChange={(e) => setPreviewFile(e.target.files[0])} className="text-sm" />
            </div>

            <div>
              <label className="block mb-2 font-semibold">Upload Badge Image</label>
              <input type="file" onChange={(e) => setBadgeFile(e.target.files[0])} className="text-sm" />
            </div>

            <button
              onClick={handleImageUpload}
              disabled={!mainTitle || !previewFile || !badgeFile || loading}
              className={`w-full py-3 rounded-lg font-semibold text-white transition-all duration-300 ${
                loading ? "bg-indigo-300 cursor-not-allowed" : "bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700"
              }`}
            >
              {loading ? "Uploading..." : "Continue to Tasks ➡️"}
            </button>
          </div>
        )}

        {step === 2 && (
          <>
            <h2 className="text-2xl font-bold mb-6 text-indigo-700 dark:text-indigo-400">📝 Add Tasks</h2>
            {tasks.map((task, index) => (
              <div key={index} className="mb-6 p-6 bg-gray-50 dark:bg-gray-700 rounded-xl shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold text-lg">Task {index + 1}</span>
                  <button onClick={() => removeTask(index)} className="text-red-500 hover:text-red-600">
                    <Trash2 size={20} />
                  </button>
                </div>
                <input
                  value={task.title}
                  onChange={(e) => handleTaskChange(index, "title", e.target.value)}
                  placeholder="Task Title"
                  className="w-full mb-3 p-3 rounded-lg bg-gray-100 dark:bg-gray-800 border focus:ring-2 focus:ring-indigo-500"
                />
                <textarea
                  value={task.description}
                  onChange={(e) => handleTaskChange(index, "description", e.target.value)}
                  placeholder="Task Description"
                  rows={3}
                  className="w-full mb-3 p-3 rounded-lg bg-gray-100 dark:bg-gray-800 border focus:ring-2 focus:ring-indigo-500"
                />
                <div className="flex gap-4">
                  <input
                    value={task.startTime}
                    onChange={(e) => handleTaskChange(index, "startTime", e.target.value)}
                    type="datetime-local"
                    className="flex-1 p-3 rounded-lg bg-gray-100 dark:bg-gray-800 border"
                  />
                  <input
                    value={task.endTime}
                    onChange={(e) => handleTaskChange(index, "endTime", e.target.value)}
                    type="datetime-local"
                    className="flex-1 p-3 rounded-lg bg-gray-100 dark:bg-gray-800 border"
                  />
                </div>
              </div>
            ))}

            <button
              onClick={addTask}
              className="flex items-center gap-2 mb-8 px-6 py-3 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-lg shadow hover:from-indigo-600 hover:to-blue-700 transition-all"
            >
              <PlusCircle size={20} /> Add Task
            </button>

            <button
              onClick={handleSubmit}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-blue-700 hover:from-indigo-700 hover:to-blue-800 text-white rounded-lg shadow-lg text-lg font-semibold"
            >
              🚀 Create Learning Plan
            </button>
          </>
        )}
      </div>
    </div>
  );
}
