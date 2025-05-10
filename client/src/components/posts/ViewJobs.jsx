import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Job Opportunities</h2>
      {message && <p className="mb-4 text-sm text-blue-600">{message}</p>}

      {jobs.map((job) => (
        <div key={job.id || job._id} className="border rounded shadow p-4 mb-6">
          <h3 className="text-lg font-bold">{job.jobTitle}</h3>
          <p className="text-sm text-gray-600">{job.company}</p>
          <p className="text-sm italic mb-1">{job.companyOverview}</p>
          <p className="text-sm"><strong>Experience:</strong> {job.workExperience}</p>
          <p className="text-sm"><strong>Skills:</strong> {job.skillsNeeded}</p>
          <p className="text-sm"><strong>Job Roles:</strong> {job.jobRoles}</p>
          <p className="mt-2">{job.description}</p>

          {/* Upload CV */}
          <div className="mt-4 flex flex-col gap-2">
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => handleFileChange(e, job.id || job._id)}
            />
            <button
              onClick={() => handleUpload(job.id || job._id)}
              className="bg-blue-600 text-white py-1 px-4 rounded hover:bg-blue-700"
            >
              Upload CV
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-4 mt-4">
            <button onClick={() => handleEdit(job.id || job._id)} className="bg-yellow-500 text-white py-1 px-4 rounded hover:bg-yellow-600">
              Edit
            </button>
            <button onClick={() => handleDelete(job.id || job._id)} className="bg-red-600 text-white py-1 px-4 rounded hover:bg-red-700">
              Delete
            </button>
            <button onClick={() => handleViewApplicants(job.id || job._id)} className="bg-green-600 text-white py-1 px-4 rounded hover:bg-green-700">
              View Applicants
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ViewJobs;
