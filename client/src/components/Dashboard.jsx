import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HomePostList from './posts/HomePostList'
import AddPost from './posts/AddPost';
import PostList from './posts/PostList';
import AddJob from './posts/AddJob';
import ViewJobs from './posts/ViewJobs';
import ViewApplicants from './posts/ViewApplicants';



const Dashboard = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const user=localStorage.getItem("user");
  const currentUserId = user;

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm.trim() !== '') {
        handleSearch();
      } else {
        setResults([]);
      }
    }, 300); // debounce: wait 300ms after user stops typing

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const handleSearch = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/users/search?name=${searchTerm}`);
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  const handleProfileClick = (userId) => {
    if (userId === currentUserId) {
      navigate('/profile');
    } else {
      navigate(`/profile/${userId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-inter">
      {/* Top Navbar */}
      <div className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-700">Skillora</h1>
        <button
          onClick={() => navigate('/profile')}
          className="text-sm font-medium text-gray-700 hover:text-blue-600 transition"
        >
          My Profile
        </button>
      </div>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="bg-white p-4 rounded-lg shadow flex gap-4 items-center">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border border-gray-300 rounded px-4 py-2 text-sm"
          />
        </div>

        {results.length > 0 && (
          <div className="bg-white mt-4 rounded-lg shadow p-4 space-y-2">
            {results.map((user) => (
              <div
                key={user.id}
                onClick={() => handleProfileClick(user.id)}
                className="cursor-pointer hover:bg-gray-50 px-2 py-1 rounded text-sm text-blue-600"
              >
                {user.name} ({user.email})
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 max-w-7xl mx-auto">
        {/* Left Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="font-semibold text-gray-800 mb-4">Navigation</h2>
            <ul className="space-y-2">
              <li><button onClick={() => navigate('/learning-plans')} className="text-sm text-blue-600 hover:underline">Learning Plans</button></li>
              <li><button onClick={() => navigate('/progress-evaluation')} className="text-sm text-blue-600 hover:underline">Progress Evaluation</button></li>
              <li><button onClick={() => navigate('/notifications')} className="text-sm text-blue-600 hover:underline">Notifications</button></li>
              <PostList/>
            </ul>
          </div>
        </div>

        {/* Middle Feed Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-400 border border-dashed border-gray-300">
            <AddJob/>
            <ViewJobs/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
