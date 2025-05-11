import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import profilePic from "../posts/pfp.jpg";

const ViewApplicants = () => {
  const { jobId } = useParams();
  const [applicants, setApplicants] = useState([]);
  const [expandedIds, setExpandedIds] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`http://localhost:8080/applications/${jobId}/all`)
      .then((res) => res.json())
      .then((data) => setApplicants(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error("Error fetching applicants:", err);
        setError("Failed to load applicants.");
      });
  }, [jobId]);

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
    <div className="max-w-5xl mx-auto p-6 font-serif">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Applicants for Job ID: {jobId}</h2>
      {error && <p className="text-red-600">{error}</p>}

      {applicants.length === 0 && (
        <p className="text-gray-600">No applicants found for this job.</p>
      )}

      {applicants.map((applicant) => (
        <div key={applicant.id} className="bg-white border shadow rounded p-6 mb-8">
          <div className="flex items-start gap-6">
            <img
              src={profilePic}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border"
            />

            <div className="flex-1 space-y-1 text-gray-800 text-[15px]">
              <h3 className="text-2xl font-semibold">{applicant.fullName}</h3>
              <p><strong>Address:</strong> {applicant.address}</p>
              <p><strong>Experience:</strong> {applicant.workExperience}</p>
              <p><strong>Age:</strong> {applicant.age}</p>
              <p><strong>Gender:</strong> {applicant.gender}</p>
              <p><strong>Contact:</strong> {applicant.contactNumber}</p>
              <p><strong>Email:</strong> {applicant.email}</p>
              <p><strong>Matching Keywords:</strong> {applicant.matchingKeywords}</p>
              {applicant.position > 0 && (
                <p className="text-green-600 font-medium">Ranked #{applicant.position}</p>
              )}
            </div>
          </div>

          <div className="mt-6 bg-gray-50 p-4 rounded">
            <h4 className="font-semibold mb-2 text-gray-700 text-lg">Extracted CV Text:</h4>
            <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
              {getDisplayText(applicant.text, applicant.id)}
            </p>
            {applicant.text.length > 300 && (
              <button
                className="text-blue-600 mt-2 text-sm"
                onClick={() => toggleExpand(applicant.id)}
              >
                {expandedIds.includes(applicant.id) ? "Show less" : "Read more"}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ViewApplicants;
