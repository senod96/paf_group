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

  const handleChange = (field, value) => {
    setNewTask(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setNewTask({ title: '', description: '', status: '', startTime: '', endTime: '' });
    setEditingIndex(null);
    setShowForm(false);
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
  };

  const handleUpdateTask = () => {
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
    <div>
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* Back Link */}
        <Link to="/learning-plans" className="text-blue-600 hover:underline text-sm mb-6 inline-block">← Back to Plans</Link>

        {/* Plan Title */}
        <h1 className="text-4xl font-bold mb-8 text-gray-800">{plan.plans[0].mainTitle}</h1>

        {/* Progress Bar */}
        {taskList.length > 0 && (
          <div className="mb-10">
            <div className="flex justify-between items-center mb-2">
              <p className="text-gray-600">{completed} of {taskList.length} tasks completed</p>
              <p className="text-sm text-gray-500">{progress}%</p>
            </div>
            <div className="w-full bg-gray-300 rounded-full h-4">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-700 h-4 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="flex flex-wrap gap-4 mb-10">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 min-w-[200px] border border-blue-300 px-4 py-2 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-300"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-blue-300 px-4 py-2 rounded-xl shadow-sm text-sm bg-gradient-to-r from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="All">All Tasks</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-blue-300 px-4 py-2 rounded-xl shadow-sm text-sm bg-gradient-to-r from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="startTime">Sort by Start Time</option>
            <option value="endTime">Sort by End Time</option>
            <option value="status">Sort by Status</option>
          </select>
        </div>

        {/* Task List */}
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task, idx) => (
            <div key={idx} className="relative bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl p-6 mb-6 shadow-lg">
              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  checked={task.status?.toLowerCase() === "done"}
                  onChange={() => toggleTaskStatus(idx)}
                  className="mt-2 accent-green-500"
                />
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-blue-800">{highlightMatch(task.title)}</h3>
                  <p className="text-gray-700 mt-1">{highlightMatch(task.description)}</p>
                  <div className="text-sm text-gray-500 mt-2">
                    <p><strong>Status:</strong> {highlightMatch(task.status)}</p>
                    <p><strong>Start:</strong> {task.startTime}</p>
                    <p className={isOverdue(task.endTime) && task.status?.toLowerCase() !== "done" ? 'text-red-500' : ''}>
                      <strong>End:</strong> {task.endTime}
                      {isOverdue(task.endTime) && task.status?.toLowerCase() !== "done" && (
                        <span className="ml-2 text-xs font-bold">⚠️ Overdue</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Edit/Delete Buttons */}
              <div className="absolute top-4 right-4 flex space-x-2">
                <button
                  onClick={() => handleEditClick(idx)}
                  className="text-sm bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white px-3 py-1 rounded shadow-md"
                >
                Edit
                </button>

                {/* Delete only for My Plans */}
                {plan.type !== "my" && (
                  <button
                    onClick={() => handleDeleteTask(idx)}
                    className="text-sm bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white px-3 py-1 rounded shadow-md"
                  >
                   Delete
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-center mt-10">No tasks found matching your filters.</p>
        )}

        {/* Add Task Button */}
        {!showForm && (
          <div className="text-center mt-10">
            <button
              onClick={() => {
                setNewTask({ title: '', description: '', status: '', startTime: '', endTime: '' });
                setShowForm(true);
              }}
              className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl shadow-lg"
            >
            Add Task
            </button>
          </div>
        )}

        {/* Task Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mt-10">
            <h3 className="text-2xl font-bold mb-6">{editingIndex !== null ? 'Edit Task' : 'Add New Task'}</h3>

            <div className="grid gap-4">
              {/* Disable title/description for Available Plans */}
              <input
                type="text"
                placeholder="Task Title"
                value={newTask.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full p-3 border rounded shadow-sm"
                disabled={plan.type === "my"}
              />
              <input
                type="text"
                placeholder="Description"
                value={newTask.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="w-full p-3 border rounded shadow-sm"
                disabled={plan.type === "my"}
              />
              <select
                value={newTask.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full p-3 border rounded shadow-sm"
              >
                <option value="">Select Status</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
              <input
                type="datetime-local"
                value={newTask.startTime}
                onChange={(e) => handleChange('startTime', e.target.value)}
                className="w-full p-3 border rounded shadow-sm"
              />
              <input
                type="datetime-local"
                value={newTask.endTime}
                onChange={(e) => handleChange('endTime', e.target.value)}
                className="w-full p-3 border rounded shadow-sm"
              />
            </div>

            {/* Form Buttons */}
            <div className="flex gap-4 mt-6">
              {editingIndex !== null ? (
                <button
                  onClick={handleUpdateTask}
                  className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg w-full"
                >
                  Update Task
                </button>
              ) : (
                <button
                  onClick={handleAddTask}
                  className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white py-3 px-6 rounded-lg w-full"
                >
                Save Task
                </button>
              )}
              <button
                onClick={resetForm}
                className="bg-gray-400 hover:bg-gray-500 text-white py-3 px-6 rounded-lg w-full"
              >
              Cancel
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default LearningPlanDetails;
