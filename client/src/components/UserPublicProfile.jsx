import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from './Navbar';
import { useNavigate } from 'react-router-dom';
import PostList from './posts/PostList';
import badgeImg from './badge.png';


const UserPublicProfile = () => {
  const { id } = useParams(); // userId in URL
  const [user, setUser] = useState(null);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);
  const viewingUserId = id || localStorage.getItem('viewingUser'); // support both routes
  
    const navigate = useNavigate();
  

  const currentUserId = localStorage.getItem('user');
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/users/${id}`);
        const data = await res.json();
        setUser(data);
        setIsFollowing(data.followers?.includes(currentUserId));
      } catch (err) {
        console.error('Failed to fetch user:', err);
      }
    };
  
    fetchUser();
    checkFollowRequest();
  
    if (currentUserId === id) {
      fetchUpcomingTasks();
    }
  }, [id, currentUserId]);
  
  const checkFollowRequest = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/follow-requests/pending/${id}`);
      const data = await res.json();
  
      // Check if currentUser already sent request to this user
      const alreadyRequested = data.some(req => req.senderId === currentUserId);
      setHasRequested(alreadyRequested);
    } catch (err) {
      console.error("Failed to check follow request:", err);
    }
  };
  
  const fetchUpcomingTasks = async () => {
    try {
      const res = await fetch(`http://localhost:8080/learning-plans/user/${id}`);
      const data = await res.json();
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);

      const tasks = data.flatMap(plan =>
        plan.plans.flatMap(p =>
          (p.tasks || []).filter(t => {
            const dueDate = new Date(t.endTime);
            return dueDate >= today && dueDate <= nextWeek;
          }).map(t => ({
            ...t,
            planTitle: p.mainTitle
          }))
        )
      );
      setUpcomingTasks(tasks);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  const handleFollow = async () => {
    try {
      // Step 1 - Send Follow Request
      const followRes = await fetch(`http://localhost:8080/api/follow-requests/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUserId,
          receiverId: viewingUserId 
        })
      });
  
      if (followRes.ok) {
        console.log("✅ Follow request sent");
  
        // Step 2 - Send Notification
        const notificationRes = await fetch(`http://localhost:8080/api/notifications/follow?senderId=${currentUserId}&receiverId=${viewingUserId}`, {
          method: 'POST',
        });
  
        if (notificationRes.ok) {
          console.log("✅ Notification sent to receiver");
          setIsFollowing(true); 
        } else {
          console.error("❌ Notification sending failed");
        }
  
      } else {
        console.error("❌ Follow request failed");
      }
    } catch (err) {
      console.error("❌ Follow + notification process failed:", err);
    }
  };
  
  if (!user) return <div className="text-center py-10 text-gray-500">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#f9fafb] dark:bg-gray-900 font-sans text-gray-800 dark:text-gray-100">
      {/* Banner */}
      <Navbar/>
      <div
        className="h-48 w-128 bg-cover bg-center rounded-t-xl"
        style={{
          backgroundImage: user.backgroundImage
            ? `url(${user.backgroundImage})`
            : `url('https://via.placeholder.com/800x200?text=Banner')`,
        }}
      />

      {/* Profile Container */}
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-b-xl p-6 shadow -mt-10 relative z-10">
        {/* Profile Pic */}
        
        <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden -mt-16 mb-4">
          <img
            src={user.profilePicture || 'https://via.placeholder.com/100?text=User'}
            alt="profile"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info */}
        <h2 className={`text-2xl font-bold flex items-center gap-2 ${user.subscriptionType === 'premium' ? 'text-yellow-500' : ''}`}>
          {user.subscriptionType === 'premium' && <span>👑</span>}
          {user.name}
          {user.subscriptionType === 'premium' && (
            <>
              <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded-full">
                Premium
              </span>
              <img
                src={badgeImg} 
                alt="Badge"
                className="w-8 h-8 ml-1"
              />
            </>
          )}
        </h2>
        <p className="text-blue-600">{user.headline}</p>
        <p className="text-gray-600 dark:text-gray-300 mt-2">{user.bio}</p>
        {user.location && <p className="text-sm text-gray-500 mt-1">📍 {user.location}</p>}
        <li>
          <button
            onClick={() => navigate('/follow-requests')}
            className="text-sm hover:underline"
          >
            Follow Requests
          </button>
        </li>

        <p className="text-sm text-gray-500 mt-1">
          👥 {user.followers?.length || 0} followers · {user.following?.length || 0} following
        </p>

        {currentUserId !== id && (
  <div className="mt-3">
    {isFollowing ? (
      <span className="text-green-600 font-medium text-sm">Following</span>
    ) : hasRequested ? (
      <span className="text-yellow-600 font-medium text-sm">Requested</span>
    ) : (
      <button
        onClick={handleFollow}
        className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition text-sm"
      >
        Follow
      </button>
    )}
  </div>
)}

        {/* Skills */}
        {user.skills?.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold mb-1">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {user.skills.map((skill, i) => (
                <span key={i} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {user.education?.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-1">Education</h3>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-200">
              {user.education.map((edu, i) => (
                <li key={i}>
                  <strong>{edu.institution}</strong> - {edu.degree}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Experience */}
        {user.experience?.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-1">Experience</h3>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-200">
              {user.experience.map((exp, i) => (
                <li key={i}>
                  <strong>{exp.company}</strong> - {exp.position}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Links */}
        {user.links && (
          <div className="mt-6">
            <h3 className="font-semibold mb-1">Links</h3>
            <ul className="text-blue-600 underline text-sm space-y-1">
              {user.links.linkedin && (
                <li>
                  <a href={user.links.linkedin} target="_blank" rel="noopener noreferrer">
                    LinkedIn
                  </a>
                </li>
              )}
              {user.links.github && (
                <li>
                  <a href={user.links.github} target="_blank" rel="noopener noreferrer">
                    GitHub
                  </a>
                </li>
              )}
              {user.links.website && (
                <li>
                  <a href={user.links.website} target="_blank" rel="noopener noreferrer">
                    Personal Website
                  </a>
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Upcoming Tasks (only if viewing own profile) */}
        {currentUserId === id && (
          <div className="mt-8 bg-gray-50 dark:bg-gray-700 rounded-lg shadow p-6">
            <h2 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-100">🕑 Upcoming Tasks</h2>
            {upcomingTasks.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {upcomingTasks.map((task, i) => (
                  <li key={i} className="bg-gray-100 dark:bg-gray-600 px-4 py-2 rounded">
                    <p><strong>{task.title}</strong> - {task.planTitle}</p>
                    <p className="text-gray-600 dark:text-gray-300">Due: {new Date(task.endTime).toLocaleString()}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No upcoming tasks in the next 7 days.</p>
            )}
          </div>
          
        )}
        
        <div>
              <PostList/>
              </div>
      </div>
    </div>
  );
};

export default UserPublicProfile;
