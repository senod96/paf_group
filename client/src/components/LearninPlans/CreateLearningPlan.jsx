import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../Navbar';

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

    const newPlan = { userId, plans: [{ mainTitle, tasks: [] }] };

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
          <div key={`${plan.id}-${idx}`} className="p-6 h-48 w-full rounded-2xl shadow-lg bg-gradient-to-br from-blue-100 to-blue-200 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-4">
              <Link to={`/learning-plans/${plan.id}`} className="text-2xl font-extrabold text-blue-800 text-center hover:underline tracking-wide font-sans">
                {p.mainTitle}
              </Link>
              <div className="flex gap-2">
                <button className="text-blue-600 hover:text-blue-800" onClick={() => navigate(`/learning-plans/${plan.id}`)}>1</button>
                {allowDelete && (
                  <button className="text-gray-600 hover:text-red-500" onClick={() => handleDeletePlan(plan.id)}>🗑️</button>
                )}
              </div>
            </div>

            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {completed} of {tasks.length} tasks completed ({progress}%)
            </p>
            <div className="w-full bg-blue-100 rounded-full h-4">
              <div
                className="h-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        );
      })
    ))
  );

  return (
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto py-12 px-6 font-sans flex flex-col md:flex-row gap-12">
        {activeTab === "your" && (
          <div className="md:w-1/4 mr-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-center text-black mb-6">
              Create New Plan
            </h2>
            <input
              type="text"
              placeholder="Enter Plan Title..."
              value={mainTitle}
              onChange={(e) => setMainTitle(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded-xl shadow-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {error && <p className="text-red-500 mb-3 text-sm text-center">{error}</p>}
            <button
              onClick={handleCreatePlan}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-medium py-3 rounded-xl shadow-lg transition duration-300"
            >
              Create Plan
            </button>
          </div>
        )}

        <div className={`w-full ${activeTab === "your" ? "md:w-3/4" : "md:w-full"}`}>
          <h1 className="text-4xl font-bold mb-10 text-center text-black">
            My Learning Plans
          </h1>

          <div className="flex justify-center mb-8 gap-4">
            <button
              onClick={() => setActiveTab("your")}
              className={`px-6 py-3 rounded-full text-sm font-medium transition duration-300 ${
                activeTab === "your"
                  ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              My Plans
            </button>
            <button
              onClick={() => setActiveTab("real")}
              className={`px-6 py-3 rounded-full text-sm font-medium transition duration-300 ${
                activeTab === "real"
                  ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Real Learning Plans
            </button>
          </div>

          {activeTab === "your" && (
            <>
              {plans.selfCreated.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                  {renderPlans(plans.selfCreated)}
                </div>
              ) : (
                <p className="text-gray-500 mt-8 text-center">No learning plans created yet.</p>
              )}
            </>
          )}

          {activeTab === "real" && (
            <>
              <h2 className="text-4xl font-extrabold mb-6 text-center text-black">
                Real Learning Plans
              </h2>
              {plans.realPlans.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                  {renderPlans(plans.realPlans, false)}
                </div>
              ) : (
                <p className="text-gray-500 mt-8 text-center">No real learning plans added yet.</p>
              )}
            </>
          )}
        </div>
      </div>
</div>
  );
};

export default CreateLearningPlan;
