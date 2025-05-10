import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import AddPost from './posts/AddPost';
import HomePostList from './posts/HomePostList'

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const userId = localStorage.getItem("user");
  const currentUserId = userId;

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm.trim() !== '') {
        handleSearch();
      } else {
        setResults([]); // Clear if input is empty
      }
    }, 300); // debounce delay
  
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
      localStorage.setItem('viewingUser', id); // 🔥 store clicked user's ID under a separate key
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

      {/* Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 max-w-7xl mx-auto">
        {/* Left Navigation */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h2 className="font-semibold mb-4">Navigation</h2>
            <ul className="space-y-2 text-blue-600 dark:text-blue-400">
              <li><button onClick={() => navigate('/addpost')} className="text-sm hover:underline">Upload posts</button></li>
              <li><button onClick={() => navigate('/learning-plans')} className="text-sm hover:underline">Learning Plans</button></li>
              <li><button onClick={() => navigate('/jobapplications')} className="text-sm hover:underline">View Jobs</button></li>
              <li><button onClick={() => navigate('/analytics')} className="text-sm hover:underline">Progress Evaluation</button></li>
              <li><button onClick={() => navigate('/collob')} className="text-sm hover:underline">Collaboration</button></li>
              <li><button onClick={() => navigate('/notifications')} className="text-sm hover:underline">Notifications</button></li>
              <li><button onClick={() => navigate('/upcoming')} className="text-sm hover:underline">Upcoming Events</button></li>
            </ul>


          </div>
        </div>

        {/* Posts Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center text-gray-500 dark:text-gray-400 border border-dashed border-gray-300 dark:border-gray-600">
            <HomePostList/>
          </div>

       
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
