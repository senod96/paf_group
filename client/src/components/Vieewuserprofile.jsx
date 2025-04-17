import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const ViewUserProfile = () => {
  const { id } = useParams(); // Target user ID
  const currentUserId = '67fee3e6eb910d7e093f13ed'; // Current logged-in user
  const [user, setUser] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/users/${id}`);
        const data = await res.json();
        setUser(data);
        setIsFollowing(data.followers?.includes(currentUserId));
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch user:', err);
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleFollow = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/users/${currentUserId}/follow/${id}`, {
        method: 'POST'
      });
      if (res.ok) {
        setIsFollowing(true);
        setUser((prev) => ({
          ...prev,
          followers: [...prev.followers, currentUserId]
        }));
      }
    } catch (err) {
      console.error('Follow failed:', err);
    }
  };

  const handleUnfollow = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/users/${currentUserId}/unfollow/${id}`, {
        method: 'POST'
      });
      if (res.ok) {
        setIsFollowing(false);
        setUser((prev) => ({
          ...prev,
          followers: prev.followers.filter((f) => f !== currentUserId)
        }));
      }
    } catch (err) {
      console.error('Unfollow failed:', err);
    }
  };

  if (loading || !user) {
    return <div className="text-center py-10 text-gray-600">Loading profile...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 font-inter flex justify-center">
      <div className="max-w-3xl w-full bg-white rounded-lg shadow-lg p-6 space-y-6">
        {/* Profile Header */}
        <div className="flex flex-col items-center">
          <img
            src={user.profilePicture || 'https://via.placeholder.com/100'}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border-2 border-blue-100"
          />
          <h2 className="text-xl font-bold text-gray-800 mt-2">{user.name}</h2>
          <p className="text-sm text-gray-500">{user.headline}</p>
          <p className="text-xs text-gray-400">{user.location}</p>
          <p className="text-sm text-gray-600 mt-1">{user.followers?.length || 0} followers</p>

          {isFollowing ? (
            <button
              onClick={handleUnfollow}
              className="mt-2 bg-gray-300 text-gray-800 px-4 py-1 rounded text-sm hover:bg-gray-400 transition"
            >
              Following
            </button>
          ) : (
            <button
              onClick={handleFollow}
              className="mt-2 bg-blue-600 text-white px-4 py-1 rounded text-sm hover:bg-blue-700 transition"
            >
              Follow
            </button>
          )}
        </div>

        {/* Bio */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-1">About</h3>
          <p className="text-gray-600">{user.bio}</p>
        </div>

        {/* Skills */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-1">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {user.skills?.map((skill, idx) => (
              <span key={idx} className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Experience */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-1">Experience</h3>
          <div className="space-y-2">
            {user.experience?.map((exp, idx) => (
              <div key={idx} className="bg-gray-50 border border-gray-200 rounded p-3">
                <p className="font-semibold">{exp.title}</p>
                <p className="text-sm text-gray-500">{exp.company}</p>
                <p className="text-sm text-gray-400">{exp.startDate?.slice(0, 10)} → {exp.endDate?.slice(0, 10)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Education */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-1">Education</h3>
          <div className="space-y-2">
            {user.education?.map((edu, idx) => (
              <div key={idx} className="bg-gray-50 border border-gray-200 rounded p-3">
                <p className="font-semibold">{edu.degree}</p>
                <p className="text-sm text-gray-500">{edu.institution}</p>
                <p className="text-sm text-gray-400">{edu.startDate?.slice(0, 10)} → {edu.endDate?.slice(0, 10)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewUserProfile;
