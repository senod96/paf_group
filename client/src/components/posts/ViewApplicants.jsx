import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import profilePic from "../posts/pfp.jpg";

const ViewApplicants = () => {
  const { jobId } = useParams();
  const [applicants, setApplicants] = useState([]);
  const [expandedIds, setExpandedIds] = useState([]);
  const [error, setError] = useState("");

  // Auto-detect dark mode
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
    fetchApplicants();
  }, [jobId]);

  const fetchApplicants = async () => {
    try {
      const res = await fetch(`http://localhost:8080/applications/${jobId}/all`);
      const data = await res.json();
      if (Array.isArray(data)) {
        const sorted = data.sort((a, b) => b.matchingKeywords - a.matchingKeywords);
        setApplicants(sorted);
      } else {
        setApplicants([]);
      }
    } catch (err) {
      console.error("Error fetching applicants:", err);
      setError("Failed to load applicants.");
    }
  };

  const deleteApplicant = async (applicantId) => {
    if (!window.confirm("Are you sure you want to delete this application?")) return;
    try {
      const res = await fetch(`http://localhost:8080/applications/${applicantId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setApplicants((prev) => prev.filter((app) => app.id !== applicantId));
      } else {
        alert("Failed to delete applicant.");
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const toggleExpand = (id) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const getDisplayText = (text, id) => {
    if (expandedIds.includes(id)) return text;
    return text.length > 300 ? text.slice(0, 300) + "..." : text;
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 font-sans text-gray-800 dark:text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-extrabold mb-10 text-center">Applicants for Job</h2>

        {error && <p className="text-red-500 text-center text-xl">{error}</p>}

        {applicants.length === 0 && !error && (
          <p className="text-gray-500 dark:text-gray-400 text-center text-xl">No applicants found.</p>
        )}

        <div className="space-y-10">
          {applicants.map((applicant, index) => (
            <div
              key={applicant.id}
              className="rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 hover:shadow-2xl transition-all"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-6">
                  <img
                    src={profilePic}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover border-2 dark:border-gray-600"
                  />
                  <div>
                    <h3 className="text-2xl font-bold">{index + 1}. {applicant.fullName}</h3>
                    <p className="text-lg text-gray-500 dark:text-gray-300">{applicant.email}</p>
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => deleteApplicant(applicant.id)}
                  className="bg-red-500 hover:bg-red-600 text-white text-base py-2 px-4 rounded-lg transition"
                >
                  Delete
                </button>
              </div>

              {/* Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                <p><strong>Address:</strong> {applicant.address}</p>
                <p><strong>Experience:</strong> {applicant.workExperience}</p>
                <p><strong>Age:</strong> {applicant.age}</p>
                <p><strong>Gender:</strong> {applicant.gender}</p>
                <p><strong>Contact:</strong> {applicant.contactNumber}</p>
                <p><strong>Matching Keywords:</strong> {applicant.matchingKeywords}</p>
              </div>

              {applicant.position > 0 && (
                <p className="text-green-500 font-semibold text-xl mt-4">
                  Ranked #{applicant.position}
                </p>
              )}

              {/* CV Section */}
              <div className="mt-8 bg-gray-100 dark:bg-gray-700 p-6 rounded-lg">
                <h4 className="text-2xl font-bold mb-4">Extracted CV Text:</h4>
                <p className="text-lg text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {getDisplayText(applicant.text, applicant.id)}
                </p>
                {applicant.text.length > 300 && (
                  <button
                    onClick={() => toggleExpand(applicant.id)}
                    className="text-blue-600 dark:text-blue-400 text-lg mt-4 hover:underline"
                  >
                    {expandedIds.includes(applicant.id) ? "Show less" : "Read more"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ViewApplicants;
