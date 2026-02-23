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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8 text-gray-800 dark:text-gray-100 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-700 mb-2">
            Create Site Learning Plan
          </h1>
        </div>

        {/* Step Indicator */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'} transition-colors`}>
              1
            </div>
            <div className={`w-16 md:w-24 h-1 ${step === 2 ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'} transition-colors`}></div>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'} transition-colors`}>
              2
            </div>
          </div>
        </div>

        {step === 1 && (
          <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
            {/* Main Title */}
            <div className="mb-8">
              <label className="block mb-3 text-lg font-medium text-gray-700 dark:text-gray-300">
                Plan Title <span className="text-red-500">*</span>
              </label>
              <input
                value={mainTitle}
                onChange={(e) => setMainTitle(e.target.value)}
                className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                placeholder="e.g. Master React in 30 Days"
              />
            </div>

            {/* Preview Image */}
            <div className="mb-8">
              <label className="block mb-3 text-lg font-medium text-gray-700 dark:text-gray-300">
                Preview Image <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 rounded-xl cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all">
                  <div className="flex flex-col items-center justify-center pt-7">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-400 group-hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="pt-1 text-sm tracking-wider text-gray-400 group-hover:text-gray-600">
                      {previewFile ? previewFile.name : 'Upload preview image'}
                    </p>
                  </div>
                  <input 
                    type="file" 
                    onChange={(e) => setPreviewFile(e.target.files[0])} 
                    className="opacity-0" 
                  />
                </label>
              </div>
            </div>

            {/* Badge Image */}
            <div className="mb-8">
              <label className="block mb-3 text-lg font-medium text-gray-700 dark:text-gray-300">
                Badge Image <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 rounded-xl cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all">
                  <div className="flex flex-col items-center justify-center pt-7">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-400 group-hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="pt-1 text-sm tracking-wider text-gray-400 group-hover:text-gray-600">
                      {badgeFile ? badgeFile.name : 'Upload badge image'}
                    </p>
                  </div>
                  <input 
                    type="file" 
                    onChange={(e) => setBadgeFile(e.target.files[0])} 
                    className="opacity-0" 
                  />
                </label>
              </div>
            </div>

            {/* Continue Button */}
            <button
              onClick={handleImageUpload}
              disabled={!mainTitle || !previewFile || !badgeFile || loading}
              className={`w-full py-4 mt-4 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white rounded-xl font-semibold text-lg shadow-lg transition-all duration-300 ${(!mainTitle || !previewFile || !badgeFile) ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-xl'}`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </span>
              ) : (
                "Continue to Tasks"
              )}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                Plan Overview
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
                  <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">Plan Title</h3>
                  <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">{mainTitle}</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-100 dark:border-green-900/30">
                  <h3 className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">Total Tasks</h3>
                  <p className="text-lg font-semibold text-green-900 dark:text-green-100">{tasks.length}</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-900/30">
                  <h3 className="text-sm font-medium text-purple-800 dark:text-purple-200 mb-1">Status</h3>
                  <p className="text-lg font-semibold text-purple-900 dark:text-purple-100">Draft</p>
                </div>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-6">
              Tasks ({tasks.length})
            </h3>

            {tasks.map((task, index) => (
              <div key={index} className="mb-6 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 transition-all hover:shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold text-lg text-gray-700 dark:text-gray-300">Task {index + 1}</span>
                  <button 
                    onClick={() => removeTask(index)} 
                    className="p-2 rounded-full bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                    aria-label="Delete task"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">Title</label>
                    <input
                      value={task.title}
                      onChange={(e) => handleTaskChange(index, "title", e.target.value)}
                      placeholder="Enter task title"
                      className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">Description</label>
                    <textarea
                      value={task.description}
                      onChange={(e) => handleTaskChange(index, "description", e.target.value)}
                      placeholder="Enter task description"
                      rows={3}
                      className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">Start Time</label>
                      <input
                        value={task.startTime}
                        onChange={(e) => handleTaskChange(index, "startTime", e.target.value)}
                        type="datetime-local"
                        className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">End Time</label>
                      <input
                        value={task.endTime}
                        onChange={(e) => handleTaskChange(index, "endTime", e.target.value)}
                        type="datetime-local"
                        className="w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8">
              <button
                onClick={addTask}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white rounded-xl shadow-md font-semibold transition-all hover:shadow-lg"
              >
                <PlusCircle size={20} /> Add New Task
              </button>
              
              <button
                onClick={handleSubmit}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 text-white rounded-xl shadow-lg font-bold text-lg transition-all hover:shadow-xl"
              >
                Publish Learning Plan
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}