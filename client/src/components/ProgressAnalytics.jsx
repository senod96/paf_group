import React, { useEffect, useState, useRef } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const ProgressAnalytics = () => {
  const storedUser = localStorage.getItem("user");
  const userId = storedUser?.startsWith("{") ? JSON.parse(storedUser).id : storedUser;
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const pieChartRef = useRef();
  const barChartRef = useRef();
  const [subscriptionType, setSubscriptionType] = useState("free");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch(`http://localhost:8080/learning-plans/user/${userId}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setPlans(data);
        } else if (data.plans) {
          setPlans(data.plans);
        }
  
        // 👇 fetch subscription info
        const userRes = await fetch(`http://localhost:8080/api/users/${userId}`);
        const userData = await userRes.json();
        setSubscriptionType(userData.subscriptionType || "free");
      } catch (err) {
        console.error("Error:", err);
        setPlans([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, [userId]);
  
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch(`http://localhost:8080/learning-plans/user/${userId}`);
        const data = await res.json();

        if (Array.isArray(data)) {
          setPlans(data);
        } else if (data.plans) {
          setPlans(data.plans);
        } else {
          console.error("Unexpected response structure:", data);
          setPlans([]);
        }
      } catch (err) {
        console.error("Error fetching plans:", err);
        setPlans([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, [userId]);

  const getStats = () => {
    let totalPlans = 0, totalTasks = 0, completedTasks = 0;

    (plans || []).forEach(plan => {
      (plan.plans || []).forEach(p => {
        totalPlans++;
        const tasks = p.tasks || [];
        totalTasks += tasks.length;
        completedTasks += tasks.filter(t => t.status?.toLowerCase() === 'done').length;
      });
    });

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    return { totalPlans, totalTasks, completedTasks, completionRate };
  };

  const getStatusPieData = () => {
    let done = 0, progress = 0, pending = 0;

    (plans || []).forEach(plan =>
      (plan.plans || []).forEach(p =>
        (p.tasks || []).forEach(task => {
          const status = task.status?.toLowerCase();
          if (status === 'done') done++;
          else if (status === 'in progress') progress++;
          else pending++;
        })
      )
    );

    return {
      labels: ['Done', 'In Progress', 'Pending'],
      datasets: [{
        data: [done, progress, pending],
        backgroundColor: ['#10B981', '#FBBF24', '#EF4444'],
        borderWidth: 1,
      }],
    };
  };

  const getPlanPieData = (tasks = []) => {
    let done = 0, progress = 0, pending = 0;

    tasks.forEach(task => {
      const status = task.status?.toLowerCase();
      if (status === 'done') done++;
      else if (status === 'in progress') progress++;
      else pending++;
    });

    return {
      labels: ['Done', 'In Progress', 'Pending'],
      datasets: [{
        data: [done, progress, pending],
        backgroundColor: ['#10B981', '#FBBF24', '#EF4444'],
        borderWidth: 1,
      }],
    };
  };

  const getStackedBarData = () => {
    const labels = [], doneData = [], progressData = [], pendingData = [];

    (plans || []).forEach(plan =>
      (plan.plans || []).forEach(p => {
        labels.push(p.mainTitle);

        let done = 0, progress = 0, pending = 0;
        (p.tasks || []).forEach(task => {
          const status = task.status?.toLowerCase();
          if (status === 'done') done++;
          else if (status === 'in progress') progress++;
          else pending++;
        });

        doneData.push(done);
        progressData.push(progress);
        pendingData.push(pending);
      })
    );

    return {
      labels,
      datasets: [
        { label: 'Done', data: doneData, backgroundColor: '#10B981' },
        { label: 'In Progress', data: progressData, backgroundColor: '#FBBF24' },
        { label: 'Pending', data: pendingData, backgroundColor: '#EF4444' },
      ],
    };
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Learning Plan Progress Report", 14, 20);

    const rows = [];
    (plans || []).forEach(plan =>
      (plan.plans || []).forEach(p => {
        const tasks = p.tasks || [];
        const completed = tasks.filter(t => t.status?.toLowerCase() === "done").length;
        const percent = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;

        rows.push([
          p.mainTitle,
          tasks.length,
          completed,
          `${percent}%`
        ]);
      })
    );

    autoTable(doc, {
      startY: 30,
      head: [['Plan Title', 'Total Tasks', 'Completed', 'Progress']],
      body: rows,
    });

    const pieCanvas = pieChartRef.current?.canvas;
    const barCanvas = barChartRef.current?.canvas;

    if (pieCanvas && barCanvas) {
      const pieImage = pieCanvas.toDataURL('image/png');
      const barImage = barCanvas.toDataURL('image/png');

      doc.addPage();
      doc.setFontSize(16);
      doc.text("Overall Task Status", 14, 20);
      doc.addImage(pieImage, 'PNG', 40, 30, 130, 130);
      doc.addImage(barImage, 'PNG', 15, 170, 180, 90);
    }

    doc.save('learning-plan-progress-report.pdf');
  };

  const { totalPlans, totalTasks, completedTasks, completionRate } = getStats();
  const alertModal = () => {
    const confirmed = window.confirm(
      "🚫 Premium Only Feature\n\nUpgrade to Premium to download detailed analytics reports as PDF.\n\nClick OK to view subscription plans."
    );
    if (confirmed) {
      window.location.href = "/subscription";
    }
  };
  
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-10 text-center text-indigo-700">📊 Progress Analytics</h1>

      {loading ? (
        <p className="text-center text-gray-500 text-lg">Loading analytics...</p>
      ) : (
        <>
          <div className="flex justify-end mb-10">
          <div className="flex justify-end mb-10">
          <div className="flex justify-end mb-10">
  <button
    onClick={() => {
      if (subscriptionType !== "premium") {
        setShowUpgradeModal(true);
      } else {
        exportToPDF();
      }
    }}
    className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg shadow-lg"
  >
    📤 Export Report as PDF
  </button>
  
</div>

    </div>

          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-14">
            <StatBox label="Total Plans" value={totalPlans} />
            <StatBox label="Total Tasks" value={totalTasks} />
            <StatBox label="Completed Tasks" value={completedTasks} />
            <StatBox label="Completion Rate" value={`${completionRate}%`} />
          </div>

          <h2 className="text-2xl font-semibold mb-6 text-gray-700">📦 Overall Task Status</h2>
          <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col md:flex-row items-center justify-center gap-8 mb-14">
            <div className="w-full md:w-1/2 flex justify-center">
              <div className="w-96 h-96">
                <Pie ref={pieChartRef} data={getStatusPieData()} />
              </div>
            </div>
            <div className="w-full md:w-1/2 flex justify-center">
              <div className="w-full h-[22rem]">
                <Bar
                  ref={barChartRef}
                  data={getStackedBarData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'bottom' } },
                    scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } },
                  }}
                />
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-semibold mb-6 text-gray-700">📘 Plan-wise Breakdown</h2>
          <div className="grid gap-8">
            {(plans || []).flatMap(plan =>
              (plan.plans || []).map((p, idx) => {
                const tasks = p.tasks || [];
                const done = tasks.filter(t => t.status?.toLowerCase() === "done").length;
                const progress = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;

                return (
                  <div
                    key={`${plan.id}-${idx}`}
                    className="bg-gradient-to-r from-gray-100 to-gray-50 rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300"
                  >
                    <h3 className="text-xl font-bold mb-2 text-indigo-700">{p.mainTitle}</h3>
                    <p className="text-gray-600 mb-4 text-sm">{done} of {tasks.length} tasks completed</p>
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                      <div className="flex-1">
                        <div className="w-full bg-gray-300 h-3 rounded-full overflow-hidden">
                          <div
                            className="h-3 bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{progress}% Completed</p>
                      </div>
                      <div className="w-52 h-52">
                        <Pie data={getPlanPieData(tasks)} />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}
      {showUpgradeModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg w-[90%] max-w-md">
      <h2 className="text-2xl font-bold mb-4 text-indigo-600 dark:text-indigo-400">Premium Feature</h2>
      <p className="text-gray-700 dark:text-gray-300 mb-6">
        📄 Downloading detailed analytics reports is only available for <span className="font-semibold text-yellow-500">Premium users</span>. Upgrade now to unlock full access!
      </p>
      <div className="flex justify-end gap-4">
        <button
          onClick={() => setShowUpgradeModal(false)}
          className="px-4 py-2 rounded bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            window.location.href = "/subscription";
          }}
          className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white shadow"
        >
          Explore Plans
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

const StatBox = ({ label, value }) => (
  <div className="bg-white shadow-lg rounded-2xl p-6 text-center hover:shadow-2xl transition-all duration-300">
    <h3 className="text-lg font-medium text-gray-700 mb-2">{label}</h3>
    <p className="text-3xl font-bold text-indigo-600">{value}</p>

  </div>
  
);

export default ProgressAnalytics;
