import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ViewJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();
  const stored = localStorage.getItem("user");
  const userId = stored?.startsWith("{") ? JSON.parse(stored).id : stored;

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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-800 dark:text-gray-100 font-sans px-6 py-10 transition-all">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600 mb-10">
          My Job Posts
        </h2>

        {message && (
          <p className="mb-6 text-center text-lg font-semibold text-green-600 dark:text-green-400">
            {message}
          </p>
        )}

        {jobs.length === 0 ? (
          <p className="text-center text-xl text-gray-500 dark:text-gray-400">
            No job posts found.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {jobs.map((job) => (
              <div
                key={job.id || job._id}
                className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 transition-all hover:shadow-2xl min-h-[480px] flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">
                    {job.jobTitle}
                  </h3>
                  <p className="text-lg text-blue-600 dark:text-blue-400 font-semibold mb-1">
                    {job.company}
                  </p>
                  <p className="italic text-gray-500 dark:text-gray-400 mb-4">
                    {job.companyOverview}
                  </p>

                  <div className="space-y-2 text-base text-gray-700 dark:text-gray-300">
                    <p>
                      <strong>Experience:</strong> {job.workExperience}
                    </p>
                    <p>
                      <strong>Skills:</strong> {job.skillsNeeded}
                    </p>
                    <p>
                      <strong>Roles:</strong> {job.jobRoles}
                    </p>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      {job.description}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 mt-8">
                  <button
                    onClick={() => handleEdit(job.id || job._id)}
                    className="px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-white text-sm font-medium rounded-xl shadow-md transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(job.id || job._id)}
                    className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-xl shadow-md transition"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => handleViewApplicants(job.id || job._id)}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-xl shadow-md transition"
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
