import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
const ViewJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedFile, setSelectedFile] = useState({});
  const [message, setMessage] = useState("");

  const navigate = useNavigate();
  const stored = localStorage.getItem("user");
  const userId = stored?.startsWith("{") ? JSON.parse(stored).id : stored;

  useEffect(() => {
    fetch("http://localhost:8080/jobposts")
      .then((res) => res.json())
      .then((data) => setJobs(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error fetching jobs:", err));
  }, []);

  const handleFileChange = (e, jobId) => {
    setSelectedFile((prev) => ({
      ...prev,
      [jobId]: e.target.files[0],
    }));
  };

  const handleUpload = async (jobId) => {
    const file = selectedFile[jobId];
    if (!file || !userId) {
      setMessage("Please select a file and make sure you're logged in.");
      return;
    }

    const formData = new FormData();
    formData.append("cv", file);
    formData.append("userId", userId);

    try {
      const res = await fetch(`http://localhost:8080/applications/${jobId}/apply`, {
        method: "POST",
        body: formData,
      });

      const text = await res.text();
      if (res.ok) {
        setMessage("✅ CV uploaded successfully.");
      } else {
        setMessage(`❌ Upload failed: ${text}`);
      }
    } catch (err) {
      console.error("Upload error:", err);
      setMessage("❌ Error uploading file.");
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job post?")) return;

    try {
      const res = await fetch(`http://localhost:8080/jobposts/${jobId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setJobs(jobs.filter((job) => job.id !== jobId));
        setMessage("✅ Job post deleted.");
      } else {
        setMessage("❌ Failed to delete job post.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      setMessage("❌ Error deleting job post.");
    }
  };

  const handleEdit = (jobId) => navigate(`/edit-job/${jobId}`);
  const handleViewApplicants = (jobId) => navigate(`/applicants/${jobId}`);

  return (
    <div className="dark:bg-gray-900 dark:text-gray-100 min-h-screen p-6 bg-[#f9fafb] font-sans text-gray-800 relative">
      <Navbar /> <br></br>
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">🚀 Job Opportunities</h2>

        {message && (
          <p className="mb-6 text-center text-sm text-blue-600 dark:text-blue-400">{message}</p>
        )}

        {jobs.length > 0 ? (
          jobs.map((job) => (
            <div key={job.id || job._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6 hover:shadow-lg transition">
              <h3 className="text-2xl font-semibold text-blue-700 dark:text-blue-400 mb-1">{job.jobTitle}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-2">{job.company}</p>
              <p className="text-sm italic text-gray-500 dark:text-gray-400 mb-3">{job.companyOverview}</p>

              <div className="space-y-1 text-sm">
                <p><strong>Experience:</strong> {job.workExperience}</p>
                <p><strong>Skills:</strong> {job.skillsNeeded}</p>
                <p><strong>Job Roles:</strong> {job.jobRoles}</p>
                <p className="mt-2">{job.description}</p>
              </div>

              {/* Upload CV */}
              <div className="mt-5 space-y-2">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => handleFileChange(e, job.id || job._id)}
                  className="w-full border border-gray-300 dark:border-gray-700 p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                />
                <button
                  onClick={() => handleUpload(job.id || job._id)}
                  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                >
                  📤 Upload CV
                </button>
              </div>

              {/* Actions */}
              <div className="flex gap-4 mt-6 flex-wrap">
                <button
                  onClick={() => handleEdit(job.id || job._id)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded transition"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDelete(job.id || job._id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition"
                >
                  🗑️ Delete
                </button>
                <button
                  onClick={() => handleViewApplicants(job.id || job._id)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition"
                >
                  👥 View Applicants
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400">No job opportunities yet.</p>
        )}
      </div>
    </div>
  );
};

export default ViewJobs;
