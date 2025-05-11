import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ViewJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();
  const stored = localStorage.getItem("user");
  const userId = stored?.startsWith("{") ? JSON.parse(stored).id : stored;

  // ✅ Auto detect and apply dark mode
  useEffect(() => {
    if (
      localStorage.getItem("theme") === "dark" ||
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  useEffect(() => {
    fetch("http://localhost:8080/jobposts")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const filtered = data.filter((job) => job.userId === userId);
          setJobs(filtered);
        }
      })
      .catch((err) => console.error("Error fetching jobs:", err));
  }, [userId]);

  const handleDelete = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job post?")) return;

    try {
      const res = await fetch(`http://localhost:8080/jobposts/${jobId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setJobs(jobs.filter((job) => job.id !== jobId && job._id !== jobId));
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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 font-sans text-gray-800 dark:text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-5xl font-extrabold mb-10 text-center">My Job Posts</h2>

        {message && (
          <p className="mb-6 text-center text-2xl text-blue-600 dark:text-green-400">
            {message}
          </p>
        )}

        {jobs.length === 0 ? (
          <p className="text-center text-2xl text-gray-500 dark:text-gray-400">No job posts found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {jobs.map((job) => (
              <div
                key={job.id || job._id}
                className="rounded-2xl shadow-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 hover:shadow-3xl transition-all min-h-[500px] flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-3xl font-bold mb-4">{job.jobTitle}</h3>
                  <p className="text-xl text-gray-500 dark:text-gray-400">{job.company}</p>
                  <p className="text-lg italic mb-4 text-gray-400">{job.companyOverview}</p>

                  <div className="space-y-2 text-lg leading-relaxed">
                    <p><strong>Experience:</strong> {job.workExperience}</p>
                    <p><strong>Skills:</strong> {job.skillsNeeded}</p>
                    <p><strong>Job Roles:</strong> {job.jobRoles}</p>
                    <p className="text-gray-600 dark:text-gray-300 mt-3">{job.description}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 mt-8">
                  <button
                    onClick={() => handleEdit(job.id || job._id)}
                    className="bg-yellow-400 hover:bg-yellow-500 text-white text-lg py-2 px-6 rounded-xl transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(job.id || job._id)}
                    className="bg-red-500 hover:bg-red-600 text-white text-lg py-2 px-6 rounded-xl transition"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => handleViewApplicants(job.id || job._id)}
                    className="bg-green-500 hover:bg-green-600 text-white text-lg py-2 px-6 rounded-xl transition"
                  >
                    View Applicants
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewJobs;
