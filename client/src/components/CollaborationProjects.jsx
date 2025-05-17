import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

const CollaborationProjects = () => {
  const { id } = useParams(); // collab ID
  const navigate = useNavigate();
  const userId = localStorage.getItem('user');

  const [projects, setProjects] = useState([]);
  const [collab, setCollab] = useState(null);
  const [newProject, setNewProject] = useState({ title: '', description: '' });
  const [showModal, setShowModal] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCollab();
    fetchProjects();
  }, [id]);

  const fetchCollab = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/collaborations/${id}`);
      setCollab(res.data);
    } catch (error) {
      console.error("Error fetching collaboration:", error);
    }
  };

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:8080/api/projects/collaboration/${id}`);
      setProjects(res.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const payload = {
        ...newProject,
        collaborationId: id,
        createdBy: userId
      };

      if (editingProjectId) {
        await axios.put(`http://localhost:8080/api/projects/${editingProjectId}`, payload);
      } else {
        await axios.post('http://localhost:8080/api/projects', payload);
      }

      setShowModal(false);
      setNewProject({ title: '', description: '' });
      setEditingProjectId(null);
      fetchProjects();
    } catch (error) {
      console.error("Error saving project:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                Projects in <span className="text-blue-600 dark:text-blue-400">"{collab?.name}"</span>
              </h1>
              <p className="text-gray-600 dark:text-gray-300 max-w-3xl">
                {collab?.description || "Collaborate on projects with your team members"}
              </p>
            </div>
            <button
              onClick={() => {
                setNewProject({ title: '', description: '' });
                setEditingProjectId(null);
                setShowModal(true);
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              New Project
            </button>
          </div>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
              <div
  key={project.id}
  className="bg-blue-50 dark:bg-gray-800 border border-blue-300 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300"
>
  <div className="p-6">
    <div className="flex justify-between items-start mb-4">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
        {project.title}
      </h2>
      {project.createdBy === userId && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setNewProject({ title: project.title, description: project.description });
            setEditingProjectId(project.id);
            setShowModal(true);
          }}
          className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          aria-label="Edit project"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
        </button>
      )}
    </div>
    <p className="text-gray-600 dark:text-gray-300 text-sm mb-6 line-clamp-3">
      {project.description || "No description provided"}
    </p>
    <div className="flex justify-between items-center">
      <button
        onClick={() => navigate(`/project/${project.id}`)}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-300"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        Explore Project
      </button>
      <span className="text-xs text-gray-500 dark:text-gray-400">
        Created by {project.createdBy === userId ? "you" : "member"}
      </span>
    </div>
  </div>
</div>

            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mt-4">No projects yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2 mb-6">Get started by creating your first project</p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create Project
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Project Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  {editingProjectId ? 'Edit Project' : 'Create New Project'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingProjectId(null);
                    setNewProject({ title: '', description: '' });
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
                    Project Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter project title"
                    value={newProject.title}
                    onChange={e => setNewProject({ ...newProject, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    placeholder="Enter project description"
                    value={newProject.description}
                    onChange={e => setNewProject({ ...newProject, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingProjectId(null);
                    setNewProject({ title: '', description: '' });
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!newProject.title.trim()}
                  className={`px-6 py-2 rounded-lg text-white ${newProject.title.trim() ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-400 cursor-not-allowed'} transition-colors`}
                >
                  {editingProjectId ? 'Update Project' : 'Create Project'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollaborationProjects;