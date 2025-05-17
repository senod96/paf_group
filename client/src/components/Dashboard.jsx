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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-800 dark:text-gray-100 font-inter">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search Bar with Floating Results */}
        <div className="relative mb-8">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md flex gap-4 items-center border border-gray-200 dark:border-gray-700">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search for people..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>
          
          {/* Floating Search Results */}
          {results.length > 0 && (
            <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              {results.map(user => (
                <div
                  key={user._id}
                  onClick={() => handleProfileClick(user.id)}
                  className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer flex items-center"
                >
                  <div className="flex-shrink-0 mr-3">
                    <img 
                      src={user.profilePicture || 'https://via.placeholder.com/40'} 
                      alt={user.name} 
                      className="w-8 h-8 rounded-full object-cover" 
                    />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-100">{user.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{user.headline || 'No headline'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Profile Column */}
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 transition-all hover:shadow-lg">
              <div className="relative">
                <div className="h-20 bg-gradient-to-r from-blue-500 to-purple-600"></div>
                <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                  <img 
                    src={profile?.profilePicture || 'https://via.placeholder.com/100'} 
                    alt="Profile" 
                    className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 object-cover" 
                  />
                </div>
              </div>
              <div className="pt-16 pb-6 px-6 text-center">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{profile?.name}</h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{profile?.headline}</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">{profile?.bio}</p>
                <div className="flex items-center justify-center mt-3 text-gray-500 dark:text-gray-400">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-xs">{profile?.location || 'Unknown location'}</span>
                </div>
              </div>
            </div>

            {/* Navigation Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                  Quick Navigation
                </h3>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {[
                  ['Learning Plans', '/learning-plans', 'book-open'],
                  ['View Jobs', '/applyjob', 'briefcase'],
                  ['Progress Evaluation', '/analytics', 'chart-bar'],
                  ['Collaboration', '/collob', 'users'],
                  ['Notifications', '/notifications', 'bell'],
                  ['Upcoming Events', '/upcoming', 'calendar'],
                  ['Available Learning Plans', '/availablelearning', 'academic-cap'],
                  ['Skillora Learning Courses', '/CourseList', 'video-camera'],
                ].map(([label, route, icon], i) => (
                  <button 
                    key={i}
                    onClick={() => navigate(route)}
                    className="w-full px-6 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center"
                  >
                    <svg className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={`M${icon === 'book-open' ? '12 6.253v13m0-13c-1.243 0-2.598.48-3.536 1.255-1.03.84-1.582 1.991-1.582 3.245s.552 2.405 1.582 3.255c.938.775 2.293 1.255 3.536 1.255m0-13c1.243 0 2.598.48 3.536 1.255 1.03.84 1.582 1.991 1.582 3.245s-.552 2.405-1.582 3.255c-.938.775-2.293 1.255-3.536 1.255' : 
                        icon === 'briefcase' ? '21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' :
                        icon === 'chart-bar' ? '9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' :
                        icon === 'users' ? '12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' :
                        icon === 'bell' ? '15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' :
                        icon === 'calendar' ? '8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' :
                        icon === 'academic-cap' ? '12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222' :
                        'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z'}`} />
                    </svg>
                    <span className="text-gray-700 dark:text-gray-300">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Center Posts Column */}
          <div className="lg:col-span-2 space-y-6">
            <AddPost />
            <HomePostList />
          </div>

          {/* Right Suggestions Column */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  People You May Know
                </h3>
              </div>
              
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {suggestions.slice(0, visibleCount).map(user => (
                  <div key={user._id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-center">
                      <img 
                        src={user.profilePicture || 'https://via.placeholder.com/40'} 
                        alt={user.name} 
                        className="w-10 h-10 rounded-full object-cover mr-3" 
                      />
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-100">{user.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user.headline || 'New to Skillora'}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleProfileClick(user.id)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-medium transition-colors flex items-center"
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Follow
                    </button>
                  </div>
                ))}

                {suggestions.length === 0 && (
                  <div className="px-6 py-4 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">No recommendations available</p>
                  </div>
                )}
              </div>

              {visibleCount < suggestions.length && (
                <button 
                  onClick={() => setVisibleCount(prev => prev + 5)}
                  className="w-full px-6 py-3 text-center text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors border-t border-gray-200 dark:border-gray-700 flex items-center justify-center"
                >
                  Show more
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;