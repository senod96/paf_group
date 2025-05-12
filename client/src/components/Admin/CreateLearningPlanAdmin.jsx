import React, { useState } from "react";
import axios from "axios";
import { PlusCircle, Trash2 } from "lucide-react";
import { uploadImageToFirebase } from "../../utils/firebaseUploader";

export default function CreateLearningPlanAdmin() {
  const [step, setStep] = useState(1);

  const [mainTitle, setMainTitle] = useState("");
  const [image, setImage] = useState("");
  const [badge, setBadge] = useState("");
  const [tasks, setTasks] = useState([
    { title: "", description: "", status: "Pending", startTime: "", endTime: "" }
  ]);

  const [previewFile, setPreviewFile] = useState(null);
  const [badgeFile, setBadgeFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = async () => {
    setLoading(true);
    try {
      const [imageUrl, badgeUrl] = await Promise.all([
        uploadImageToFirebase(previewFile),
        uploadImageToFirebase(badgeFile)
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

  const addTask = () => {
    setTasks([...tasks, { title: "", description: "", status: "Pending", startTime: "", endTime: "" }]);
  };

  const removeTask = (index) => {
    const updated = [...tasks];
    updated.splice(index, 1);
    setTasks(updated);
  };

  const handleSubmit = async () => {
    const plan = {
      type: "site",
      image,
      badge,
      plans: [{ mainTitle, tasks }]
    };

    try {
      await axios.post("http://localhost:8080/learning-plans", plan);
      alert("Learning Plan Created!");
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
      alert("Failed to create plan");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8 text-gray-800 dark:text-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-blue-700 dark:text-blue-300">
        Create Site Learning Plan
      </h1>

      {step === 1 && (
        <div className="space-y-6">
          <div>
            <label className="block mb-1 font-medium">Main Title</label>
            <input
              value={mainTitle}
              onChange={(e) => setMainTitle(e.target.value)}
              className="w-full p-2 rounded bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">Upload Preview Image</label>
            <input type="file" onChange={(e) => setPreviewFile(e.target.files[0])} />
          </div>

          <div>
            <label className="block mb-1 font-medium">Upload Badge Image</label>
            <input type="file" onChange={(e) => setBadgeFile(e.target.files[0])} />
          </div>

          <button
            onClick={handleImageUpload}
            disabled={!mainTitle || !previewFile || !badgeFile || loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Uploading..." : "Continue to Tasks"}
          </button>
        </div>
      )}

      {step === 2 && (
        <>
          <h2 className="text-xl font-semibold mb-4">Add Tasks</h2>
          {tasks.map((task, index) => (
            <div key={index} className="mb-4 p-4 bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Task {index + 1}</span>
                <button onClick={() => removeTask(index)} className="text-red-500 hover:text-red-700">
                  <Trash2 size={18} />
                </button>
              </div>
              <input
                value={task.title}
                onChange={(e) => handleTaskChange(index, "title", e.target.value)}
                placeholder="Title"
                className="w-full mb-2 p-2 rounded bg-gray-50 dark:bg-gray-700"
              />
              <input
                value={task.description}
                onChange={(e) => handleTaskChange(index, "description", e.target.value)}
                placeholder="Description"
                className="w-full mb-2 p-2 rounded bg-gray-50 dark:bg-gray-700"
              />
              <div className="flex gap-2">
                <input
                  value={task.startTime}
                  onChange={(e) => handleTaskChange(index, "startTime", e.target.value)}
                  type="datetime-local"
                  className="flex-1 p-2 rounded bg-gray-50 dark:bg-gray-700"
                />
                <input
                  value={task.endTime}
                  onChange={(e) => handleTaskChange(index, "endTime", e.target.value)}
                  type="datetime-local"
                  className="flex-1 p-2 rounded bg-gray-50 dark:bg-gray-700"
                />
              </div>
            </div>
          ))}

          <button
            onClick={addTask}
            className="flex items-center gap-2 mt-3 mb-6 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            <PlusCircle size={18} /> Add Task
          </button>

          <button
            onClick={handleSubmit}
            className="w-full py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 text-lg font-semibold"
          >
            Create Learning Plan
          </button>
        </>
      )}
    </div>
  );
}
