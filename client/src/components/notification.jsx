import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import { useNavigate } from "react-router-dom";

const NotificationComponent = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null); // Track which post to view
  const [isMenuOpen, setIsMenuOpen] = useState(null); // Track which notification's menu is open

  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle viewing a post
  const handleViewPost = (notification) => {
    setSelectedPost(notification);
    markAsRead(notification.id);
  };

  // Function to mark notification as read
  const markAsRead = async (id) => {
    try {
      await axios.patch(`http://localhost:8080/api/notifications/${id}/read`);
      setNotifications(notifications.map(n => 
        n.id === id ? {...n, isRead: true} : n
      ));
    } catch (err) {
      console.error('Error marking notification as read:', err);
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

  const getFilteredNotifications = () => {
    switch (activeTab) {
      case 'Follow Requests':
        return notifications.filter(n => 
          n.message.toLowerCase().includes('follow') || 
          n.message.toLowerCase().includes('connection') ||
          n.message.toLowerCase().includes('connect')
        );
      case 'Post':
        return notifications.filter(n => 
          n.message.toLowerCase().includes('post') || 
          n.message.toLowerCase().includes('comment') ||
          n.message.toLowerCase().includes('reacted') ||
          n.message.toLowerCase().includes('shared') ||
          n.message.toLowerCase().includes('mention') ||
          n.message.toLowerCase().includes('reaction')
        );
      case 'Jobs':
        return notifications.filter(n => 
          n.message.toLowerCase().includes('job') || 
          n.message.toLowerCase().includes('opportunit') ||
          n.message.toLowerCase().includes('position') ||
          n.message.toLowerCase().includes('hire') ||
          n.message.toLowerCase().includes('career')
        );
      default:
        return notifications;
    }
  };

  const getTabCount = (tab) => {
    switch (tab) {
      case 'Follow Requests':
        return notifications.filter(n => 
          n.message.toLowerCase().includes('follow') || 
          n.message.toLowerCase().includes('connection') ||
          n.message.toLowerCase().includes('connect')
        ).length;
      case 'Post':
        return notifications.filter(n => 
          n.message.toLowerCase().includes('post') || 
          n.message.toLowerCase().includes('comment') ||
          n.message.toLowerCase().includes('reacted') ||
          n.message.toLowerCase().includes('shared') ||
          n.message.toLowerCase().includes('mention') ||
          n.message.toLowerCase().includes('reaction')
        ).length;
      case 'Jobs':
        return notifications.filter(n => 
          n.message.toLowerCase().includes('job') || 
          n.message.toLowerCase().includes('opportunit') ||
          n.message.toLowerCase().includes('position') ||
          n.message.toLowerCase().includes('hire') ||
          n.message.toLowerCase().includes('career')
        ).length;
      default:
        return notifications.length;
    }
  };

  const filteredNotifications = getFilteredNotifications();

  // Function to handle "View Request"
  const handleViewRequest = (notification) => {
    console.log("Viewing Follow Request", notification);
    navigate(`/follow-request/${notification.id}`);
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] dark:bg-gray-900 p-6 font-sans text-gray-800 dark:text-gray-100">
      <Navbar /><br />
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-100 mb-6">🔔 Notifications</h2>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto">
          {['All', 'Follow Requests', 'Post', 'Jobs'].map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${activeTab === tab 
                ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400 dark:border-blue-400' 
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
              {getTabCount(tab) > 0 && (
                <span className="ml-1 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">
                  {getTabCount(tab)}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Post View Modal */}
        {selectedPost && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Post Details</h3>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                <p className="text-gray-800 dark:text-gray-100">{selectedPost.message}</p>
                <small className="text-xs text-gray-400">
                  Posted on: {new Date(selectedPost.createdAt).toLocaleString()}
                </small>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">No {activeTab.toLowerCase()} notifications yet</p>
        ) : (
          <>
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 flex flex-col items-start hover:shadow-md transition ${!notification.isRead ? 'border-l-4 border-l-blue-500' : ''}`}
                >
                  <div className="flex justify-between w-full items-center">
                    <div>
                      <p className={`text-sm ${notification.isRead ? 'text-gray-500 dark:text-gray-300' : 'font-semibold text-gray-800 dark:text-gray-100'}`}>
                        {notification.message}
                      </p>
                      <small className="text-xs text-gray-400">{new Date(notification.createdAt).toLocaleString()}</small>
                    </div>
                    <div className="relative">
                      <button
                         onClick={() => setIsMenuOpen(isMenuOpen === notification.id ? null : notification.id)}
                         className="text-gray-700 hover:text-gray-900 dark:text-gray-600 dark:hover:text-gray-500 text-xl"
                      >
                        ⋮
                      </button>

                      {isMenuOpen === notification.id && (
                        <div className="absolute right-0 bg-white dark:bg-gray-800 shadow-lg rounded-lg mt-2 p-2 w-48">
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="block text-sm text-red-600 dark:text-red-400 w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600"
                          >
                            Delete notification
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* View Post Button for post-related notifications */}
                  {(notification.message.toLowerCase().includes('post') || 
                    notification.message.toLowerCase().includes('comment') ||
                    notification.message.toLowerCase().includes('reacted') ||
                    notification.message.toLowerCase().includes('shared')) && (
                      <button
                      onClick={() => navigate('/HomePostList')}
                      className="text-sm text-blue-600 border border-blue-600 hover:bg-blue-50 hover:text-blue-700 px-4 py-1 rounded-full font-semibold transition mt-2"
                    >
                      View Posts
                    </button>
                  )}

                  {/* View Request Button for Follow Requests */}
                  {(notification.message.toLowerCase().includes('follow') || 
                    notification.message.toLowerCase().includes('connection') ||
                    notification.message.toLowerCase().includes('connect')) && (
                      <button
                      onClick={() => navigate('/follow-requests')}
                        className="text-sm text-blue-600 border border-blue-600 hover:bg-blue-50 hover:text-blue-700 px-4 py-1 rounded-full font-semibold transition mt-2"
                      >
                        View Requests
                      </button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationComponent;

