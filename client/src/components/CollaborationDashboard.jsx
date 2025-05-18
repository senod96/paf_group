import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

const CollaborationDashboard = () => {
  const [collabs, setCollabs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newCollab, setNewCollab] = useState({ name: '', description: '' });
  const [userSearch, setUserSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const userId = localStorage.getItem('user');

  useEffect(() => {
    fetchCollabs();
  }, []);

  const fetchCollabs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:8080/api/collaborations/user/${userId}`);
      setCollabs(res.data);
    } catch (error) {
      console.error('Error fetching collaborations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (isCreating) return;
    setIsCreating(true);

    try {
      const membersArray = selectedMembers.map(m => m.id);
      const payload = {
        ...newCollab,
        createdBy: userId,
        members: [...new Set([userId, ...membersArray])]
      };

      await axios.post('http://localhost:8080/api/collaborations', payload);

      // Reset and refresh UI
      setShowModal(false);
      setNewCollab({ name: '', description: '' });
      setUserSearch('');
      setSearchResults([]);
      setSelectedMembers([]);
      await fetchCollabs();
    } catch (err) {
      console.error('Error creating collaboration:', err);
    } finally {
      setIsCreating(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (userSearch.length > 1) {
        axios
          .get(`http://localhost:8080/api/users/search?name=${userSearch}`)
          .then(res => setSearchResults(res.data));
      } else {
        setSearchResults([]);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [userSearch]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar />
  
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              Your Collaborations
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Manage and join collaborative workspaces with your team
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            New Collaboration
          </button>
        </div>

        {/* Collaborations Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : collabs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collabs.map((collab) => (
              <div
  key={collab.id}
  className="bg-blue-50 dark:bg-gray-800 border border-blue-300 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300"
>
  <div className="p-6">
    <div className="flex justify-between items-start mb-4">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
        {collab.name}
      </h2>
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
        {collab.members.length} members
      </span>
    </div>
    <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 line-clamp-3">
      {collab.description || "No description provided"}
    </p>
    <button
      onClick={() => navigate(`/collaboration/${collab.id}`)}
      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-300 w-full justify-center"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
      Open Collaboration
    </button>
  </div>
</div>

            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mt-4">No collaborations yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2 mb-6">Get started by creating your first collaboration space</p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create Collaboration
            </button>
          </div>
        )}
      </div>

      {/* Create Collaboration Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Create New Collaboration
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setNewCollab({ name: '', description: '' });
                    setUserSearch('');
                    setSearchResults([]);
                    setSelectedMembers([]);
                  }}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Collaboration Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter collaboration name"
                    value={newCollab.name}
                    onChange={e => setNewCollab({ ...newCollab, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    placeholder="Enter a brief description"
                    value={newCollab.description}
                    onChange={e => setNewCollab({ ...newCollab, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Add Members
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search users by name"
                      value={userSearch}
                      onChange={e => setUserSearch(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                    {userSearch.length > 0 && (
                      <button
                        onClick={() => setUserSearch('')}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <div className="mt-2 max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                      {searchResults.map(user => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                        >
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center mr-3">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="text-gray-700 dark:text-gray-300">{user.name}</span>
                          </div>
                          {!selectedMembers.some(m => m.id === user.id) ? (
                            <button
                              onClick={() => setSelectedMembers([...selectedMembers, user])}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
                            >
                              Add
                            </button>
                          ) : (
                            <span className="text-green-600 dark:text-green-400 text-sm font-medium">Added</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Selected Members */}
                  {selectedMembers.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Selected Members ({selectedMembers.length})
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedMembers.map(user => (
                          <div
                            key={user.id}
                            className="flex items-center bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm"
                          >
                            {user.name}
                            <button
                              onClick={() => setSelectedMembers(selectedMembers.filter(m => m.id !== user.id))}
                              className="ml-2 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setNewCollab({ name: '', description: '' });
                    setUserSearch('');
                    setSearchResults([]);
                    setSelectedMembers([]);
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!newCollab.name.trim() || isCreating}
                  className={`px-6 py-2 rounded-lg text-white ${(!newCollab.name.trim() || isCreating) ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} transition-colors flex items-center justify-center min-w-24`}
                >
                  {isCreating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </>
                  ) : (
                    'Create'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div> )
  } 


export default CollaborationDashboard;