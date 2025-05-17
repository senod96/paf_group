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
import JobApplicationPage from './pages/JobApplicationPage';
import ViewApplicants from './components/posts/ViewApplicants';

import ProgressAnalytics from './components/LearninPlans/ProgressAnalytics';
import LearningPlanDetails from './components/LearninPlans/LearningPlanDetails';
import CreateLearningPlan from './components/LearninPlans/CreateLearningPlan';

import LandingPage from './components/Landing';
import FollowRequests from './components/FollowRequests';

import NotificationComponent from './components/notification';
import Settings from './components/settings';
import UpcomingTasks from './components/LearninPlans/UpcomingEvents';

import SubscriptionPlans from './components/SubscriptionPlans';
import AdminDashboard from './components/Admin/AdminDashboard';
import CreateLearningPlanAdmin from './components/Admin/CreateLearningPlanAdmin';
import AvailableLearningPlans from './components/LearninPlans/AvailableLearningPlans';

import AddCourse from './components/courses/AddCourse';
import CourseList from './components/courses/CourseList';
import CourseDetails from './components/courses/CourseDetails';
import MyCourses from './components/courses/MyCourses';
import EditCourse from './components/courses/EditCourse';

import HomePostList from './components/posts/HomePostList';
import AdminLearningPlanView from './components/Admin/AdminLearningPlanView';
import AddJob from './components/posts/AddJob';


const currentUserId = localStorage.getItem('user');

function App() {
  return (
    <Router>
      <Routes>
      <Route path="/upcoming" element={<UpcomingTasks />} />
      {/* <Route path="/addquiz" element={<QuizWrapper />} /> */}
      <Route path="/applyjob" element={<JobApplicationPage/>}/>
      <Route path="/jobapplications" element={<ViewJobs/>}/>
      <Route path="/applicants/:jobId" element={<ViewApplicants />} />
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
     
  
      <Route path="/AddCourse" element={<AddCourse />} /> 
      <Route path="/CourseList" element={<CourseList />} />
      <Route path="/courses" element={<CourseList />} />
      <Route path="/course/:courseId" element={<CourseDetails />} />
      <Route path="/MyCourses" element={<MyCourses />} />
      <Route path="/EditCourse/:courseId?" element={<EditCourse />} />
      <Route path="/AddCourse" element={<EditCourse />} />
      <Route path="/HomePostList" element={<HomePostList />} />
      <Route path="/AdminLearningPlanView" element={<AdminLearningPlanView />} />
      <Route path="/AddJob" element={<AddJob />} />










      </Routes>
    </Router>
  );
}

export default App;
