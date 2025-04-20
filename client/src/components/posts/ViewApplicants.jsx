import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const ViewApplicants = () => {
  const { jobId } = useParams();
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const res = await fetch(`http://localhost:8080/applications/${jobId}/all`);
        if (!res.ok) throw new Error("Failed to fetch applicants");
        const data = await res.json();
        setApplicants(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching applicants:", err);
        setError("Failed to load applicants.");
      } finally {
        setLoading(false);
      }
    };

    fetchApplicants();
  }, [jobId]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">All Applicants</h2>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && applicants.length === 0 && <p>No applications found for this job.</p>}

      {applicants.map((app, index) => (
        <div key={app.id || index} className="border p-4 mb-4 rounded shadow">
          <h3 className="font-bold text-lg">Applicant #{index + 1}</h3>
          <p><strong>User ID:</strong> {app.userId}</p>
          <p><strong>Matching Keywords:</strong> {app.matchingKeywords}</p>
          <p className="text-sm mt-2">
            <strong>Resume Preview:</strong><br />
            {app.text?.slice(0, 300)}...
          </p>
        </div>
      ))}
    </div>
  );
};

export default ViewApplicants;
