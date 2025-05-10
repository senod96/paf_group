import React, { useEffect, useState } from 'react';
import '../index.css';
import { useParams } from 'react-router-dom';

const UserProfile = () => {
  const { id } = useParams(); // for viewing other users
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/users/${id}`);
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };
    fetchUser();
  }, [id]);

  if (!user) return <div className="text-center text-gray-500 py-10 dark:text-gray-300">Loading profile...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 font-inter">
      <div className="max-w-4xl mx-auto">
        {/* Banner */}
        <div
          className="h-48 w-full bg-cover bg-center rounded-t-xl mb-6"
          style={{
            backgroundImage: user.backgroundImage
              ? `url(${user.backgroundImage})`
              : 'linear-gradient(to right, #bfdbfe, #dbeafe)',
          }}
        />

        {/* Profile Info */}
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-b-xl px-6 py-8 space-y-8">
          <div className="flex flex-col items-center">
            <img
              src={user.profilePicture || 'https://via.placeholder.com/120'}
              alt="Profile"
              className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-md -mt-20"
            />

            <h2 className="text-xl font-bold mt-3">
              {user.name || 'No Name'} <span className="text-sm text-gray-400">@{user.username}</span>
            </h2>
            <p className="text-sm text-gray-500">{user.headline || 'No headline'}</p>
            <p className="text-sm text-gray-500">
              {user.location || 'No location'} · {user.followers?.length || 0} followers · {user.following?.length || 0} following
            </p>
          </div>

          {/* About */}
          <div>
            <h3 className="font-semibold mb-1">About</h3>
            <p className="text-gray-600 dark:text-gray-300">{user.bio || 'No bio available.'}</p>
          </div>

          {/* Skills */}
          <div>
            <h3 className="font-semibold mb-1">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {user.skills?.length ? (
                user.skills.map((skill, index) => (
                  <span key={index} className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No skills added.</p>
              )}
            </div>
          </div>

          {/* Education */}
          <div>
            <h3 className="font-semibold mb-1">Education</h3>
            <div className="space-y-3">
              {user.education?.length ? (
                user.education.map((edu, idx) => (
                  <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-md p-4 bg-gray-50 dark:bg-gray-700">
                    <p className="font-semibold">{edu.degree}</p>
                    <p className="text-sm text-gray-300">{edu.institution}</p>
                    <p className="text-sm text-gray-400">{edu.startDate?.slice(0, 10)} → {edu.endDate?.slice(0, 10)}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No education details available.</p>
              )}
            </div>
          </div>

          {/* Experience */}
          <div>
            <h3 className="font-semibold mb-1">Experience</h3>
            <div className="space-y-3">
              {user.experience?.length ? (
                user.experience.map((exp, idx) => (
                  <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-md p-4 bg-gray-50 dark:bg-gray-700">
                    <p className="font-semibold">{exp.title}</p>
                    <p className="text-sm text-gray-300">{exp.company}</p>
                    <p className="text-sm text-gray-400">{exp.startDate?.slice(0, 10)} → {exp.endDate?.slice(0, 10)}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No experience added.</p>
              )}
            </div>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="font-semibold mb-1">Social Links</h3>
            <ul className="space-y-1 text-blue-600 underline text-sm">
              {user.links?.github ? <li><a href={user.links.github} target="_blank" rel="noreferrer">GitHub</a></li> : <li className="text-gray-400">No GitHub</li>}
              {user.links?.linkedin ? <li><a href={user.links.linkedin} target="_blank" rel="noreferrer">LinkedIn</a></li> : <li className="text-gray-400">No LinkedIn</li>}
              {user.links?.website ? <li><a href={user.links.website} target="_blank" rel="noreferrer">Website</a></li> : <li className="text-gray-400">No Website</li>}
            </ul>
          </div>
        </div>

        {/* Future Post Section */}
        <div className="mt-10 bg-white dark:bg-gray-800 rounded-lg shadow p-6 max-h-[600px] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">Posts by {user.name}</h3>
          <p className="text-gray-400 italic text-sm">No posts yet... coming soon 💬</p>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
