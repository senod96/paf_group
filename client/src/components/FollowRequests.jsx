import React, { useEffect, useState } from 'react';
import Navbar from './Navbar';

const FollowRequests = () => {
  const userId = localStorage.getItem("user");
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/follow-requests/pending/${userId}`);
      const data = await res.json();
  
      const requestsWithNames = await Promise.all(data.map(async (req) => {
        try {
          const userRes = await fetch(`http://localhost:8080/api/users/${req.senderId}`);
          const user = await userRes.json();
          return {
            ...req,
            fromUserName: user.name,
          };
        } catch {
          return {
            ...req,
            fromUserName: "Unknown user"
          };
        }
      }));
  
      setRequests(requestsWithNames);
    } catch (err) {
      console.error("Failed to fetch requests", err);
    }
  };
  
  const handleAction = async (id, action) => {
    try {
      await fetch(`http://localhost:8080/api/follow-requests/${id}/${action}`, {
        method: "PUT",
      });

      // Filter out the request that was accepted or rejected
      setRequests((prev) => prev.filter((req) => req.id !== id));
    } catch (err) {
      console.error(`Failed to ${action} request`, err);
      setError(`⚠️ Failed to ${action} request.`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <Navbar/><br></br>  <br></br>
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Follow Requests</h2>

        {error && <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>}

        {requests.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">No follow requests.</p>
        ) : (
          <ul className="space-y-4">
            {requests.map((req) => (
              <li
                key={req.id}
                className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-3 rounded"
              >
                <div className="text-gray-800 dark:text-white">
                  {req.fromUserName || 'Unknown user'} wants to follow you.
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAction(req.id, 'accept')}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleAction(req.id, 'reject')}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default FollowRequests;
