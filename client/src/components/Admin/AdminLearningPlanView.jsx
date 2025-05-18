import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../Navbar";
import { PlusCircle, Eye, EyeOff, Edit, Trash2 } from "lucide-react";

export default function AvailableLearningPlans() {
  const [plans, setPlans] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editingTask, setEditingTask] = useState({});

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = () => {
    axios
      .get("http://localhost:8080/learning-plans")
      .then((res) => {
        const sitePlans = res.data.filter((p) => p.type === "site");
        setPlans(sitePlans);
      })
      .catch((err) => console.error(err));
  };

  const handleAdd = async (planId) => {
    const userId = localStorage.getItem("user");
    try {
      await axios.post("http://localhost:8080/userplans/add", { planId, userId });
      alert("Plan added to your list!");
    } catch (err) {
      console.error(err);
      alert("Failed to add plan");
    }
  };

  const toggleExpand = (planId) => {
    setExpanded(expanded === planId ? null : planId);
  };

  const handleEditPlan = (plan) => {
    setEditingPlanId(plan.id);
    setEditedTitle(plan.plans?.[0]?.mainTitle || "");
  };

  const handleUpdatePlan = async (planId) => {
    try {
      await axios.put(`http://localhost:8080/learning-plans/${planId}`, {
        plans: [{ mainTitle: editedTitle }]
      });
      fetchPlans();
      setEditingPlanId(null);
    } catch (err) {
      console.error(err);
      alert("Failed to update plan");
    }
  };

  const handleDeletePlan = async (planId) => {
    if (window.confirm("Are you sure you want to delete this plan?")) {
      try {
        await axios.delete(`http://localhost:8080/learning-plans/${planId}`);
        fetchPlans();
      } catch (err) {
        console.error(err);
        alert("Failed to delete plan");
      }
    }
  };

  const handleEditTask = (planId, idx, task) => {
    setEditingTask({ planId, idx, ...task });
  };

  const handleUpdateTask = async () => {
    const { planId, idx, title, description } = editingTask;
    try {
      const plan = plans.find((p) => p.id === planId);
      plan.plans[0].tasks[idx] = { ...plan.plans[0].tasks[idx], title, description };
      await axios.put(`http://localhost:8080/learning-plans/${planId}`, plan);
      fetchPlans();
      setEditingTask({});
    } catch (err) {
      console.error(err);
      alert("Failed to update task");
    }
  };

  const handleDeleteTask = async (planId, idx) => {
    try {
      const plan = plans.find((p) => p.id === planId);
      plan.plans[0].tasks.splice(idx, 1);
      await axios.put(`http://localhost:8080/learning-plans/${planId}`, plan);
      fetchPlans();
    } catch (err) {
      console.error(err);
      alert("Failed to delete task");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 font-sans transition-colors">
      <Navbar />
      <div className="px-10 py-10">
        <h1 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600 mb-8">
          Available Learning Plans
        </h1>

        {plans.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center">
            No available plans right now.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition duration-300 transform hover:-translate-y-1 max-w-sm w-full mx-auto"
              >
                <img
                  src={plan.image}
                  alt="Plan Preview"
                  className="w-full h-40 object-cover rounded-t-2xl transition-transform duration-300 hover:scale-105"
                />
                <div className="p-4">
                  {editingPlanId === plan.id ? (
                    <>
                      <input
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        className="w-full mb-2 p-2 border dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded"
                        placeholder="Enter Title"
                      />
                      <div className="flex gap-2 mb-3">
                        <button
                          onClick={() => handleUpdatePlan(plan.id)}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingPlanId(null)}
                          className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <h2 className="text-xl font-bold mb-1 text-gray-800 dark:text-white">
                        {plan.plans?.[0]?.mainTitle || "Untitled Plan"}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-300 mb-3">
                        {plan.plans?.[0]?.tasks?.length || 0} tasks
                      </p>
                    </>
                  )}

                  <div className="flex gap-2 flex-wrap mb-2">
                    <button
                      onClick={() => handleAdd(plan.id)}
                      className="flex items-center gap-1 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white px-3 py-2 rounded-lg shadow-md text-sm font-semibold"
                    >
                      <PlusCircle size={16} /> Add to My Plans
                    </button>

                    <button
                      onClick={() => toggleExpand(plan.id)}
                      className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-3 py-2 rounded-lg shadow-sm text-sm font-semibold transition-colors"
                    >
                      {expanded === plan.id ? <EyeOff size={16} /> : <Eye size={16} />}
                      {expanded === plan.id ? "Hide Tasks" : "Show Tasks"}
                    </button>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditPlan(plan)}
                        className="flex items-center justify-center bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 p-2 rounded-lg shadow-sm transition-colors"
                        title="Edit Plan"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeletePlan(plan.id)}
                        className="flex items-center justify-center bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 p-2 rounded-lg shadow-sm transition-colors"
                        title="Delete Plan"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {expanded === plan.id && (
                    <div className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-200">
                      {plan.plans?.[0]?.tasks?.map((task, idx) => (
                        <div
                          key={idx}
                          className="bg-white dark:bg-gray-700 rounded-xl p-3 border border-gray-200 dark:border-gray-600 shadow-sm"
                        >
                          {editingTask.planId === plan.id && editingTask.idx === idx ? (
                            <>
                              <input
                                value={editingTask.title}
                                onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                                className="w-full mb-2 p-2 border dark:border-gray-500 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                placeholder="Task Title"
                              />
                              <input
                                value={editingTask.description}
                                onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                                className="w-full mb-2 p-2 border dark:border-gray-500 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                placeholder="Task Description"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={handleUpdateTask}
                                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingTask({})}
                                  className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded text-sm"
                                >
                                  Cancel
                                </button>
                              </div>
                            </>
                          ) : (
                            <>
                              <p className="font-semibold text-gray-800 dark:text-white">{task.title}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-300 mb-2">{task.description}</p>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditTask(plan.id, idx, task)}
                                  className="flex items-center gap-1 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 px-2 py-1 rounded text-xs font-medium transition-colors"
                                >
                                  <Edit size={14} /> Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteTask(plan.id, idx)}
                                  className="flex items-center gap-1 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-1 rounded text-xs font-medium transition-colors"
                                >
                                  <Trash2 size={14} /> Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
