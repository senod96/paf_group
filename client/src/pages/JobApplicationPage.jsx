import React, { useEffect, useState } from "react";
import courseImage from "../components/posts/course.webp";

const JobApplicationPage = () => {
  const [jobs, setJobs] = useState([]);
  const [jobId, setJobId] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    address: "",
    workExperience: "",
    age: "",
    gender: "",
    contactNumber: "",
    email: "",
  });

  const stored = localStorage.getItem("user");
  const userId = stored?.startsWith("{") ? JSON.parse(stored).id : stored;

  useEffect(() => {
    fetch("http://localhost:8080/jobposts")
      .then((res) => res.json())
      .then((data) => setJobs(Array.isArray(data) ? data : []));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpload = async () => {
    if (!jobId || !userId || !selectedFile) {
      setMessage("❌ Fill all fields and upload a file.");
      return;
    }

    const form = new FormData();
    form.append("cv", selectedFile);
    form.append("userId", userId);
    Object.entries(formData).forEach(([key, value]) => form.append(key, value));

    const res = await fetch(`http://localhost:8080/applications/${jobId}/apply`, {
      method: "POST",
      body: form,
    });

    const text = await res.text();
    setMessage(res.ok ? "✅ CV uploaded successfully." : `❌ Upload failed: ${text}`);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Step 1: Choose a Job</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => setJobId(job.id)}
                  className={`cursor-pointer p-4 rounded-lg shadow border bg-white dark:bg-gray-800 transform transition-all duration-300 ${
                    jobId === job.id
                      ? "scale-105 border-blue-600 ring-2 ring-blue-400"
                      : "border-gray-300 hover:scale-105 hover:shadow-lg"
                  }`}
                >
                  <img src={courseImage} alt="Job Banner" className="w-full h-32 object-cover rounded mb-3" />
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">{job.jobTitle}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-300">{job.company}</p>
                  <p className="text-sm italic">{job.companyOverview}</p>
                  <p className="text-sm mt-1"><strong>Experience:</strong> {job.workExperience}</p>
                  <p className="text-sm"><strong>Skills:</strong> {job.skillsNeeded}</p>
                  <p className="text-sm"><strong>Roles:</strong> {job.jobRoles}</p>
                  <p className="text-sm mt-1">{job.description}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {["fullName", "address", "workExperience", "age", "gender", "contactNumber", "email"].map((field) => (
              <input
                key={field}
                name={field}
                placeholder={field.replace(/([A-Z])/g, " $1")}
                value={formData[field]}
                onChange={handleInputChange}
                className="border dark:border-gray-600 dark:bg-gray-700 dark:text-white p-3 rounded"
              />
            ))}
          </div>
        );

      case 3:
        return (
          <div>
            <label className="block text-sm mb-2">Upload CV (PDF only):</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="w-full dark:bg-gray-700 dark:text-white p-2 rounded"
            />
          </div>
        );

      case 4:
        const selectedJob = jobs.find((j) => j.id === jobId);
        return (
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-gray-700 dark:text-white">Review Details</h3>
            <p><strong>Job:</strong> {selectedJob?.jobTitle}</p>
            {Object.entries(formData).map(([key, value]) => (
              <p key={key}><strong>{key.replace(/([A-Z])/g, " $1")}:</strong> {value}</p>
            ))}
            <p><strong>CV:</strong> {selectedFile?.name || "No file selected"}</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 font-sans text-gray-800 dark:text-white flex flex-col items-center py-10">
      <div className="max-w-6xl w-full bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center mb-8">Job Application Wizard</h1>

        {/* Step Indicators */}
        <div className="flex justify-between mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`flex-1 text-center py-2 border-b-2 ${step >= s ? "border-blue-600 text-blue-600" : "border-gray-300 text-gray-400"}`}
            >
              Step {s}
            </div>
          ))}
        </div>

        {renderStep()}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => setStep((prev) => Math.max(1, prev - 1))}
            disabled={step === 1}
            className="bg-gray-300 dark:bg-gray-700 dark:text-white text-gray-700 px-4 py-2 rounded disabled:opacity-50"
          >
            Back
          </button>

          {step < 4 ? (
            <button
              onClick={() => setStep((prev) => Math.min(4, prev + 1))}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              disabled={step === 1 && !jobId}
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleUpload}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Submit
            </button>
          )}
        </div>

        {message && <p className="mt-6 text-center text-sm text-blue-600 dark:text-green-400">{message}</p>}
      </div>
    </div>
  );
};

export default JobApplicationPage;
