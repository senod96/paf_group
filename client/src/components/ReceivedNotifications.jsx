import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ReceivedNotifications = ({ currentUserId }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await axios.get(
                    'http://localhost:8080/api/notifications/received', 
                    { params: { userId: currentUserId } }
                );
                setNotifications(response.data);
            } catch (error) {
                console.error('Error fetching notifications:', error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchNotifications();
        
        // Optional: Set up polling or websockets for real-time updates
        const interval = setInterval(fetchNotifications, 10000);
        return () => clearInterval(interval);
    }, [currentUserId]);

    if (loading) return <div>Loading notifications...</div>;

    return (
        <div style={{ marginTop: '30px' }}>
            <h3>Your Notifications</h3>
            {notifications.length === 0 ? (
                <p>No notifications yet</p>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {notifications.map(notification => (
                        <li key={notification.id} style={{
                            padding: '15px',
                            marginBottom: '10px',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '5px',
                            borderLeft: '4px solid #1976d2'
                        }}>
                            <div style={{ fontWeight: 'bold' }}>{notification.message}</div>
                            <div style={{ color: '#6c757d', fontSize: '0.8em' }}>
                                {new Date(notification.createdAt).toLocaleString()}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ReceivedNotifications;