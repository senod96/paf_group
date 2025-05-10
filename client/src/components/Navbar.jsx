import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell, FaUserCircle, FaMoon, FaSun } from 'react-icons/fa';

const Navbar = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const userId = localStorage.getItem("user");

  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem("theme") === "dark");

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch user info
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/users/${userId}`);
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };
    if (userId) fetchUser();
  }, [userId]);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/notifications/received?userId=${userId}&unreadOnly=true`);
        const data = await res.json();
        setNotifications(data);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      }
    };
    if (showNotifications && userId) {
      fetchNotifications();
    }
  }, [showNotifications, userId]);

  // Apply dark mode
  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      html.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  return (
    <div className="dark:bg-gray-800 dark:text-gray-100 bg-white shadow px-6 py-4 flex justify-between items-center font-sans z-50 relative">
        <h1
          className="text-2xl font-bold text-blue-700 dark:text-blue-300 cursor-pointer"
          onClick={() => {
            const user = localStorage.getItem('user');
            if (user) {
              navigate('/dashboard'); // ✅ user is logged in
            } else {
              navigate('/login'); // ✅ not logged in
            }
          }}
        >
          Skillora
        </h1>

      <div className="flex items-center gap-6">
        {/* 🔔 Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative text-gray-600 dark:text-gray-300 hover:text-blue-600"
          >
            <FaBell size={20} />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1">
                {notifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 max-h-80 overflow-y-auto bg-white dark:bg-gray-800 border dark:border-gray-700 rounded shadow-lg text-sm z-50">
              <h4 className="px-4 py-2 font-semibold border-b dark:border-gray-700">Notifications</h4>
              {notifications.length === 0 ? (
                <div className="px-4 py-2 text-gray-500 dark:text-gray-400">No unread notifications.</div>
              ) : (
                notifications.map((n, i) => (
                  <div key={i} className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 border-b dark:border-gray-700">
                    <p className="text-gray-800 dark:text-gray-200">{n.message}</p>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* 👤 Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button onClick={() => setShowDropdown(!showDropdown)} className="focus:outline-none">
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt="profile"
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <FaUserCircle size={28} className="text-gray-700 dark:text-gray-300" />
            )}
          </button>

          {showDropdown && (
  <div className="absolute right-0 mt-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md shadow-lg w-52 py-2 text-sm text-gray-700 dark:text-gray-100 z-50">
    <button
      onClick={() => navigate(`/dashboard/${userId}`)}
      className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
    >
      Dashboard
    </button>
    <button
      onClick={() => navigate(`/profile/${userId}`)}
      className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
    >
      Profile
    </button>
    <button
      onClick={() => navigate(`/settings`)}
      className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
    >
      Settings
    </button>

    {/* 💳 Subscription */}
    <button
      onClick={() => navigate(`/subscription`)}
      className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
    >
      Subscription
    </button>

    {/* 🌙 Theme Toggle */}
    <button
      onClick={() => setIsDarkMode(!isDarkMode)}
      className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
    >
      {isDarkMode ? <FaSun /> : <FaMoon />}
      {isDarkMode ? "Light Mode" : "Dark Mode"}
    </button>

    <hr className="my-1 border-gray-200 dark:border-gray-700" />

    <button
      onClick={handleLogout}
      className="block w-full text-left px-4 py-2 hover:bg-red-100 dark:hover:bg-red-600 text-red-600 dark:text-red-400"
    >
      Logout
    </button>
  </div>
)}

        </div>
      </div>
    </div>
  );
};

export default Navbar;
