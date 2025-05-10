import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { FaComments } from 'react-icons/fa'; // Message icon
import Navbar from './Navbar';
ChartJS.register(ArcElement, Tooltip, Legend);

const ProjectDashboard = () => {
  const { id } = useParams();
  const userId = localStorage.getItem('user');
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [collabMembers, setCollabMembers] = useState([]);
  const [assignInfo, setAssignInfo] = useState({ taskId: '', userId: '', deadline: '' });
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const chatRef = useRef(null);
  const [userMap, setUserMap] = useState({});

  useEffect(() => {
    fetchProject();
    fetchTasks();
    fetchMessages();
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, chatOpen]);

  const fetchProject = async () => {
    const res = await axios.get(`http://localhost:8080/api/projects/${id}`);
    setProject(res.data);
  
    const collab = await axios.get(`http://localhost:8080/api/collaborations/${res.data.collaborationId}`);
    setCollabMembers(collab.data.members);
  
    // Fetch member user details
    const users = await Promise.all(
      collab.data.members.map(uid =>
        axios.get(`http://localhost:8080/api/users/${uid}`).then(res => res.data)
      )
    );
  
    // Create a map from ID to name
    const map = {};
    users.forEach(user => {
      map[user.id] = user.name;
    });
  
    setUserMap(map);
  };
  

  const fetchTasks = async () => {
    const res = await axios.get(`http://localhost:8080/api/tasks/project/${id}`);
    setTasks(res.data);
  };

  const fetchMessages = async () => {
    const res = await axios.get(`http://localhost:8080/api/messages/project/${id}`);
    setMessages(res.data);
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    await axios.post(`http://localhost:8080/api/messages`, {
      projectId: id,
      senderId: userId,
      content: newMessage,
    });
    setNewMessage('');
    fetchMessages();
  };

  const scrollToBottom = () => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  };

  const taskCounts = {
    free: tasks.filter(t => t.status === 'free').length,
    assigned: tasks.filter(t => t.status === 'assigned').length,
    completed: tasks.filter(t => t.status === 'completed').length
  };

  const pieData = {
    labels: ['Completed', 'Assigned', 'Free'],
    datasets: [
      {
        data: [taskCounts.completed, taskCounts.assigned, taskCounts.free],
        backgroundColor: ['#10b981', '#3b82f6', '#facc15'],
      },
    ],
  };

  const createOrUpdateTask = async () => {
    if (editingTaskId) {
      await axios.put(`http://localhost:8080/api/tasks/${editingTaskId}`, { title: newTaskTitle });
      setEditingTaskId(null);
    } else {
      await axios.post('http://localhost:8080/api/tasks', {
        projectId: id,
        title: newTaskTitle,
        createdBy: userId,
      });
    }
    setNewTaskTitle('');
    fetchTasks();
  };

  const assignTask = async () => {
    await axios.put(`http://localhost:8080/api/tasks/${assignInfo.taskId}/assign`, null, {
      params: {
        userId: assignInfo.userId,
        deadline: assignInfo.deadline,
      },
    });
    setAssignInfo({ taskId: '', userId: '', deadline: '' });
    fetchTasks();
  };

  const updateStatus = async (taskId, status) => {
    await axios.put(`http://localhost:8080/api/tasks/${taskId}/status`, null, {
      params: { status, userId },
    });
    fetchTasks();
  };

  const getTaskColor = (status) => {
    if (status === 'free') return 'border-yellow-400';
    if (status === 'assigned') return 'border-blue-400';
    if (status === 'completed') return 'border-green-400';
    return 'border-gray-300';
  };
  return (
    <div className="dark:bg-gray-900 dark:text-gray-100 p-6 bg-[#f9fafb] min-h-screen font-sans text-gray-800 relative">
     <Navbar/><br/>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{project?.title}</h1>
          <p className="text-gray-500 dark:text-gray-300">{project?.description}</p>
        </div>
        <div className="w-60"> {/* Pie chart */}
          <Pie data={pieData} />
        </div>
      </div>
  
      {/* Add/Edit Task */}
      {project?.createdBy === userId && (
        <div className="mb-6 flex gap-4">
          <input
            type="text"
            placeholder="Task Title"
            value={newTaskTitle}
            onChange={e => setNewTaskTitle(e.target.value)}
            className="p-2 border rounded w-1/2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <button
            onClick={createOrUpdateTask}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            {editingTaskId ? 'Update Task' : 'Add Task'}
          </button>
        </div>
      )}
  
      {/* Task Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {tasks.map(task => (
          <div key={task.id} className={`bg-white dark:bg-gray-800 p-4 rounded-lg border-2 dark:border-gray-700 ${getTaskColor(task.status)} hover:shadow-sm`}>
            <h3 className="text-lg font-semibold">{task.title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-300">Status: {task.status}</p>
            {task.assignedTo && (
              <p className="text-sm text-gray-400">Assigned To: {userMap[task.assignedTo] || task.assignedTo}</p>
            )}
            {task.deadline && (
              <p className="text-sm text-red-500">
                Deadline: {new Date(task.deadline).toLocaleString()}
              </p>
            )}
  
            <div className="mt-3 space-x-2">
              {task.status === 'free' && (
                <button
                  onClick={() => setAssignInfo({ ...assignInfo, taskId: task.id })}
                  className="bg-yellow-400 text-white px-3 py-1 rounded"
                >
                  Assign
                </button>
              )}
              {task.status === 'assigned' && task.assignedTo === userId && (
                <>
                  <button
                    onClick={() => updateStatus(task.id, 'free')}
                    className="bg-gray-400 text-white px-3 py-1 rounded"
                  >
                    Unassign
                  </button>
                  <button
                    onClick={() => updateStatus(task.id, 'completed')}
                    className="bg-green-500 text-white px-3 py-1 rounded"
                  >
                    Done
                  </button>
                </>
              )}
              {project?.createdBy === userId && (
                <button
                  onClick={() => {
                    setNewTaskTitle(task.title);
                    setEditingTaskId(task.id);
                  }}
                  className="bg-blue-400 text-white px-3 py-1 rounded"
                >
                  Edit
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
  
      {/* Floating Chat Icon */}
      <button
        onClick={() => setChatOpen(!chatOpen)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 z-50"
      >
        <FaComments size={24} />
      </button>
  
      {/* Chat Popup */}
      {chatOpen && (
        <div className="fixed bottom-20 right-6 bg-white dark:bg-gray-800 w-80 h-96 rounded-xl shadow-lg flex flex-col z-50">
          <div ref={chatRef} className="flex-1 p-4 overflow-y-auto">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`mb-2 flex ${msg.senderId === userId ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`p-2 rounded-lg ${msg.senderId === userId ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-white'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
          <div className="p-2 border-t dark:border-gray-700 flex gap-2">
            <input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              className="flex-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <button
              onClick={sendMessage}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Send
            </button>
          </div>
        </div>
      )}
  
      {/* Assign Modal */}
      {assignInfo.taskId && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-sm">
            <h2 className="text-xl font-bold mb-4">Assign Task</h2>
            <label className="block mb-2">Select Member</label>
            <select
              className="w-full p-2 border rounded mb-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={assignInfo.userId}
              onChange={e => setAssignInfo({ ...assignInfo, userId: e.target.value })}
            >
              <option value="">-- Select --</option>
              {collabMembers.map(m => (
                <option key={m} value={m}>
                  {userMap[m] || m}
                </option>
              ))}
            </select>
  
            <label className="block mb-2">Deadline</label>
            <input
              type="datetime-local"
              className="w-full p-2 border rounded mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={assignInfo.deadline}
              onChange={e => setAssignInfo({ ...assignInfo, deadline: e.target.value })}
            />
  
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setAssignInfo({ taskId: '', userId: '', deadline: '' })}
                className="text-gray-600 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={assignTask}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  };

export default ProjectDashboard;
