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

        {/* Education */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Education</h3>
          {user.education?.map((edu, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <input type="text" value={edu.institution} onChange={(e) => {
                const updated = [...user.education];
                updated[idx].institution = e.target.value;
                setUser(prev => ({ ...prev, education: updated }));
              }} placeholder="Institution" className="flex-1 p-3 rounded-md dark:bg-gray-700 dark:text-white" />
              <input type="text" value={edu.degree} onChange={(e) => {
                const updated = [...user.education];
                updated[idx].degree = e.target.value;
                setUser(prev => ({ ...prev, education: updated }));
              }} placeholder="Degree" className="flex-1 p-3 rounded-md dark:bg-gray-700 dark:text-white" />
              <button type="button" onClick={() => setUser(prev => ({ ...prev, education: prev.education.filter((_, i) => i !== idx) }))} className="text-red-500">×</button>
            </div>
          ))}
          <button type="button" className="text-indigo-600" onClick={() => setUser(prev => ({ ...prev, education: [...prev.education, { institution: '', degree: '' }] }))}>Add Education</button>
        </div>

        {/* Experience */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Experience</h3>
          {user.experience?.map((exp, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <input type="text" value={exp.company} onChange={(e) => {
                const updated = [...user.experience];
                updated[idx].company = e.target.value;
                setUser(prev => ({ ...prev, experience: updated }));
              }} placeholder="Company" className="flex-1 p-3 rounded-md dark:bg-gray-700 dark:text-white" />
              <input type="text" value={exp.position} onChange={(e) => {
                const updated = [...user.experience];
                updated[idx].position = e.target.value;
                setUser(prev => ({ ...prev, experience: updated }));
              }} placeholder="Position" className="flex-1 p-3 rounded-md dark:bg-gray-700 dark:text-white" />
              <button type="button" onClick={() => setUser(prev => ({ ...prev, experience: prev.experience.filter((_, i) => i !== idx) }))} className="text-red-500">×</button>
            </div>
          ))}
          <button type="button" className="text-indigo-600" onClick={() => setUser(prev => ({ ...prev, experience: [...prev.experience, { company: '', position: '' }] }))}>Add Experience</button>
        </div>

        {/* Links */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200">Social Links</h3>
          {['github', 'linkedin', 'website'].map(link => (
            <input key={link} name={`links.${link}`} value={user.links?.[link] || ''} onChange={handleChange} placeholder={link.charAt(0).toUpperCase() + link.slice(1)} className="w-full p-3 rounded-md dark:bg-gray-700 dark:text-white" />
          ))}
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
