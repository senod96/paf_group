import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import UserProfile from './components/UserProfile';
import EditUserForm from './components/EditUserForm';
import Dashboard from './components/Dashboard';
import Register from './components/Register';
import Login from './components/Login';
import CollaborationDashboard from './components/CollaborationDashboard';
import CollaborationProjects from './components/CollaborationProjects';
import ProjectDashboard from './components/ProjectDashboard'; 
import UserPublicProfile from './components/UserPublicProfile';
import AddPost from './components/posts/AddPost';
import ViewJobs from './components/posts/ViewJobs'

import ProgressAnalytics from './components/ProgressAnalytics';
import LearningPlanDetails from './components/LearningPlanDetails';
import CreateLearningPlan from './components/CreateLearningPlan';

import LandingPage from './components/Landing';
import FollowRequests from './components/FollowRequests';

import NotificationComponent from './components/notification';
import Settings from './components/settings';
import UpcomingTasks from './components/UpcomingEvents';

import SubscriptionPlans from './components/SubscriptionPlans';
import AdminDashboard from './components/AdminDashboard';
import CreateLearningPlanAdmin from './components/Admin/CreateLearningPlanAdmin';
import AvailableLearningPlans from './components/AvailableLearningPlans';

import AddQuiz from './components/Courses_Dima/AddQuiz';
import QuizWrapper from './components/Courses_Dima/test';
const currentUserId = localStorage.getItem('user');

function App() {
  return (
    <Router>
      <Routes>
      <Route path="/upcoming" element={<UpcomingTasks />} />
      <Route path="/addquiz" element={<QuizWrapper />} />
      <Route path="/jobapplications" element={<ViewJobs/>}/>
      <Route path="/" element={<LandingPage />} />
      <Route path="/notifications" element={<NotificationComponent userId={currentUserId} />} />
      <Route path="/addpost" element={<AddPost/>}/>
      <Route path="/login" element={<Login />} />
      <Route path="/subscription" element={<SubscriptionPlans />} />

      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/edit" element={<EditUserForm />} />
      <Route path="/profile/:id" element={<UserPublicProfile />} />
      <Route path="/collob" element={<CollaborationDashboard />} />
      <Route path="/learning-plans" element={<CreateLearningPlan />} />
      <Route path="/learning-plans/:id" element={<LearningPlanDetails />} />

      <Route path="/profile" element={<UserProfile />} />
      <Route path="/follow-requests" element={<FollowRequests />} />
      <Route path="/analytics" element={<ProgressAnalytics />} />
      <Route path="/collaboration/:id" element={<CollaborationProjects />} />
      <Route path="/project/:id" element={<ProjectDashboard />} /> 
      <Route path="/settings" element={<Settings />} />

      <Route path="/adminlearning" element={<CreateLearningPlanAdmin />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/availablelearning" element={<AvailableLearningPlans />} />


      </Routes>
    </Router>
  );
}

export default App;
