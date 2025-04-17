import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserProfile from './components/UserProfile';
import EditUserForm from './components/EditUserForm';
import Dashboard from './components/Dashboard';
import ViewUserProfile from './components/Vieewuserprofile';
import Register from './components/Register';
import Login from './components/Login';

function App() {
  return (
    <Router>
      <Routes>
      <Route path="/profile" element={<UserProfile />} />
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/edit" element={<EditUserForm />} />
        <Route path="/profile/:id" element={<ViewUserProfile />} />
      </Routes>
    </Router>
  );
}

export default App;
