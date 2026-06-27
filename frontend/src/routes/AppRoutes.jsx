import { Navigate, Route, Routes } from 'react-router-dom';
import Landing from '../pages/Landing.jsx';
import Login from '../pages/Login.jsx';
import Register from '../pages/Register.jsx';
import Verification from '../pages/Verification.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import Profile from '../pages/Profile.jsx';
import ArticlePage from '../pages/ArticlePage.jsx';
import Programs from '../pages/Programs.jsx';
import CreateProgram from '../pages/CreateProgram.jsx';
import ProgramDetail from '../pages/ProgramDetail.jsx';
import ExerciseLibrary from '../pages/ExerciseLibrary.jsx';
import AdminPanel from '../pages/AdminPanel.jsx';
import Coaches from '../pages/Coaches.jsx';
import CoachDetail from '../pages/CoachDetail.jsx';
import MyRequests from '../pages/MyRequests.jsx';
import CoachRequests from '../pages/CoachRequests.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify" element={<Verification />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/programs" element={<Programs />} />
      <Route path="/programs/new" element={<CreateProgram />} />
      <Route path="/programs/:id" element={<ProgramDetail />} />
      <Route path="/exercises" element={<ExerciseLibrary />} />
      <Route path="/coaches" element={<Coaches />} />
      <Route path="/coaches/:id" element={<CoachDetail />} />
      <Route path="/requests" element={<MyRequests />} />
      <Route path="/coach-requests" element={<CoachRequests />} />
      <Route path="/admin" element={<AdminPanel />} />
      <Route path="/articles/:slug" element={<ArticlePage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
