import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import HomePostList from './posts/HomePostList';
import SearchPost from './posts/SearchPost';

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const currentUserId = localStorage.getItem("user");

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm.trim()) {
        handleSearch();
      } else {
        setResults([]);
      }
    }, 300);
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

  const handleProfileClick = (id) => {
    localStorage.setItem('viewingUser', id);
    navigate(`/profile/${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 font-inter">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-4">
        {/* Search */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex gap-4 items-center">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 rounded px-4 py-2 text-sm"
          />
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="bg-white dark:bg-gray-800 mt-4 rounded-lg shadow p-4 space-y-2">
            {results.map((user) => (
              <div
                key={user.id}
                onClick={() => handleProfileClick(user.id)}
                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded text-sm text-blue-600"
              >
                {user.name} ({user.email})
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="max-w-7xl mx-auto px-6 py-0 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Profile Card */}
        <div className="space-y-4 mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
            <img 
              src="https://via.placeholder.com/100" 
              alt="Profile" 
              className="w-24 h-24 mx-auto rounded-full mb-4" 
            />
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Lahiru Bandara</h2>
            <p className="text-gray-500 dark:text-gray-300">Undergraduate at SLIIT BSc (Hons) in IT</p>
            <p className="text-gray-500 dark:text-gray-300 mt-1">📍 Kandy, Central Province</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="font-semibold mb-4 text-gray-800 dark:text-gray-100">Navigation</h3>
            <ul className="space-y-2 text-blue-600 dark:text-blue-400">
              <li><button onClick={() => navigate('/addpost')} className="hover:underline">Upload Posts</button></li>
              <li><button onClick={() => navigate('/learning-plans')} className="hover:underline">Learning Plans</button></li>
              <li><button onClick={() => navigate('/applyjob')} className="hover:underline">View Jobs</button></li>
              <li><button onClick={() => navigate('/analytics')} className="hover:underline">Progress Evaluation</button></li>
              <li><button onClick={() => navigate('/collob')} className="hover:underline">Collaboration</button></li>
              <li><button onClick={() => navigate('/notifications')} className="hover:underline">Notifications</button></li>
              <li><button onClick={() => navigate('/upcoming')} className="hover:underline">Upcoming Events</button></li>
              <li><button onClick={() => navigate('/availablelearning')} className="hover:underline">Available Learning Plans</button></li>
            </ul>
          </div>
        </div>

        {/* Middle Content */}
        <div className="lg:col-span-2 space-y-6">
          <HomePostList />
        </div>

        {/* Right Add to Feed */}
        <div className="space-y-4 mt-36">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="font-semibold mb-4 text-gray-800 dark:text-gray-100">Add to Your Feed</h3>
            {['Sysco LABS', 'WSO2', 'NetworkChuck'].map((company, i) => (
              <div key={i} className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-100">{company}</p>
                  <p className="text-gray-500 dark:text-gray-300 text-sm">Company • Tech</p>
                </div>
                <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">+ Follow</button>
              </div>
            ))}
            <button 
              onClick={() => navigate('/recommendations')}
              className="text-sm text-blue-600 hover:underline mt-4 block"
            >
              View all recommendations →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
