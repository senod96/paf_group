import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import HomePostList from './posts/HomePostList';
import AddPost from './posts/AddPost';

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [profile, setProfile] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const currentUserId = localStorage.getItem("user");
  const [visibleCount, setVisibleCount] = useState(5);
  useEffect(() => {
    if (currentUserId) {
      fetch(`http://localhost:8080/api/users/${currentUserId}`)
        .then(res => res.json())
        .then(data => {
          setProfile(data);
          fetchSuggestions(data.following || []);
        });
    }
  }, [currentUserId]);

  const fetchSuggestions = (following) => {
    fetch(`http://localhost:8080/api/users`)
      .then(res => res.json())
      .then(users => {
        const filtered = users.filter(u => u._id !== currentUserId && !following.includes(u._id));
        setSuggestions(filtered);
      });
  };

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
        {/* Search Bar */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex gap-4 items-center">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 rounded px-4 py-2 text-sm"
          />
        </div>

        {/* Search Results */}
        {results.length > 0 && (
          <div className="bg-white dark:bg-gray-800 mt-4 rounded-lg shadow p-4 space-y-2">
            {results.map(user => (
              <div
                key={user._id}
                onClick={() => handleProfileClick(user._id)}
                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded text-sm text-blue-600"
              >
                {user.name} ({user.email})
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-6 py-0 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Profile */}
        <div className="space-y-4 mt-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
            <img 
              src={profile?.profilePicture || 'https://lh3.googleusercontent.com/a/ACg8ocI7fc25SXLBYTr4h8993MgnDK08x4HpjqROXkAcN6c3k8DaOR3A=s96-c'}
              alt="Profile" 
              className="w-24 h-24 mx-auto rounded-full mb-4" 
            />
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{profile?.name}</h2>
            <p className="text-gray-500 dark:text-gray-300">{profile?.headline}</p>
            <p className="text-gray-500 dark:text-gray-300">{profile?.bio}</p>
            <p className="text-gray-500 dark:text-gray-300 mt-1">📍 {profile?.location}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="font-semibold mb-4 text-gray-800 dark:text-gray-100">Navigation</h3>
            <ul className="space-y-2 text-blue-600 dark:text-blue-400">
              {[
                ['Learning Plans', '/learning-plans'],
                ['View Jobs', '/applyjob'],
                ['Progress Evaluation', '/analytics'],
                ['Collaboration', '/collob'],
                ['Notifications', '/notifications'],
                ['Upcoming Events', '/upcoming'],
                ['Available Learning Plans', '/availablelearning'],
                ['Skillora Learning Courses', '/CourseList'],
              ].map(([label, route], i) => (
                <li key={i}>
                  <button onClick={() => navigate(route)} className="text-sm hover:underline">
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Center Posts */}
        <div className="lg:col-span-2 space-y-6">
          <AddPost />
          <HomePostList />
        </div>

        {/* Right Add to Feed */}
        <div className="space-y-4 mt-48">
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
    <h3 className="font-semibold mb-4 text-gray-800 dark:text-gray-100">Add to Your Feed</h3>

    {suggestions.slice(0, visibleCount).map(user => ( 
      <div key={user._id} className="flex items-center justify-between mb-4">
        <div>
          <p className="font-medium text-gray-800 dark:text-gray-100">{user.name}</p>
          <p className="text-gray-500 dark:text-gray-300 text-sm">{user.headline || 'New User'}</p>
        </div>
        <button 
          onClick={() => handleProfileClick(user._id)}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
        >
          + Follow
        </button>
      </div>
    ))}

    {suggestions.length === 0 && (
      <p className="text-sm text-gray-500 dark:text-gray-400">No new recommendations</p>
    )}

    {visibleCount < suggestions.length && (
      <button 
        onClick={() => setVisibleCount(prev => prev + 5)}
        className="text-sm text-blue-600 hover:underline mt-4 block"
      >
        Load More →
      </button>
    )}
  </div>
</div>
      </div>
    </div>
  );
};

export default Dashboard;
