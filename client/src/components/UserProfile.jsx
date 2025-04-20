import React, { useEffect, useState } from 'react';
import '../index.css';
import { useNavigate } from 'react-router-dom';
import { uploadImageToFirebase } from '../utils/firebaseUploader';

const UserProfile = () => {
  const userId = localStorage.getItem("user");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

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
    fetchUser();
  }, []);

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const imageUrl = await uploadImageToFirebase(file);
      const updatedUser = {
        ...user,
        [type === 'profile' ? 'profilePicture' : 'backgroundImage']: imageUrl
      };

      const res = await fetch(`http://localhost:8080/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser),
      });

      if (res.ok) {
        const updated = await res.json();
        setUser(updated);
      } else {
        console.error("Failed to update user after image upload");
      }
    } catch (err) {
      console.error("Upload error:", err);
    }
  };

  if (!user) return <div className="text-center py-10 text-gray-500">Loading profile...{userId}</div>;

  return (
    <div className="min-h-screen bg-gray-50 font-inter flex justify-center px-4">
      <div className="w-full max-w-4xl">
        <div
          className="h-48 w-full bg-cover bg-center relative rounded-t-xl mb-6"
          style={{
            backgroundImage: user.backgroundImage
              ? `url(${user.backgroundImage})`
              : 'linear-gradient(to right, #bfdbfe, #dbeafe)',
          }}
        >
          <div className="absolute top-3 right-4 flex gap-2">
            <label className="bg-orange-400 text-white px-3 py-1 rounded-full text-sm cursor-pointer hover:bg-orange-500 transition">
              ✏️ Change Cover
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(e, 'background')}
              />
            </label>
          </div>
        </div>

        <div className="bg-white shadow-xl rounded-b-xl px-6 py-8 space-y-8">
          <div className="flex flex-col items-center">
            <div className="relative -mt-16">
              <img
                src={user.profilePicture || 'https://via.placeholder.com/120'}
                alt="Profile"
                className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-md"
              />
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white text-xs px-2 py-1 rounded cursor-pointer hover:bg-blue-700">
                Edit
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, 'profile')}
                />
              </label>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mt-2">
              {user.name || 'No Name'} <span className="text-gray-400 text-sm">{user.username || 'No username'}</span>
              <span className="inline-block ml-1 text-blue-600">✔️</span>
            </h2>
            <p className="text-gray-700 text-sm">{user.headline || 'No headline provided'}</p>
            <p className="text-sm text-gray-500">
              {user.location || 'No location'} ·{' '}
              <span
                onClick={() => navigate('/followers')}
                className="text-blue-600 cursor-pointer hover:underline"
              >
                {user.followers?.length || 0} followers
                <span className="ml-4">{user.following?.length || 0} following</span>
              </span>
            </p>

            <button
              onClick={() => navigate('/edit')}
              className="bg-blue-600 text-white px-4 py-1 mt-2 rounded hover:bg-blue-700 transition text-sm"
            >
              Edit Profile
            </button>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-1">About</h3>
            <p className="text-gray-600">{user.bio || 'No bio available.'}</p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-1">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {user.skills && user.skills.length > 0 ? (
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

          <div>
            <h3 className="font-semibold text-gray-800 mb-1">Education</h3>
            <div className="space-y-3">
              {user.education && user.education.length > 0 ? (
                user.education.map((edu, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-md p-4 bg-gray-50">
                    <p className="font-semibold text-gray-800">{edu.degree || 'No degree'}</p>
                    <p className="text-sm text-gray-600">{edu.institution || 'No institution'}</p>
                    <p className="text-sm text-gray-400">
                      {edu.startDate?.slice(0, 10) || 'N/A'} → {edu.endDate?.slice(0, 10) || 'N/A'}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No education details available.</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-1">Experience</h3>
            <div className="space-y-3">
              {user.experience && user.experience.length > 0 ? (
                user.experience.map((exp, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-md p-4 bg-gray-50">
                    <p className="font-semibold text-gray-800">{exp.title || 'No title'}</p>
                    <p className="text-sm text-gray-600">{exp.company || 'No company'}</p>
                    <p className="text-sm text-gray-400">
                      {exp.startDate?.slice(0, 10) || 'N/A'} → {exp.endDate?.slice(0, 10) || 'N/A'}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No experience added.</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-1">Social Links</h3>
            <ul className="space-y-1 text-blue-600 underline">
              {user.links?.github ? (
                <li><a href={user.links.github} target="_blank" rel="noreferrer">GitHub</a></li>
              ) : <li className="text-gray-400">No GitHub</li>}

              {user.links?.linkedin ? (
                <li><a href={user.links.linkedin} target="_blank" rel="noreferrer">LinkedIn</a></li>
              ) : <li className="text-gray-400">No LinkedIn</li>}

              {user.links?.website ? (
                <li><a href={user.links.website} target="_blank" rel="noreferrer">Website</a></li>
              ) : <li className="text-gray-400">No Website</li>}
            </ul>
          </div>

          {/* ✅ Display full user info */}
          <div className="pt-6 border-t">
            <h3 className="font-semibold text-gray-800 mb-2">Full User Info</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>ID:</strong> {user.id}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Role:</strong> {user.role}</p>
              <p><strong>Auth Provider:</strong> {user.authProvider}</p>
              <p><strong>Verified:</strong> {user.isVerified ? "Yes" : "No"}</p>
              <p><strong>Mobile:</strong> {user.mobile || "N/A"}</p>
              <p><strong>Created At:</strong> {user.createdAt?.slice(0, 10) || "N/A"}</p>
              <p><strong>Updated At:</strong> {user.updatedAt?.slice(0, 10) || "N/A"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
