import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../NotificationList.css';

const NotificationList = () => {
    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState(() => {
        try {
            const stored = localStorage.getItem('user');
            if (stored?.startsWith('{')) {
                return JSON.parse(stored);
            } else if (stored) {
                return { id: stored };
            }
            return null;
        } catch {
            return null;
        }
    });
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(null);
    const [activeTab, setActiveTab] = useState('all');
    const [expandedNotification, setExpandedNotification] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/users');
                setUsers(response.data);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };
        fetchUsers();
    }, []);

    useEffect(() => {
        if (currentUser?.id) {
            const fetchNotifications = async () => {
                try {
                    const response = await axios.get(
                        'http://localhost:8080/api/notifications/for-receiver',
                        { params: { receiverId: currentUser.id } }
                    );
                    const notificationsWithReadStatus = response.data.map(notification => ({
                        ...notification,
                        isRead: notification.isRead || false,
                        senderDetails: users.find(u => u.id === notification.senderId) || null
                    }));
                    setNotifications(notificationsWithReadStatus);
                } catch (error) {
                    console.error('Error fetching notifications:', error);
                }
            };
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 5000);
            return () => clearInterval(interval);
        }
    }, [currentUser, users]);

    const markAsRead = async (notificationId) => {
        try {
            // Optimistically update the notification's read status
            setNotifications(prevNotifications => 
                prevNotifications.map(n => 
                    n.id === notificationId ? { ...n, isRead: true } : n
                )
            );
            
            // Make the API call to mark as read
            await axios.put(`http://localhost:8080/api/notifications/${notificationId}/read`);
            
        } catch (error) {
            console.error('Error marking notification as read:', error);
            // Revert if there's an error
            setNotifications(prevNotifications => 
                prevNotifications.map(n => 
                    n.id === notificationId ? { ...n, isRead: false } : n
                )
            );
        }
    };

    const handleNotificationClick = (notification, e) => {
        if (e.target === e.currentTarget || 
            e.target.classList.contains('notification-content') || 
            e.target.classList.contains('notification-meta')) {
            
            // Toggle expanded view
            setExpandedNotification(expandedNotification === notification.id ? null : notification.id);
            
            // Mark as read if unread
            if (!notification.isRead) {
                markAsRead(notification.id);
            }
        }
    };

    const handleFollowResponse = async (notificationId, accept) => {
        try {
            await axios.post(`http://localhost:8080/api/follows/respond`, {
                notificationId,
                accept
            });
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
        } catch (error) {
            console.error('Error responding to follow:', error);
        }
    };

    const handleFollow = async () => {
        if (!selectedUserId || !currentUser) return;
        setIsLoading(true);
        try {
            await axios.post('http://localhost:8080/api/notifications/follow', null, {
                params: {
                    senderId: currentUser.id,
                    receiverId: selectedUserId
                }
            });
            alert(`Follow request sent to ${users.find(u => u.id === selectedUserId)?.email}`);
            setSelectedUserId('');
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to send request');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteNotification = async (notificationId, e) => {
        e.stopPropagation();
        try {
            await axios.delete(`http://localhost:8080/api/notifications/${notificationId}`);
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
            setShowDropdown(null);
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const toggleDropdown = (notificationId, e) => {
        e.stopPropagation();
        setShowDropdown(showDropdown === notificationId ? null : notificationId);
    };

    useEffect(() => {
        const handleClickOutside = () => {
            setShowDropdown(null);
        };
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    const filteredNotifications = notifications.filter(notification => {
        const isFollowRequest = 
            notification.type === 'follow_request' || 
            notification.message?.toLowerCase().includes('follow request') ||
            notification.message?.toLowerCase().includes('wants to follow you');
        
        switch(activeTab) {
            case 'follow': 
                return isFollowRequest;
            case 'mypost': 
                return notification.type === 'mypost';
            case 'unread': 
                return !notification.isRead;
            default: 
                return true;
        }
    });

    return (
        <div className="notification-app">
            <div className="notification-header">
                <h1>Notifications</h1>
            </div>

            <div className="notification-tabs">
                <button 
                    className={activeTab === 'all' ? 'active' : ''}
                    onClick={() => setActiveTab('all')}
                >
                    All
                </button>
                <button 
                    className={activeTab === 'follow' ? 'active' : ''}
                    onClick={() => setActiveTab('follow')}
                >
                    Follow Requests
                </button>
                <button 
                    className={activeTab === 'mypost' ? 'active' : ''}
                    onClick={() => setActiveTab('mypost')}
                >
                    My Posts
                </button>
                <button 
                    className={activeTab === 'unread' ? 'active' : ''}
                    onClick={() => setActiveTab('unread')}
                >
                    Unread
                </button>
            </div>

            <div className="notification-section">
                <h3>
                    {activeTab === 'all' && 'All Notifications'}
                    {activeTab === 'follow' && 'Follow Requests'}
                    {activeTab === 'mypost' && 'My Posts'}
                    {activeTab === 'unread' && 'Unread Notifications'}
                </h3>
                <div className="notification-feed">
                    {filteredNotifications.length > 0 ? (
                        filteredNotifications.map(notification => (
                            <div 
                                key={notification.id} 
                                className={`notification-item ${!notification.isRead ? 'unread' : ''} ${expandedNotification === notification.id ? 'expanded' : ''}`}
                                onClick={(e) => handleNotificationClick(notification, e)}
                            >
                                {!notification.isRead && <div className="unread-indicator"></div>}
                                <div className="notification-content">
                                    <p className="notification-message">{notification.message}</p>
                                    
                                    {expandedNotification === notification.id && (
                                        <div className="notification-details">
                                            {notification.senderDetails && (
                                                <div className="sender-info">
                                                    <p><strong>From:</strong> {notification.senderDetails.email}</p>
                                                    <p><strong>User ID:</strong> {notification.senderDetails.id}</p>
                                                </div>
                                            )}
                                            <p className="notification-time">{new Date(notification.createdAt).toLocaleString()}</p>
                                        </div>
                                    )}

                                    {notification.type === 'follow_request' && (
                                        <div className="follow-request-actions">
                                            <button 
                                                className="action-button accept"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleFollowResponse(notification.id, true);
                                                }}
                                            >
                                                Accept
                                            </button>
                                            <button 
                                                className="action-button reject"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleFollowResponse(notification.id, false);
                                                }}
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="notification-meta">
                                    <span className="notification-time-short">
                                        {new Date(notification.createdAt).toLocaleTimeString()}
                                    </span>
                                    <div className="notification-actions">
                                        <button 
                                            className="dots-button" 
                                            onClick={(e) => toggleDropdown(notification.id, e)}
                                        >
                                            ●●●
                                        </button>
                                        {showDropdown === notification.id && (
                                            <div className="dropdown-menu" onClick={(e) => e.stopPropagation()}>
                                                <button onClick={(e) => handleDeleteNotification(notification.id, e)}>
                                                    Delete notification
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="post-divider"></div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state">
                            <p>No {activeTab === 'all' ? '' : activeTab + ' '}notifications found</p>
                        </div>
                    )}
                </div>
            </div>
            
            {currentUser && (
                <div className="follow-system">
                    <h2>Send Follow Request</h2>
                    <div className="sender-interface">
                        <select
                            value={selectedUserId}
                            onChange={(e) => setSelectedUserId(e.target.value)}
                        >
                            <option value="">Select user to follow</option>
                            {users.filter(u => u.id !== currentUser.id).map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.email} (ID: {user.id})
                                </option>
                            ))}
                        </select>
                        <button 
                            onClick={handleFollow}
                            disabled={!selectedUserId || isLoading}
                        >
                            {isLoading ? 'Sending...' : 'Follow'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationList;