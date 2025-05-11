import React, { useState, useEffect } from 'react';
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
    const confirmDelete = window.confirm("Are you sure you want to delete this plan?");
    if (!confirmDelete) return;

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

  const renderPlans = (planList, allowDelete = true) => {
    return planList.map((plan) =>
      plan.plans.map((p, idx) => {
        const tasks = p.tasks || [];
        const completed = tasks.filter(t => t.status?.toLowerCase() === "done").length;
        const progress = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;

        return (
          <div
            key={`${plan.id}-${idx}`}
            className="bg-white border-l-4 rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 
            border-indigo-400 relative"
          >
            <div className="flex justify-between items-center mb-4">
              <Link
                to={`/learning-plans/${plan.id}`}
                className="text-xl font-bold text-indigo-700 hover:underline"
              >
                {p.mainTitle}
              </Link>
              <div className="flex gap-2">
                <button
                  className="bg-yellow-400 hover:bg-yellow-500 text-white text-sm px-4 py-2 rounded-lg"
                  onClick={() => navigate(`/learning-plans/${plan.id}`)}
                >
                  ✏️ Edit
                </button>
                {allowDelete && (
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded-lg"
                    onClick={() => handleDeletePlan(plan.id)}
                  >
                    ❌ Delete
                  </button>
                )}
              </div>
            </div>

            {tasks.length > 0 && (
              <>
                <p className="text-sm text-gray-600 mb-2">
                  {completed} of {tasks.length} tasks completed ({progress}%)
                </p>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </>
            )}
          </div>
        );
      })
    );
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-6 font-poppins">
      <h1 className="text-4xl font-bold mb-10 text-center text-indigo-700">📘 Manage Your Learning Plans</h1>

      {/* Tab Switch */}
      <div className="flex justify-center mb-8 gap-4">
        <button
          onClick={() => setActiveTab("your")}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === "your"
              ? "bg-indigo-600 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
        >
          📝 Your Plans
        </button>
        <button
          onClick={() => setActiveTab("real")}
          className={`px-4 py-2 rounded-lg font-medium ${
            activeTab === "real"
              ? "bg-indigo-600 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
        >
          🧩 Real Learning Plans
        </button>
      </div>

      {/* Create Plan Form (only for "your" tab) */}
      {activeTab === "your" && (
        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">➕ Create New Plan</h2>

          <input
            type="text"
            placeholder="Enter Plan Title..."
            value={mainTitle}
            onChange={(e) => setMainTitle(e.target.value)}
            className="w-full p-4 border border-gray-300 rounded-lg shadow-sm mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
          {error && <p className="text-red-500 mb-3 text-sm">{error}</p>}

          <button
            onClick={handleCreatePlan}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition duration-300"
          >
            ➕ Create Plan
          </button>
        </div>
      )}

      {/* Your Plans */}
      {activeTab === "your" && (
        <>
          <h2 className="text-3xl font-semibold mb-6 text-gray-800">🗂 Your Learning Plans</h2>
          {plans.selfCreated.length > 0 ? (
            <div className="grid gap-6">{renderPlans(plans.selfCreated)}</div>
          ) : (
            <p className="text-gray-500 mt-8 text-center">No learning plans created yet.</p>
          )}
        </>
      )}

      {/* Real Learning Plans */}
      {activeTab === "real" && (
        <>
          <h2 className="text-3xl font-semibold mb-6 text-gray-800">✅ Real Learning Plans</h2>
          {plans.realPlans.length > 0 ? (
            <div className="grid gap-6">{renderPlans(plans.realPlans, false)}</div>
          ) : (
            <p className="text-gray-500 mt-8 text-center">No real learning plans added yet.</p>
          )}
        </>
      )}
    </div>
  );
};

export default CreateLearningPlan;
