import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const EditUserForm = () => {
  const userId = localStorage.getItem("user");
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('');
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
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({
      ...prev,
      [name]: value,
    }));
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
        navigate(`/profile/${userId}`);
      } else {
        setStatus('❌ Failed to update profile.');
      }
    } catch (err) {
      console.error('Update error:', err);
      setStatus('❌ Something went wrong.');
    }
  };

  if (!user)
    return <div className="dark:bg-gray-900 dark:text-gray-100 text-center py-10 text-gray-600">Loading form...</div>;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 flex items-center justify-center font-inter">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 p-10 rounded-lg shadow-lg w-full max-w-3xl space-y-8 animate-fadeIn"
      >
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800 dark:text-gray-100">
          Edit Profile
        </h2>

        {/* Section: Basic Info */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Basic Info</h3>
          <input
            name="name"
            value={user.name}
            onChange={handleChange}
            placeholder="Name"
            className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-3"
          />
          <input
            name="headline"
            value={user.headline}
            onChange={handleChange}
            placeholder="Headline"
            className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-3"
          />
        </div>

        {/* Section: Bio & Location */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Bio & Location</h3>
          <textarea
            name="bio"
            value={user.bio}
            onChange={handleChange}
            placeholder="Bio"
            className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-3"
          />
          <input
            name="location"
            value={user.location}
            onChange={handleChange}
            placeholder="Location"
            className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-3"
          />
        </div>

        {/* Section: Skills */}
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {user.skills?.map((skill, idx) => (
              <div
                key={idx}
                className="bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-white px-3 py-1 rounded-full flex items-center space-x-2"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() =>
                    setUser((prev) => ({
                      ...prev,
                      skills: prev.skills.filter((_, i) => i !== idx),
                    }))
                  }
                  className="text-blue-500 hover:text-red-600 dark:hover:text-red-400"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <input
            type="text"
            placeholder="Type a skill and press Enter"
            className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-3"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const newSkill = e.target.value.trim();
                if (newSkill && !user.skills.includes(newSkill)) {
                  setUser((prev) => ({
                    ...prev,
                    skills: [...prev.skills, newSkill],
                  }));
                }
                e.target.value = '';
              }
            }}
          />
        </div>

        {/* Section: Social Links */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Social Links</h3>
          <input
            name="links.github"
            value={user.links?.github || ''}
            onChange={(e) =>
              setUser((prev) => ({
                ...prev,
                links: { ...prev.links, github: e.target.value },
              }))
            }
            placeholder="GitHub"
            className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-3"
          />
          <input
            name="links.linkedin"
            value={user.links?.linkedin || ''}
            onChange={(e) =>
              setUser((prev) => ({
                ...prev,
                links: { ...prev.links, linkedin: e.target.value },
              }))
            }
            placeholder="LinkedIn"
            className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-3"
          />
          <input
            name="links.website"
            value={user.links?.website || ''}
            onChange={(e) =>
              setUser((prev) => ({
                ...prev,
                links: { ...prev.links, website: e.target.value },
              }))
            }
            placeholder="Website"
            className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-3"
          />
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md transition w-full font-medium"
          >
            Save Changes
          </button>
          {status && (
            <p className="text-center text-sm mt-3 text-gray-600 dark:text-gray-300">{status}</p>
          )}
        </div>
      </form>
    </div>
  );
};

export default EditUserForm;
