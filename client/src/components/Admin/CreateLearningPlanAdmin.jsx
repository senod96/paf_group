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
  <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8 text-gray-800 dark:text-gray-100 font-sans">
    <h1 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-700 mb-8">
      Create Site Learning Plan
    </h1>

    {step === 1 && (
      <div className="max-w-7xl mx-auto space-y-6 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg min-h-[500px]">

        {/* Main Title */}
        <div>
          <label className="block mb-2 text-lg font-semibold text-gray-700 dark:text-gray-300">Main Title</label>
          <input
            value={mainTitle}
            onChange={(e) => setMainTitle(e.target.value)}
            className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Enter a Plan Title..."
          />
        </div>

        {/* Preview Image */}
        <div>
          <label className="block mb-2 mt-12 text-lg font-semibold text-gray-700 dark:text-gray-300">Upload Preview Image</label>
          <input
            type="file"
            onChange={(e) => setPreviewFile(e.target.files[0])}
            className="w-full mt-4 text-gray-600 mt- 12 dark:text-gray-300"
          />
        </div>

        {/* Badge Image */}
        <div>
          <label className="block mb-2 mt-12 text-lg font-semibold text-gray-700 dark:text-gray-300">Upload Badge Image</label>
          <input
            type="file"
            onChange={(e) => setBadgeFile(e.target.files[0])}
            className="w-full mt-4 text-gray-600 dark:text-gray-300 "
          />
        </div>

        {/* Continue Button */}
        <button
          onClick={handleImageUpload}
          disabled={!mainTitle || !previewFile || !badgeFile || loading}
          className="w-full mt-12 py-3 margin-top 20px bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white rounded-xl font-semibold text-lg shadow-md disabled:opacity-60 transition duration-300"
        >
          {loading ? "Uploading..." : "Continue to Tasks"}
        </button>
      </div>
    )}

    {step === 2 && (
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-8">
          Add Tasks
        </h2>
        {tasks.map((task, index) => (
          <div key={index} className="mb-6 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold text-lg text-gray-700 dark:text-gray-300">Task {index + 1}</span>
              <button onClick={() => removeTask(index)} className="text-red-500 hover:text-red-700">
                <Trash2 size={20} />
              </button>
            </div>

            <input
              value={task.title}
              onChange={(e) => handleTaskChange(index, "title", e.target.value)}
              placeholder="Task Title"
              className="w-full mb-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              value={task.description}
              onChange={(e) => handleTaskChange(index, "description", e.target.value)}
              placeholder="Task Description"
              className="w-full mb-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <div className="flex gap-4">
              <input
                value={task.startTime}
                onChange={(e) => handleTaskChange(index, "startTime", e.target.value)}
                type="datetime-local"
                className="flex-1 p-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                value={task.endTime}
                onChange={(e) => handleTaskChange(index, "endTime", e.target.value)}
                type="datetime-local"
                className="flex-1 p-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>
        ))}

        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={addTask}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white rounded-xl shadow-md font-semibold transition duration-300"
          >
            <PlusCircle size={20} /> Add Task
          </button>
        </div>
            <button
              onClick={addTask}
              className="flex items-center gap-2 mb-8 px-6 py-3 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-lg shadow hover:from-indigo-600 hover:to-blue-700 transition-all"
            >
              <PlusCircle size={20} /> Add Task
            </button>

        <button
          onClick={handleSubmit}
          className="w-full mt-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white rounded-xl font-bold text-lg shadow-lg transition duration-300"
        >
          Create Learning Plan
        </button>
      </div>
    )}
  </div>
);

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
