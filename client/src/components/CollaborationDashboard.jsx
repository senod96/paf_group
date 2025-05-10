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

  const navigate = useNavigate();
  const userId = localStorage.getItem('user');

  useEffect(() => {
    fetchCollabs();
  }, []);

  const fetchCollabs = async () => {
    const res = await axios.get(`http://localhost:8080/api/collaborations/user/${userId}`);
    setCollabs(res.data);
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
    <div className="dark:bg-gray-900 dark:text-gray-100 min-h-screen bg-[#f9fafb]">
      <Navbar />
  
      <div className="dark:bg-gray-900 dark:text-gray-100 max-w-5xl mx-auto px-6 py-8 font-sans text-gray-800">
        <div className="dark:bg-gray-900 dark:text-gray-100 flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-600">Your Collaborations</h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-md shadow-sm hover:bg-blue-600 transition"
          >
            + New Collaboration
          </button>
        </div>
  
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
  {collabs.map((collab, index) => (
    <div
      key={collab.id || index}
      className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-sm transition"
    >
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
        {collab.name}
      </h2>
      <p className="text-gray-600 dark:text-gray-300 mt-1">{collab.description}</p>
      <p className="text-sm mt-1 text-gray-500 dark:text-gray-400">
        Members: {collab.members.length}
      </p>
      <button
        onClick={() => navigate(`/collaboration/${collab.id}`)}
        className="mt-3 bg-indigo-500 text-white px-3 py-1 rounded hover:bg-indigo-600 transition"
      >
        Explore Collaboration
      </button>
    </div>
  ))}
</div>
  
        {/* Modal */}
        {showModal && (
          <div className="dark:bg-gray-900 dark:text-gray-100 fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="dark:bg-gray-900 dark:text-gray-100 bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Create Collaboration</h2>
  
              <input
                type="text"
                placeholder="Collaboration Name"
                value={newCollab.name}
                onChange={e => setNewCollab({ ...newCollab, name: e.target.value })}
                className="w-full mb-3 p-2 border rounded"
              />
  
              <textarea
                placeholder="Description"
                value={newCollab.description}
                onChange={e => setNewCollab({ ...newCollab, description: e.target.value })}
                className="w-full mb-3 p-2 border rounded"
              />
  
              {/* User Search */}
              <input
                type="text"
                placeholder="Search Users"
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                className="w-full mb-2 p-2 border rounded"
              />
  
              <div className="dark:bg-gray-900 dark:text-gray-100 max-h-32 overflow-y-auto mb-3 border rounded p-2 bg-gray-50">
                {searchResults.map(user => (
                  <div
                    key={user.id}
                    className="flex justify-between items-center p-1 mb-1 border rounded"
                  >
                    <p className="text-sm">{user.name}</p>
                    <button
                      onClick={() => {
                        if (!selectedMembers.find(m => m.id === user.id)) {
                          setSelectedMembers([...selectedMembers, user]);
                        }
                      }}
                      className="text-blue-600 text-sm hover:underline"
                    >
                      + Add
                    </button>
                  </div>
                ))}
              </div>
  
              {/* Selected Members */}
              <div className="dark:bg-gray-900 dark:text-gray-100 mb-3">
                <h3 className="text-sm text-gray-700 font-semibold mb-1">Selected Members:</h3>
                <ul className="text-sm text-gray-600 list-disc ml-4">
                  {selectedMembers.map(user => (
                    <li key={user.id}>{user.name}</li>
                  ))}
                </ul>
              </div>
  
              <div className="dark:bg-gray-900 dark:text-gray-100 flex justify-end gap-2">
                <button onClick={() => setShowModal(false)} className="text-gray-600">
                  Cancel
                </button>
                <button type="button" onClick={handleCreate} className="bg-blue-600 text-white px-4 py-2 rounded">
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollaborationDashboard;
