import React, { useEffect, useState, useRef } from 'react';
import Navbar from '../Navbar';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const COLORS = {
  primaryGradient: ['#4F46E5', '#6366F1'], 
  chartDone: '#4F46E5',
  chartInProgress: '#A78BFA', 
  chartPending: '#60A5FA', 
};

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
        setPlans(Array.isArray(data) ? data : data.plans || []);

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

  const getStats = () => {
    let totalPlans = 0, totalTasks = 0, completedTasks = 0;
    plans.forEach(plan => {
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
    plans.forEach(plan =>
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
        backgroundColor: [COLORS.chartDone, COLORS.chartInProgress, COLORS.chartPending],
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
        backgroundColor: [COLORS.chartDone, COLORS.chartInProgress, COLORS.chartPending],
        borderWidth: 1,
      }],
    };
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Learning Plan Progress Report", 14, 20);

    const rows = [];
    plans.forEach(plan =>
      (plan.plans || []).forEach(p => {
        const tasks = p.tasks || [];
        const completed = tasks.filter(t => t.status?.toLowerCase() === "done").length;
        const percent = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;
        rows.push([p.mainTitle, tasks.length, completed, `${percent}%`]);
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

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800 min-h-screen">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-12">
       <h1 className="text-5xl font-extrabold mb-10 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg drop-shadow-2xl leading-relaxed">
  Progress Analytics
</h1>



        {loading ? (
          <p className="text-center text-gray-500 text-lg">Loading analytics...</p>
        ) : (
          <>
            <div className="flex justify-end mb-10">
              <button
                onClick={() => {
                  if (subscriptionType !== "premium") {
                    setShowUpgradeModal(true);
                  } else {
                    exportToPDF();
                  }
                }}
                className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white px-6 py-3 rounded-xl shadow-lg transition duration-300"
              >
                Export Report as PDF
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-14">
              <StatBox label="Total Plans" value={totalPlans} />
              <StatBox label="Total Tasks" value={totalTasks} />
              <StatBox label="Completed Tasks" value={completedTasks} />
              <StatBox label="Completion Rate" value={`${completionRate}%`} />
            </div>

            <section className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 mb-14">
              <h2 className="text-3xl font-bold mb-6 text-gray-700 dark:text-gray-300"> Overall Task Status</h2>
              <div className="flex flex-col md:flex-row items-center justify-center gap-10">
               <div className="w-full md:w-1/2 flex justify-center">
  <div className="w-72 h-72"> {/* Adjust size as needed */}
    <Pie ref={pieChartRef} data={getStatusPieData()} />
  </div>
</div>

                <div className="w-full md:w-1/2 flex justify-center">
                  <Bar
                    ref={barChartRef}
                    data={getStatusPieData()}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { position: 'bottom' } },
                      scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } },
                    }}
                  />
                </div>
              </div>
            </section>

            <h2 className="text-3xl font-bold mb-6 text-gray-700 dark:text-gray-300"> Plan-wise Breakdown</h2>
            <div className="grid gap-8">
              {plans.flatMap(plan =>
                (plan.plans || []).map((p, idx) => {
                  const tasks = p.tasks || [];
                  const done = tasks.filter(t => t.status?.toLowerCase() === "done").length;
                  const progress = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0;
                  return (
                    <div key={`${plan.id}-${idx}`} className="relative bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col gap-4
 dark:from-gray-700 dark:to-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300">
                      <h2 className="text-2xl font-bold text-indigo-700 dark:text-indigo-300 mb-2">{p.mainTitle}</h2>
                      <h1 className="text-lg font-bold text-black-600 dark:text-black-400 mb-4"> {done} of {tasks.length} tasks completed</h1>

                      <div className="flex flex-col md:flex-row md:items-center gap-6">
                        <div className="flex-1">
                          <div className="w-full bg-gray-300 h-3 rounded-full overflow-hidden">
                            <div className="h-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: `${progress}%` }}></div>
                          </div>
                          <p className="text-m font-bold text-black mt-1">{progress}% Completed</p>

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
      </div>
    </div>
  );
};

const StatBox = ({ label, value }) => (
  <div className="relative bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent bg-clip-padding backdrop-blur-md flex flex-col items-center justify-center gap-4">
    <h3 className="text-xl font-bold text-indigo-700 dark:text-indigo-300 flex items-center justify-center gap-2">
       {label}
    </h3>
    <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 text-center">{value}</p>
  </div>
);


export default ProgressAnalytics;
