import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../Navbar';

const LearningPlanDetails = () => {
  const { id } = useParams();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCongrats, setShowCongrats] = useState(false);

  const cleanBadgeUrl = (url) => {
    const cleaned = url.replace(/^"(.*)"$/, '$1');
    console.log("📦 Cleaned Badge URL:", cleaned);
    return cleaned;
  };
  const [newTask, setNewTask] = useState({ title: '', description: '', status: '', startTime: '', endTime: '' });
  const [editingIndex, setEditingIndex] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [sortBy, setSortBy] = useState('startTime');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetch(`http://localhost:8080/learning-plans/${id}`)
      .then(res => res.json())
      .then(data => {
        setPlan(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("❌ Error loading plan:", err);
        setLoading(false);
      });
  }, [id]);

  const validateForm = () => {
    const errors = {};
    if (!newTask.title.trim()) errors.title = 'Title is required';
    if (!newTask.description.trim()) errors.description = 'Description is required';
    if (!newTask.status) errors.status = 'Status is required';
    if (!newTask.startTime) errors.startTime = 'Start time is required';
    if (!newTask.endTime) errors.endTime = 'End time is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (field, value) => {
    setNewTask(prev => ({ ...prev, [field]: value }));
    // Clear error when field is changed
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const resetForm = () => {
    setNewTask({ title: '', description: '', status: '', startTime: '', endTime: '' });
    setEditingIndex(null);
    setShowForm(false);
    setFormErrors({});
  };

  const updateTasksInBackend = (updatedTasks) => {
    const updatedPlan = {
      ...plan,
      plans: [{ ...plan.plans[0], tasks: updatedTasks }]
    };

    fetch(`http://localhost:8080/learning-plans/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedPlan)
    })
      .then(res => res.json())
      .then(data => {
        setPlan(data);

        const allCompleted = updatedTasks.every(t => t.status?.toLowerCase() === 'done');
        if (allCompleted && plan.type !== 'completed') {
          const userId = localStorage.getItem("user");

          fetch(`http://localhost:8080/api/badges/plan/${plan.id}`)
            .then(res => res.text())
            .then(badgeUrl => {
              console.log("🔗 Fetched Badge URL (Raw):", badgeUrl);

              const finalBadgeUrl = cleanBadgeUrl(badgeUrl);

              fetch(`http://localhost:8080/api/badges/user/${userId}/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finalBadgeUrl)
              }).then(() => {
                fetch(`http://localhost:8080/learning-plans/${plan.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ ...plan, type: 'completed' })
                }).then(() => {
                  setShowCongrats(true);
                });
              }).catch(err => console.error("❌ Failed to add badge to user:", err));
            }).catch(err => console.error("❌ Failed to fetch badge URL:", err));
        }
      });  };
  const handleAddTask = () => {
    if (!validateForm()) return;
    
    const updatedTasks = [...(plan.plans[0].tasks || []), newTask];
    updateTasksInBackend(updatedTasks);
  };

  const handleDeleteTask = (index) => {
    const updatedTasks = [...plan.plans[0].tasks];
    updatedTasks.splice(index, 1);
    updateTasksInBackend(updatedTasks);
  };

  const handleEditClick = (index) => {
    setEditingIndex(index);
    setNewTask({ ...plan.plans[0].tasks[index] });
    setShowForm(true);
    setFormErrors({});
  };

  const handleUpdateTask = () => {
    if (!validateForm()) return;
    
    const updatedTasks = [...plan.plans[0].tasks];
    updatedTasks[editingIndex] = newTask;
    updateTasksInBackend(updatedTasks);
  };

  const toggleTaskStatus = (index) => {
    const updatedTasks = [...plan.plans[0].tasks];
    const currentStatus = updatedTasks[index].status?.toLowerCase();
    updatedTasks[index].status = currentStatus === 'done' ? 'Pending' : 'Done';
    updateTasksInBackend(updatedTasks);
  };

  const isOverdue = (endTime) => {
    const now = new Date();
    return endTime && new Date(endTime) < now;
  };

  if (loading) return <div className="text-center py-10 text-lg text-gray-600">Loading plan...</div>;
  if (!plan || !plan.plans?.[0]) return <div className="text-center py-10 text-red-500 font-semibold">Plan not found</div>;

  const taskList = plan.plans[0].tasks || [];
  const completed = taskList.filter(t => t.status?.toLowerCase() === "done").length;
  const progress = taskList.length > 0 ? Math.round((completed / taskList.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-10">
        <Link to="/learning-plans" className="text-blue-600 text-sm mb-4 inline-block">← Back</Link>
        <h1 className="text-3xl font-bold mb-6">{plan.plans[0].mainTitle}</h1>

        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600">
            <span>{completed} of {taskList.length} tasks completed</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-300 h-3 rounded-full">
            <div className="h-3 bg-blue-600 rounded-full" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Tasks */}
        {taskList.map((task, idx) => (
          <div key={idx} className="bg-white shadow-sm rounded-lg p-4 mb-4">
            <div className="flex justify-between">
              <div>
                <h3 className="font-bold text-blue-800">{task.title}</h3>
                <p className="text-gray-700">{task.description}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Start: {task.startTime} | End:
                  <span className={isOverdue(task.endTime) ? "text-red-600 font-semibold" : ""}> {task.endTime}</span>
                </p>
              </div>
              <div className="flex flex-col items-end">
                <input 
                  type="checkbox" 
                  checked={task.status?.toLowerCase() === "done"} 
                  onChange={() => toggleTaskStatus(idx)} 
                  className="h-5 w-5 accent-green-500 mt-2" 
                />
                <span className="text-sm mt-1">{task.status}</span>
              </div>
            </div>
          </div>
        ))}

        {/* Completion Modal */}
       {showCongrats && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md w-full">
      <h2 className="text-2xl font-bold text-green-600 mb-4">🎉 Congratulations!</h2>
      <p className="text-gray-700 mb-6">You've completed this learning plan and earned a new badge!</p>
      <button
        onClick={() => setShowCongrats(false)}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        Close
      </button>
    </div>
  </div>
)}
        {/* Add Task Button */}
        {!showForm && plan.type !== "my" && (
          <div className="mt-8 text-center">
            <button
              onClick={() => {
                setNewTask({ title: '', description: '', status: '', startTime: '', endTime: '' });
                setShowForm(true);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add Task
            </button>
          </div>
        )}

        {/* Task Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl transform transition-all sm:max-w-lg sm:w-full">
              <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    {editingIndex !== null ? 'Edit Task' : 'Add New Task'}
                  </h3>
                  <button
                    type="button"
                    className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={resetForm}
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="task-title" className="block text-sm font-medium text-gray-700">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="task-title"
                      className={`mt-1 block w-full border ${
                        formErrors.title ? 'border-red-500' : 'border-gray-300'
                      } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      value={newTask.title}
                      onChange={(e) => handleChange('title', e.target.value)}
                      disabled={plan.type === "my"}
                    />
                    {formErrors.title && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="task-description" className="block text-sm font-medium text-gray-700">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="task-description"
                      rows={3}
                      className={`mt-1 block w-full border ${
                        formErrors.description ? 'border-red-500' : 'border-gray-300'
                      } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      value={newTask.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      disabled={plan.type === "my"}
                    />
                    {formErrors.description && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="task-status" className="block text-sm font-medium text-gray-700">
                      Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="task-status"
                      className={`mt-1 block w-full border ${
                        formErrors.status ? 'border-red-500' : 'border-gray-300'
                      } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                      value={newTask.status}
                      onChange={(e) => handleChange('status', e.target.value)}
                    >
                      <option value="">Select Status</option>
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
                    </select>
                    {formErrors.status && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.status}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="task-start" className="block text-sm font-medium text-gray-700">
                        Start Time <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        id="task-start"
                        className={`mt-1 block w-full border ${
                          formErrors.startTime ? 'border-red-500' : 'border-gray-300'
                        } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                        value={newTask.startTime}
                        onChange={(e) => handleChange('startTime', e.target.value)}
                      />
                      {formErrors.startTime && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.startTime}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="task-end" className="block text-sm font-medium text-gray-700">
                        End Time <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        id="task-end"
                        className={`mt-1 block w-full border ${
                          formErrors.endTime ? 'border-red-500' : 'border-gray-300'
                        } rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                        value={newTask.endTime}
                        onChange={(e) => handleChange('endTime', e.target.value)}
                      />
                      {formErrors.endTime && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.endTime}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 rounded-b-xl flex justify-end space-x-3">
                <button
                  type="button"
                  className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={resetForm}
                >
                  Cancel
                </button>
                {editingIndex !== null ? (
                  <button
                    type="button"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    onClick={handleUpdateTask}
                  >
                    Update Task
                  </button>
                ) : (
                  <button
                    type="button"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={handleAddTask}
                  >
                    Add Task
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningPlanDetails;
