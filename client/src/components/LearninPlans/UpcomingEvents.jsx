import React, { useEffect, useState } from 'react';

const UpcomingTasks = ({ currentUserId, profileUserId }) => {
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpcomingTasks = async () => {
      try {
        const res = await fetch(`http://localhost:8080/learning-plans/user/${profileUserId}`);
        const data = await res.json();
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);

        const tasks = data.flatMap(plan =>
          plan.plans.flatMap(p =>
            (p.tasks || []).filter(t => {
              const dueDate = new Date(t.endTime);
              return dueDate >= today && dueDate <= nextWeek;
            }).map(t => ({
              ...t,
              planTitle: p.mainTitle
            }))
          )
        );
        setUpcomingTasks(tasks);
      } catch (err) {
        console.error("Error fetching upcoming tasks:", err);
      } finally {
        setLoading(false);
      }
    };

    if (currentUserId === profileUserId) {
      fetchUpcomingTasks();
    }
  }, [currentUserId, profileUserId]);

  if (currentUserId !== profileUserId) return null;

  return (
    <div className="mt-8 bg-gray-50 dark:bg-gray-700 rounded-lg shadow p-6">
      <h2 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-100">🕑 Upcoming Tasks</h2>

      {loading ? (
        <p className="text-gray-500 dark:text-gray-400">Loading upcoming tasks...</p>
      ) : upcomingTasks.length > 0 ? (
        <ul className="space-y-2 text-sm">
          {upcomingTasks.map((task, index) => (
            <li key={index} className="bg-gray-100 dark:bg-gray-600 px-4 py-2 rounded">
              <p><strong>{task.title}</strong> - {task.planTitle}</p>
              <p className="text-gray-600 dark:text-gray-300">
                Due: {new Date(task.endTime).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 dark:text-gray-400">
          No upcoming tasks in the next 7 days.
        </p>
      )}
    </div>
  );
};

export default UpcomingTasks;
