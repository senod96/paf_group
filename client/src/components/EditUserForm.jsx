import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadImageToFirebase } from "../utils/firebaseUploader.js";

const EditUserForm = () => {
  const userId = localStorage.getItem("user");
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/users/${userId}`);
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error('Failed to fetch user:', err);
      }
    };
    fetchUser();
  }, [userId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setUser((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }));
    } else if (type === 'checkbox') {
      setUser((prev) => ({ ...prev, [name]: checked }));
    } else {
      setUser((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Saving...');
    try {
      const res = await fetch(`http://localhost:8080/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });

      if (res.ok) {
        setStatus('✅ Profile updated!');
        window.location.reload();
      } else {
        setStatus('❌ Failed to update profile.');
      }
    } catch (err) {
      console.error('Update error:', err);
      setStatus('❌ Something went wrong.');
    }
  };

  if (!user) return <div className="text-center py-10 text-gray-600 dark:text-gray-100">Loading form...</div>;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 flex items-center justify-center font-inter">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-10 rounded-lg shadow-lg w-full max-w-3xl space-y-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-gray-100">Edit Profile</h2>

        {/* Profile Picture Upload */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Profile Picture</h3>
          <div className="flex items-center gap-4">
            <img
              src={user.profilePicture || 'https://via.placeholder.com/100'}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover"
            />
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files[0];
                if (file) {
                  setLoading(true);
                  setStatus('Uploading...');
                  try {
                    const imageUrl = await uploadImageToFirebase(file);
                    setUser(prev => ({ ...prev, profilePicture: imageUrl }));
                    setStatus('✅ Profile picture updated!');
                  } catch (err) {
                    console.error("Image upload failed", err);
                    setStatus('❌ Image upload failed');
                  }
                  setLoading(false);
                }
              }}
              className="p-2"
            />
          </div>
        </div>

        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Basic Info</h3>
          <input name="name" value={user.name} onChange={handleChange} placeholder="Name" className="w-full p-3 rounded-md dark:bg-gray-700 dark:text-white" />
          <input name="email" value={user.email} onChange={handleChange} placeholder="Email" className="w-full p-3 rounded-md dark:bg-gray-700 dark:text-white" />
          <input name="password" value={user.password} onChange={handleChange} placeholder="Password" type="password" className="w-full p-3 rounded-md dark:bg-gray-700 dark:text-white" />
        </div>

        {/* Bio & Location */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Bio & Location</h3>
          <textarea name="bio" value={user.bio} onChange={handleChange} placeholder="Bio" className="w-full p-3 rounded-md dark:bg-gray-700 dark:text-white" />
          <input name="location" value={user.location} onChange={handleChange} placeholder="Location" className="w-full p-3 rounded-md dark:bg-gray-700 dark:text-white" />
        </div>

        {/* Skills */}
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {user.skills?.map((skill, idx) => (
              <div key={idx} className="bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-white px-3 py-1 rounded-full flex items-center">
                <span>{skill}</span>
                <button type="button" onClick={() => setUser(prev => ({ ...prev, skills: prev.skills.filter((_, i) => i !== idx) }))} className="ml-2 text-red-500">×</button>
              </div>
            ))}
          </div>
          <input type="text" placeholder="Type a skill and press Enter" className="w-full p-3 rounded-md dark:bg-gray-700 dark:text-white" onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              const newSkill = e.target.value.trim();
              if (newSkill && !user.skills.includes(newSkill)) {
                setUser(prev => ({ ...prev, skills: [...prev.skills, newSkill] }));
              }
              e.target.value = '';
            }
          }} />
        </div>

        {/* Badge Selection */}
        <div className="space-y-4">
  <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Select Badge</h3>
  <div className="flex flex-wrap gap-4">
    {user.badges?.map((badgeUrl, idx) => (
      <img
        key={idx}
        src={badgeUrl}
        alt={`Badge ${idx}`}
        onClick={async () => {
          try {
            // ✅ Set the selected badge visually
            setUser(prev => ({ ...prev, currentBadge: badgeUrl }));

            // ✅ Call backend to update current badge
            const res = await fetch(`http://localhost:8080/api/badges/user/${userId}/current`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(badgeUrl)
            });

            if (res.ok) {
              setStatus('✅ Current badge updated!');
            } else {
              setStatus('❌ Failed to update badge.');
            }
          } catch (err) {
            console.error("Badge update failed:", err);
            setStatus('❌ Error updating badge.');
          }
        }}
        className={`w-16 h-16 p-1 rounded-full cursor-pointer border-4 ${
          user.currentBadge === badgeUrl ? 'border-indigo-600' : 'border-transparent'
        }`}
      />
    ))}
  </div>
</div>

        {/* Submit */}
        <div>
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md w-full font-medium">
            Save Changes
          </button>
          {status && <p className="text-center text-sm mt-3 text-gray-600 dark:text-gray-300">{status}</p>}
        </div>
      </form>
    </div>
  );
};

export default EditUserForm;
