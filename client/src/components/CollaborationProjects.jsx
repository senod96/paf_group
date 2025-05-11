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

  useEffect(() => {
    fetchCollab();
    fetchProjects();
  }, [id]);

  const fetchCollab = async () => {
    const res = await axios.get(`http://localhost:8080/api/collaborations/${id}`);
    setCollab(res.data);
  };

  const fetchProjects = async () => {
    const res = await axios.get(`http://localhost:8080/api/projects/collaboration/${id}`);
    setProjects(res.data);
  };

  const handleCreate = async () => {
    const payload = {
      ...newProject,
      collaborationId: id,
      createdBy: userId
    };

    if (editingProjectId) {
      await axios.put(`http://localhost:8080/api/projects/${editingProjectId}`, payload);
      setEditingProjectId(null);
    } else {
      await axios.post('http://localhost:8080/api/projects', payload);
    }

    setShowModal(false);
    setNewProject({ title: '', description: '' });
    fetchProjects();
  };

  return (
    <div className="dark:bg-gray-900 dark:text-gray-100 min-h-screen bg-[#f9fafb] font-sans not-italic text-gray-800">
      <Navbar />

      <div className="dark:bg-gray-900 dark:text-gray-100 max-w-5xl mx-auto px-6 py-8">
        <div className="dark:bg-gray-900 dark:text-gray-100 bg-white p-6 rounded-xl shadow-sm border mb-6">
          <div className="dark:bg-gray-900 dark:text-gray-100 flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-blue-700 mb-1 not-italic">
                📁 Projects in "{collab?.name}"
              </h1>
              <p className="text-gray-500 not-italic">{collab?.description}</p>
            </div>
            <button
              onClick={() => {
                setNewProject({ title: '', description: '' });
                setEditingProjectId(null);
                setShowModal(true);
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-md shadow hover:bg-green-700 transition"
            >
              + New Project
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
  {projects.map(project => (
    <div
      key={project.id}
      className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow transition"
    >
      <h2 className="text-lg font-semibold not-italic text-gray-800 dark:text-gray-100">
        {project.title}
      </h2>
      <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 not-italic">
        {project.description}
      </p>
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigate(`/project/${project.id}`)}
          className="bg-indigo-500 text-white px-3 py-1 rounded hover:bg-indigo-600 transition"
        >
          Explore Project
        </button>

        {project.createdBy === userId && (
          <button
            onClick={() => {
              setNewProject({ title: project.title, description: project.description });
              setEditingProjectId(project.id);
              setShowModal(true);
            }}
            className="text-blue-600 dark:text-blue-400 text-sm hover:underline ml-2"
          >
            Edit
          </button>
        )}
      </div>
    </div>
  ))}
</div>
</div>
        {/* Modal */}
        {showModal && (
          <div className="dark:bg-gray-900 dark:text-gray-100 fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="dark:bg-gray-900 dark:text-gray-100 bg-white p-6 rounded-xl shadow-lg w-full max-w-md font-sans not-italic">
              <h2 className="text-xl font-bold mb-4 not-italic">
                {editingProjectId ? 'Edit Project' : 'Create Project'}
              </h2>
              <input
                type="text"
                placeholder="Title"
                value={newProject.title}
                onChange={e =>
                  setNewProject({ ...newProject, title: e.target.value })
                }
                className="w-full mb-3 p-2 border rounded"
              />
              <textarea
                placeholder="Description"
                value={newProject.description}
                onChange={e =>
                  setNewProject({ ...newProject, description: e.target.value })
                }
                className="w-full mb-3 p-2 border rounded"
              />
              <div className="dark:bg-gray-900 dark:text-gray-100 flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingProjectId(null);
                    setNewProject({ title: '', description: '' });
                  }}
                  className="text-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  className="bg-green-600 text-white px-4 py-2 rounded"
                >
                  {editingProjectId ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollaborationProjects;
