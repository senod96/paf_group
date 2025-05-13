import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import { useNavigate, Link } from 'react-router-dom';

const CreateLearningPlan = () => {
  const userId = localStorage.getItem("user");
  const [mainTitle, setMainTitle] = useState('');
  const [error, setError] = useState('');
  const [plans, setPlans] = useState({ selfCreated: [], realPlans: [] });
  const [activeTab, setActiveTab] = useState("your");
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:8080/learning-plans/user/${userId}`)
      .then(res => res.json())
      .then(data => {
        const selfCreated = data.filter(p => p.type !== "my");
        const realPlans = data.filter(p => p.type === "my");
        setPlans({ selfCreated, realPlans });
      })
      .catch(err => console.error("Error fetching plans:", err));
  }, []);

  const handleCreatePlan = () => {
    if (!mainTitle.trim()) {
      setError("Plan title is required.");
      return;
    }

    const newPlan = {
      userId,
      plans: [{ mainTitle, tasks: [] }]
    };

    fetch('http://localhost:8080/learning-plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPlan)
    })
      .then(res => res.json())
      .then((created) => {
        const newId = created.id;
        navigate(`/learning-plans/${newId}`);
      })
      .catch(err => {
        console.error("Error creating plan:", err);
        setError("Something went wrong. Try again.");
      });
  };

  const handleDeletePlan = (planId) => {
    if (!window.confirm("Are you sure you want to delete this plan?")) return;

    fetch(`http://localhost:8080/learning-plans/${planId}`, {
      method: 'DELETE',
    })
      .then(() => {
        setPlans(prev => ({
          ...prev,
          selfCreated: prev.selfCreated.filter(p => p.id !== planId)
        }));
      })
      .catch(err => console.error("Error deleting plan:", err));
  };

  const renderPlans = (planList, allowDelete = true) => (
    planList.map(plan => (
      plan.plans.map((p, idx) => {
        const tasks = p.tasks || [];
        const completed = tasks.filter(t => t.status?.toLowerCase() === "done").length;
        const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

        return (
          <div
            key={`${plan.id}-${idx}`}
            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="flex justify-between items-center mb-4">
              <Link
                to={`/learning-plans/${plan.id}`}
                className="text-lg font-semibold text-gray-800 hover:underline"
              >
                {p.mainTitle}
              </Link>
              <div className="flex gap-2">
                <button
                  className="text-gray-600 hover:text-indigo-600"
                  onClick={() => navigate(`/learning-plans/${plan.id}`)}
                >
                  ✏️
                </button>
                {allowDelete && (
                  <button
                    className="text-gray-600 hover:text-red-500"
                    onClick={() => handleDeletePlan(plan.id)}
                  >
                    ❌
                  </button>
                )}
              </div>
            </div>

            {tasks.length > 0 && (
              <>
                <p className="text-sm text-gray-500 mb-2">
                  {completed} of {tasks.length} tasks completed ({progress}%)
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </>
            )}
          </div>
        );
      })
    ))
  );

  return (
    <div>
      <Navbar />
      <div className="max-w-5xl mx-auto py-12 px-6 font-sans">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Manage Your Learning Plans</h1>

        <div className="flex justify-center mb-8 gap-4">
          <button
            onClick={() => setActiveTab("your")}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              activeTab === "your" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700"
            }`}
          >
            Your Plans
          </button>
          <button
            onClick={() => setActiveTab("real")}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              activeTab === "real" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700"
            }`}
          >
            Real Learning Plans
          </button>
        </div>

        {activeTab === "your" && (
          <div className="bg-white rounded-lg shadow-md p-8 mb-12">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Create New Plan</h2>
            <input
              type="text"
              placeholder="Enter Plan Title..."
              value={mainTitle}
              onChange={(e) => setMainTitle(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            {error && <p className="text-red-500 mb-3 text-sm">{error}</p>}
            <button
              onClick={handleCreatePlan}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg transition duration-300"
            >
              Create Plan
            </button>
          </div>
        )}

        {activeTab === "your" && (
          <>
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Your Learning Plans</h2>
            {plans.selfCreated.length > 0 ? (
              <div className="grid gap-6">{renderPlans(plans.selfCreated)}</div>
            ) : (
              <p className="text-gray-500 mt-8 text-center">No learning plans created yet.</p>
            )}
          </>
        )}

        {activeTab === "real" && (
          <>
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Real Learning Plans</h2>
            {plans.realPlans.length > 0 ? (
              <div className="grid gap-6">{renderPlans(plans.realPlans, false)}</div>
            ) : (
              <p className="text-gray-500 mt-8 text-center">No real learning plans added yet.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CreateLearningPlan;
