import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from './Navbar';

const NotificationComponent = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/notifications/received`, {
        params: { userId }
      });
      const sorted = [...res.data].sort((a, b) => {
        if (a.isRead === b.isRead) {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        return a.isRead ? 1 : -1;
      });
      setNotifications(sorted);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/notifications/${id}`);
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const clearAllNotifications = async () => {
    try {
      await axios.delete(`http://localhost:8080/api/notifications/clear`, {
        params: { receiverId: userId }
      });
      setNotifications([]);
    } catch (err) {
      console.error('Error clearing notifications:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] dark:bg-gray-900 p-6 font-sans text-gray-800 dark:text-gray-100">
      <Navbar/><br/>
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-6">🔔 Notifications</h2>

        {notifications.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">No notifications yet</p>
        ) : (
          <>
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 flex justify-between items-center hover:shadow-md transition"
                >
                  <div>
                    <p className={`text-sm ${notification.isRead ? 'text-gray-500 dark:text-gray-300' : 'font-semibold text-gray-800 dark:text-gray-100'}`}>
                      {notification.message}
                    </p>
                    <small className="text-xs text-gray-400">{new Date(notification.createdAt).toLocaleString()}</small>
                  </div>
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-center mt-8">
              <button
                onClick={clearAllNotifications}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition text-sm font-medium"
              >
                🧹 Clear All
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationComponent;
