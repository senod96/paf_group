import React from 'react';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const navigate = useNavigate();
  const userId = localStorage.getItem('user');

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 font-sans p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">⚙️ Settings</h1>

        <div className="space-y-6">
          {/* Profile Settings */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">👤 Profile Settings</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
              Update your personal profile information.
            </p>
            <button
              onClick={() => navigate(`/edit`)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Edit Profile
            </button>
          </div>

          {/* Account Settings */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">📧 Account Settings</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
              Manage your email and password.
            </p>
            <button
              onClick={() => navigate(`/account-settings`)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Manage Account
            </button>
          </div>

          {/* Notifications Settings */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">🔔 Notifications Settings</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
              Control your notifications preferences.
            </p>
            <button
              onClick={() => navigate(`/notification-settings`)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Manage Notifications
            </button>
          </div>

          {/* Theme Settings */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">🎨 Theme Settings</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
              Switch between Light and Dark mode.
            </p>
            <button
              onClick={() => {
                const html = document.documentElement;
                if (html.classList.contains('dark')) {
                  html.classList.remove('dark');
                  localStorage.setItem('theme', 'light');
                } else {
                  html.classList.add('dark');
                  localStorage.setItem('theme', 'dark');
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Toggle Theme
            </button>
          </div>

          {/* Security Settings */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">🛡️ Security Settings</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
              Manage your security and two-factor authentication.
            </p>
            <button
              onClick={() => navigate(`/security-settings`)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Manage Security
            </button>
          </div>

          {/* Logout */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center">
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded font-semibold"
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
