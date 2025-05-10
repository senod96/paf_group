import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserProfile from './components/UserProfile';
import EditUserForm from './components/EditUserForm';
import Dashboard from './components/Dashboard';
import ViewUserProfile from './components/Vieewuserprofile';
import Register from './components/Register';
import Login from './components/Login';
import AddPost from './components/posts/AddPost';
import ViewApplicants from './components/posts/ViewApplicants'; 
import JobApplicationPage from './pages/JobApplicationPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/edit" element={<EditUserForm />} />
        <Route path="/jobs" element={<JobApplicationPage />} />
        <Route path="/applicants/:jobId" element={<ViewApplicants />} />
        <Route path="/profile/:id" element={<ViewUserProfile />} />
        <Route path="/applicants/:jobId" element={<ViewApplicants />} /> {/* ✅ New route */}
      </Routes>
    </Router>
  );
}

export default App;
