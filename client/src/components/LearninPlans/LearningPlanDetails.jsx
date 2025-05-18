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
      });
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
      </div>
    </div>
  );
};

export default LearningPlanDetails;
