import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ViewJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [formData, setFormData] = useState({});
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

  const handleInputChange = (e, jobId) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [jobId]: {
        ...prev[jobId],
        [name]: value,
      },
    }));
  };

  const handleFileChange = (e, jobId) => {
    setSelectedFile((prev) => ({
      ...prev,
      [jobId]: e.target.files[0],
    }));
  };

  const handleUpload = async (jobId) => {
    const file = selectedFile[jobId];
    const data = formData[jobId] || {};
    if (!file || !userId || !data.fullName || !data.email) {
      setMessage("❌ Please fill in all required fields and select a CV.");
      return;
    }

    const form = new FormData();
    form.append("cv", file);
    form.append("userId", userId);
    form.append("fullName", data.fullName || "");
    form.append("address", data.address || "");
    form.append("workExperience", data.workExperience || "");
    form.append("age", data.age || "");
    form.append("gender", data.gender || "");
    form.append("contactNumber", data.contactNumber || "");
    form.append("email", data.email || "");

    try {
      const res = await fetch(`http://localhost:8080/applications/${jobId}/apply`, {
        method: "POST",
        body: form,
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

      {jobs.map((job) => {
        const jobId = job.id || job._id;
        const data = formData[jobId] || {};

        return (
          <div key={jobId} className="border rounded shadow p-4 mb-8">
            <h3 className="text-lg font-bold">{job.jobTitle}</h3>
            <p className="text-sm text-gray-600">{job.company}</p>
            <p className="text-sm italic mb-1">{job.companyOverview}</p>
            <p className="text-sm"><strong>Experience:</strong> {job.workExperience}</p>
            <p className="text-sm"><strong>Skills:</strong> {job.skillsNeeded}</p>
            <p className="text-sm"><strong>Job Roles:</strong> {job.jobRoles}</p>
            <p className="mt-2">{job.description}</p>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" name="fullName" placeholder="Full Name" required className="border p-2 rounded" value={data.fullName || ""} onChange={(e) => handleInputChange(e, jobId)} />
              <input type="text" name="address" placeholder="Address" className="border p-2 rounded" value={data.address || ""} onChange={(e) => handleInputChange(e, jobId)} />
              <input type="text" name="workExperience" placeholder="Work Experience" className="border p-2 rounded" value={data.workExperience || ""} onChange={(e) => handleInputChange(e, jobId)} />
              <input type="number" name="age" placeholder="Age" className="border p-2 rounded" value={data.age || ""} onChange={(e) => handleInputChange(e, jobId)} />
              <input type="text" name="gender" placeholder="Gender" className="border p-2 rounded" value={data.gender || ""} onChange={(e) => handleInputChange(e, jobId)} />
              <input type="text" name="contactNumber" placeholder="Contact Number" className="border p-2 rounded" value={data.contactNumber || ""} onChange={(e) => handleInputChange(e, jobId)} />
              <input type="email" name="email" placeholder="Email" required className="border p-2 rounded" value={data.email || ""} onChange={(e) => handleInputChange(e, jobId)} />
              <input type="file" accept="application/pdf" onChange={(e) => handleFileChange(e, jobId)} />
            </div>

            <button
              onClick={() => handleUpload(jobId)}
              className="bg-blue-600 text-white py-1 px-4 rounded hover:bg-blue-700 mt-3"
            >
              Upload CV
            </button>

            <div className="flex gap-4 mt-4">
              <button onClick={() => handleEdit(jobId)} className="bg-yellow-500 text-white py-1 px-4 rounded hover:bg-yellow-600">Edit</button>
              <button onClick={() => handleDelete(jobId)} className="bg-red-600 text-white py-1 px-4 rounded hover:bg-red-700">Delete</button>
              <button onClick={() => handleViewApplicants(jobId)} className="bg-green-600 text-white py-1 px-4 rounded hover:bg-green-700">View Applicants</button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ViewJobs;
