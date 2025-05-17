import React, { useState, useEffect } from 'react';
import Navbar from '../Navbar';
import { useNavigate, Link } from 'react-router-dom';

const CreateLearningPlan = () => {
  const userId = localStorage.getItem("user");
  const [mainTitle, setMainTitle] = useState('');
  const [error, setError] = useState('');
  const [plans, setPlans] = useState({ selfCreated: [], realPlans: [] });
  const [activeTab, setActiveTab] = useState("your");
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
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

  const validateForm = () => {
    if (!mainTitle.trim()) {
      setError("Plan title is required.");
      return false;
    }
    if (mainTitle.length > 100) {
      setError("Plan title must be less than 100 characters.");
      return false;
    }
    setError("");
    return true;
  };

  const validateTaskForm = (task) => {
    const errors = {};
    if (!task.title?.trim()) {
      errors.title = "Task title is required";
    }
    if (!task.description?.trim()) {
      errors.description = "Description is required";
    }
    if (!task.dueDate) {
      errors.dueDate = "Due date is required";
    }
    if (!task.priority) {
      errors.priority = "Priority is required";
    }
    return errors;
  };

  const handleCreatePlan = () => {
    if (!validateForm()) return;

    setIsCreating(true);
    const newPlan = { userId, plans: [{ mainTitle, tasks: [] }] };

    fetch('http://localhost:8080/learning-plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPlan)
    })
      .then(res => res.json())
      .then((created) => {
        const newId = created.id;
        setMainTitle('');
        setShowCreateModal(false);
        navigate(`/learning-plans/${newId}`);
      })
      .catch(err => {
        console.error("Error creating plan:", err);
        setError("Something went wrong. Try again.");
      })
      .finally(() => setIsCreating(false));
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

  const renderPlans = (planList, allowDelete = true) => {
    return (
      <>
        {planList.map(plan => (
          plan.plans.map((p, idx) => {
            const tasks = p.tasks || [];
            const completed = tasks.filter(t => t.status?.toLowerCase() === "done").length;
            const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

            return (
              <div 
                key={`${plan.id}-${idx}`} 
                className="group relative p-6 h-56 rounded-xl bg-blue-50 border border-blue-200 dark:bg-gray-800 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <Link 
                      to={`/learning-plans/${plan.id}`} 
                      className="text-xl font-bold text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2"
                    >
                      {p.mainTitle}
                    </Link>
                    {allowDelete && (
                      <button 
                        className="text-gray-400 hover:text-red-500 transition-colors p-1 -mr-1 -mt-1"
                        onClick={(e) => {
                          e.preventDefault();
                          handleDeletePlan(plan.id);
                        }}
                        aria-label="Delete plan"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>

                  <div className="mt-auto">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-black-600 dark:text-black-300">
                        Progress
                      </span>
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                        {progress}%
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div
                        className="h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-700"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center mt-4">
                      <span className="text-sm text-black-500 dark:text-gray-400">
                        {completed} of {tasks.length} tasks
                      </span>
                      <button 
                        onClick={() => navigate(`/learning-plans/${plan.id}`)}
                        className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors flex items-center"
                      >
                        View Details
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ))}
        
        {/* Add Create New Plan tile at the end */}
        {allowDelete && (
          <div 
            onClick={() => setShowCreateModal(true)}
            className="relative p-6 h-56 rounded-xl border-2 border-dashed border-blue-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer group"
          >
            <div className="w-12 h-12 mb-4 rounded-full bg-blue-100 dark:bg-gray-700 flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-gray-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Create New Plan</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 text-center">Start a new learning journey</p>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">

          <div className="flex-1">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
                {activeTab === "your" ? "My Learning Plans" : "Available Learning Plans"}
              </h1>
            
            </div>

            <div className="flex justify-center mb-8">
              <nav className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl shadow-sm" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab("your")}
                  className={`px-5 py-2.5 text-sm font-bold rounded-lg transition-colors ${
                    activeTab === "your"
                      ? "bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400"
                      : "text-black-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  My Plans
                </button>
                <button
                  onClick={() => setActiveTab("real")}
                  className={`px-5 py-2.5 text-sm font-bold rounded-lg transition-colors ${
                    activeTab === "real"
                      ? "bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400"
                      : "text-black-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  Available Plans
                </button>
              </nav>
            </div>

            {activeTab === "your" ? (
              plans.selfCreated.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {renderPlans(plans.selfCreated)}
                </div>
              ) : (
                <div 
                  onClick={() => setShowCreateModal(true)}
                  className="max-w-md mx-auto text-center py-12 cursor-pointer"
                >
                  <div className="mx-auto h-24 w-24 text-gray-400 dark:text-gray-500 group">
                    <div className="w-full h-full rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 group-hover:border-blue-500 dark:group-hover:border-blue-400 transition-colors flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Create your first plan</h3>
                  <p className="mt-2 text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                    Click here to start your learning journey
                  </p>
                </div>
              )
            ) : plans.realPlans.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {renderPlans(plans.realPlans, false)}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto h-24 w-24 text-gray-400 dark:text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No professional plans available</h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                  Check back later for curated learning paths.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Plan Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">Create New Plan</h3>
              <button 
                onClick={() => {
                  setShowCreateModal(false);
                  setError('');
                  setMainTitle('');
                }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="modal-plan-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Plan Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="modal-plan-title"
                  type="text"
                  placeholder="e.g. Master React in 30 Days"
                  value={mainTitle}
                  onChange={(e) => {
                    setMainTitle(e.target.value);
                    if (error) validateForm();
                  }}
                  onBlur={validateForm}
                  maxLength={100}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  autoFocus
                  required
                />
                {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
                  {mainTitle.length}/100 characters
                </p>
              </div>
              
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setError('');
                    setMainTitle('');
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePlan}
                  disabled={isCreating || !!error}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isCreating ? 'Creating...' : 'Create Plan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateLearningPlan;