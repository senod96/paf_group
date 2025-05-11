import React, { useState, useEffect } from "react";
import axios from "axios";
import { PayPalButtons } from "@paypal/react-paypal-js";
import Navbar from "./Navbar";

const SubscriptionPlans = () => {
  const [currentType, setCurrentType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [showPayPal, setShowPayPal] = useState(false);

  useEffect(() => {
    const id = localStorage.getItem("user");
    if (!id) {
      setUserId(null);
      setLoading(false);
      return;
    }
    setUserId(id);

    axios.get(`http://localhost:8080/api/users/${id}`)
      .then((res) => {
        setCurrentType(res.data.subscriptionType || "free");
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Failed to load user:", err);
        setCurrentType("free");
        setLoading(false);
      });
  }, []);

  const handleUpgrade = async () => {
    const confirm = window.confirm("Activate Premium Plan?");
    if (!confirm) return;

    try {
      await axios.put(`http://localhost:8080/api/users/${userId}/subscription`, {
        subscriptionType: "premium",
      });
      setCurrentType("premium");
      alert("✅ Premium Activated!");
    } catch (err) {
      console.error(err);
      alert("❌ Activation failed");
    }
  };

  if (loading) return <div className="text-center mt-10">Loading subscription...</div>;
  if (!userId) return <div className="text-center mt-10 text-red-600">Please login to view subscriptions.</div>;

  return (
    <div className="min-h-screen bg-[#f9fafb] dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      <Navbar />
  
      <div className="max-w-4xl mx-auto mt-12 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-indigo-700 dark:text-indigo-400">✨ Choose Your Plan</h1>
  
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Free Plan */}
          <div className={`border rounded-lg p-6 transition ${currentType === "free" ? "border-indigo-500 bg-indigo-50 dark:bg-gray-700" : "border-gray-300 dark:border-gray-600"}`}>
            <h2 className="text-2xl font-semibold mb-4">Free Plan</h2>
            <ul className="list-disc ml-5 space-y-2">
              <li>Access to Learning Plans</li>
              <li>Create and join collaborations</li>
              <li>Follow and connect with users</li>
            </ul>
            <div className="mt-4 text-indigo-600 dark:text-indigo-300 font-semibold">
              {currentType === "free" ? "✔ You are on this plan" : ""}
            </div>
          </div>
  
        {/* Premium Plan */}
<div className={`border rounded-lg p-6 transition ${currentType === "premium" ? "border-green-500 bg-green-50 dark:bg-gray-700" : "border-gray-300 dark:border-gray-600"}`}>
  <h2 className="text-2xl font-semibold mb-4">Premium Plan</h2>
  <ul className="list-disc ml-5 space-y-2">
    <li>📥 Download Learning Plan Analysis PDF</li>
    <li>📚 Create and Publish Courses</li>
    <li>💼 Publish Job Posts</li>
    <li>✨ All Free Features Included</li>
  </ul>

  {currentType === "premium" ? (
    <div className="mt-4 text-green-600 font-semibold">✔ Premium Active</div>
  ) : (
    <div className="mt-6">
      {!showPayPal ? (
        <button
          onClick={() => setShowPayPal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow"
        >
          Subscribe – $9.99
        </button>
      ) : (
        <PayPalButtons
          style={{ layout: "vertical" }}
          createOrder={(data, actions) =>
            actions.order.create({
              purchase_units: [{ amount: { value: "9.99" } }],
            })
          }
          onApprove={async (data, actions) => {
            const details = await actions.order.capture();
            alert("✅ Payment successful!");
            try {
              await axios.put(`http://localhost:8080/api/users/${userId}/subscription`, {
                subscriptionType: "premium",
              });
              setCurrentType("premium");
            } catch (err) {
              console.error("Failed to update subscription:", err);
            }
          }}
          onError={(err) => {
            console.error("PayPal error:", err);
            alert("❌ Payment failed");
          }}
        />
      )}
    </div>
  )}
</div>
        </div>
      </div>
    </div>
  );
  
};

export default SubscriptionPlans;
