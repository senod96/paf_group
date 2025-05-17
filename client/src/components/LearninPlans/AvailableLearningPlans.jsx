import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../Navbar";
import { PlusCircle, Eye, EyeOff } from "lucide-react";

export default function AvailableLearningPlans() {
  const [plans, setPlans] = useState([]);
  const [expanded, setExpanded] = useState(null); // track which card is expanded

  useEffect(() => {
    axios
      .get("http://localhost:8080/learning-plans")
      .then((res) => {
        const sitePlans = res.data.filter((p) => p.type === "site");
        setPlans(sitePlans);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleAdd = async (planId) => {
    const userId = localStorage.getItem("user");
    try {
      await axios.post("http://localhost:8080/userplans/add", {
        planId,
        userId
      });
      alert("Plan added to your list!");
    } catch (err) {
      console.error(err);
      alert("Failed to add plan");
    }
  };

  const toggleExpand = (planId) => {
    setExpanded(expanded === planId ? null : planId);
  };

return (
  <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 font-sans">
    <Navbar />

    <div className="px-10 py-10">
      <h1 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-700 font-sans mb-8">
  Available Learning Plans
</h1>



      {plans.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">No available plans right now.</p>
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
                <h2 className="text-xl font-bold mb-1 text-gray-800 dark:text-white">
                  {plan.plans?.[0]?.mainTitle || "Untitled Plan"}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-300 mb-3">
                  {plan.plans?.[0]?.tasks?.length || 0} tasks
                </p>

                {/* Action Buttons */}
                <div className="flex gap-3 mb-2">
                  <button
                    onClick={() => handleAdd(plan.id)}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white px-4 py-2 rounded-lg shadow-md transition text-sm font-semibold"
                  >
                    <PlusCircle size={16} /> Add to My Plans
                  </button>

                  <button
                    onClick={() => toggleExpand(plan.id)}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-semibold"
                  >
                    {expanded === plan.id ? <EyeOff size={16} /> : <Eye size={16} />}
                    {expanded === plan.id ? "Hide Tasks" : "Show Tasks"}
                  </button>
                </div>

                {/* Task List */}
                {expanded === plan.id && (
                  <div className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-200">
                    {plan.plans?.[0]?.tasks?.map((task, idx) => (
                      <div
                        key={idx}
                        className="bg-white dark:bg-gray-700 rounded-xl p-3 border border-gray-200 dark:border-gray-600 shadow-sm"
                      >
                        <p className="font-semibold text-gray-800 dark:text-white">{task.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-300">{task.description}</p>
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
