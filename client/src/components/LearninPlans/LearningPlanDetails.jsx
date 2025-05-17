import React, { useEffect, useState } from 'react';
import Navbar from '../Navbar';
import { useParams, Link } from 'react-router-dom';

const LearningPlanDetails = () => {
  const { id } = useParams();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
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
        console.error("Error loading plan:", err);
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
        resetForm();
      });
  };

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

  const getSortedTasks = () => {
    const sorted = [...taskList];
    if (sortBy === "startTime") sorted.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    if (sortBy === "endTime") sorted.sort((a, b) => new Date(a.endTime) - new Date(b.endTime));
    if (sortBy === "status") sorted.sort((a, b) => a.status.localeCompare(b.status));
    return sorted;
  };

  const filteredTasks = getSortedTasks().filter(task => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = (
      task.title?.toLowerCase().includes(term) ||
      task.description?.toLowerCase().includes(term) ||
      task.status?.toLowerCase().includes(term)
    );
    const matchesStatus =
      statusFilter === "All" || (task.status?.toLowerCase() === statusFilter.toLowerCase());
    return matchesSearch && matchesStatus;
  });

  const highlightMatch = (text) => {
    if (!searchTerm) return text;
    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
    return parts.map((part, i) => (
      part.toLowerCase() === searchTerm.toLowerCase()
        ? <mark key={i} className="bg-yellow-200">{part}</mark>
        : part
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link to="/learning-plans" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Plans
        </Link>

        {/* Plan Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-200">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{plan.plans[0].mainTitle}</h1>
          
          {/* Progress Bar */}
          {taskList.length > 0 && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">
                  {completed} of {taskList.length} tasks completed
                </span>
                <span className="text-sm font-semibold text-blue-600">
                  {progress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="h-2.5 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-blue-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 sm:text-sm rounded-lg bg-gradient-to-r from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 text-gray-900"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 sm:text-sm rounded-lg bg-gradient-to-r from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 text-gray-900"
            >
              <option value="startTime">Sort by Start</option>
              <option value="endTime">Sort by End</option>
              <option value="status">Sort by Status</option>
            </select>
          </div>
        </div>

        {/* Task List */}
        {filteredTasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTasks.map((task, idx) => (
              <div 
                key={idx} 
                className="relative p-6 h-56 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => toggleTaskStatus(idx)}
                    className={`mt-1 flex-shrink-0 h-5 w-5 rounded-full border ${
                      task.status?.toLowerCase() === 'done' 
                        ? 'bg-green-500 border-green-600 flex items-center justify-center' 
                        : 'border-gray-400'
                    }`}
                  >
                    {task.status?.toLowerCase() === 'done' && (
                      <svg className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-blue-800">
                      {highlightMatch(task.title)}
                    </h3>
                    {task.description && (
                      <p className="text-gray-700 mt-1">
                        {highlightMatch(task.description)}
                      </p>
                    )}
                    
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center text-sm">
                        <span className="text-gray-600 mr-2">Status:</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          task.status?.toLowerCase() === 'done' 
                            ? 'bg-green-100 text-green-800' 
                            : task.status?.toLowerCase() === 'in progress' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {highlightMatch(task.status)}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {task.startTime}
                      </div>
                      
                      <div className={`flex items-center text-sm ${
                        isOverdue(task.endTime) && task.status?.toLowerCase() !== 'done' 
                          ? 'text-red-500' 
                          : 'text-gray-600'
                      }`}>
                        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {task.endTime}
                        {isOverdue(task.endTime) && task.status?.toLowerCase() !== 'done' && (
                          <span className="ml-2 text-xs font-medium bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                            Overdue
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex space-x-2">
                  <button
                    onClick={() => handleEditClick(idx)}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Edit
                  </button>
                  
                  {plan.type !== "my" && (
                    <button
                      onClick={() => handleDeleteTask(idx)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No tasks found</h3>
            <p className="mt-1 text-gray-500">
              {searchTerm || statusFilter !== 'All' 
                ? "Try adjusting your search or filter criteria" 
                : "Get started by adding your first task"}
            </p>
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