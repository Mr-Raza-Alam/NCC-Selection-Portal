import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Register from './pages/participant/enrollment/Register';
import Login from './pages/participant/enrollment/Login';
import ForgotPassword from './pages/participant/enrollment/ForgotPassword';
import Dashboard from './pages/participant/enrollment/Dashboard';
import Test from './pages/participant/enrollment/Test';
import TestInstructions from './pages/participant/enrollment/TestInstructions';
import RankTest from './pages/participant/rank/RankTest';
import RankTestInstructions from './pages/participant/rank/RankTestInstructions';
import { Toaster } from 'react-hot-toast';
import BroadcastBanner from './components/BroadcastBanner';
import AdminLogin from './pages/admin/shared/AdminLogin';
import AdminDashboard from './pages/admin/shared/AdminDashboard';
import Round1Setup from './pages/admin/enrollment/Round1Setup';
import Round1Entry from './pages/admin/enrollment/Round1Entry';
import Round1Home from './pages/admin/enrollment/Round1Home';
import R2Attendance from './pages/admin/enrollment/R2Attendance';
import Round2Entry from './pages/admin/enrollment/Round2Entry';
import Round2Home from './pages/admin/enrollment/Round2Home';
import Round3Entry from './pages/admin/enrollment/Round3Entry';
import Round3Verify from './pages/admin/enrollment/Round3Verify';
import Round3Home from './pages/admin/enrollment/Round3Home';
import MasterTable from './pages/admin/enrollment/MasterTable';
import RoleManagement from './pages/admin/shared/RoleManagement';
import TestManagement from './pages/admin/shared/TestManagement';
import SettingsPage from './pages/admin/shared/SettingsPage';
import RankUpload from './pages/admin/rank/RankUpload';
import LandingPage from './pages/participant/LandingPage';
import SelectionHub from './pages/participant/SelectionHub';
import RankLogin from './pages/participant/rank/RankLogin';
import RankRegister from './pages/participant/rank/RankRegister';
import RankDashboard from './pages/participant/rank/RankDashboard';
import Navbar from './components/Navbar';
import AdminLayout from './components/AdminLayout';

const PrivateRoute = ({ children, role }) => {
  let token, userRole, loginRoute;

  if (role === 'rank_candidate') {
    token = localStorage.getItem('r_token');
    userRole = localStorage.getItem('r_role');
    loginRoute = '/rank-login';
  } else if (role === 'participant') {
    token = localStorage.getItem('e_token');
    userRole = localStorage.getItem('e_role');
    loginRoute = '/login';
  } else {
    token = localStorage.getItem('token');
    userRole = localStorage.getItem('role');
    loginRoute = '/admin/login';
  }
  
  if (!token) return <Navigate to={loginRoute} />;
  
  if (role === 'participant' && userRole !== 'participant') return <Navigate to={loginRoute} />;
  if (role === 'rank_candidate' && userRole !== 'rank_candidate') return <Navigate to={loginRoute} />;
  
  if (role === 'admin' && !['cto', 'lead_admin', 'assistant', 'assistant1', 'assistant2'].includes(userRole)) {
    return <Navigate to={loginRoute} />;
  }
  
  return children;
};

import StudentTable from './pages/admin/enrollment/StudentTable';
import RankRound1Home from './pages/admin/rank/RankRound1Home';
import RankRound1Setup from './pages/admin/rank/RankRound1Setup';
import RankRound1Entry from './pages/admin/rank/RankRound1Entry';
import RankRound2Home from './pages/admin/rank/RankRound2Home';
import RankR2Attendance from './pages/admin/rank/RankR2Attendance';
import RankRound2Entry from './pages/admin/rank/RankRound2Entry';
import RankRound3Home from './pages/admin/rank/RankRound3Home';
import RankRound3Entry from './pages/admin/rank/RankRound3Entry';
import RankRound3Verify from './pages/admin/rank/RankRound3Verify';
import RankMasterTable from './pages/admin/rank/RankMasterTable';
import RankStudentTable from './pages/admin/rank/RankStudentTable';


// Wrapper to conditionally render participant Navbar
const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isLandingPage = location.pathname === '/';

  return (
    <>
      <Toaster position="top-right" toastOptions={{ style: { background: 'var(--surface-grey)', color: 'var(--text-primary)' } }} />
      {!isAdminRoute && <Navbar />}
      {!isAdminRoute && <BroadcastBanner />}
      <div className={!isAdminRoute ? 'container' : ''}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/selection-hub" element={<SelectionHub />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/rank-login" element={<RankLogin />} />
          <Route path="/rank-register" element={<RankRegister />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          <Route path="/dashboard" element={
            <PrivateRoute role="participant"><Dashboard /></PrivateRoute>
          } />

          <Route path="/rank-dashboard" element={
            <PrivateRoute role="rank_candidate"><RankDashboard /></PrivateRoute>
          } />

          <Route path="/test-instructions" element={
            <PrivateRoute role="participant"><TestInstructions /></PrivateRoute>
          } />
          
          <Route path="/test" element={
            <PrivateRoute role="participant"><Test /></PrivateRoute>
          } />
          
          <Route path="/rank-test-instructions" element={
            <PrivateRoute role="rank_candidate"><RankTestInstructions /></PrivateRoute>
          } />
          
          <Route path="/rank-test" element={
            <PrivateRoute role="rank_candidate"><RankTest /></PrivateRoute>
          } />
          
          <Route path="/admin/login" element={<AdminLogin />} />
          
          {/* Admin Routes wrapped in AdminLayout */}
          <Route path="/admin" element={<PrivateRoute role="admin"><AdminLayout /></PrivateRoute>}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="students" element={<StudentTable />} />
            <Route path="r1" element={<Round1Home />} />
            <Route path="r1/setup" element={<Round1Setup />} />
            <Route path="r1/entry" element={<Round1Entry />} />
            <Route path="r1/result" element={<Round1Entry />} />
            <Route path="r2" element={<Round2Home />} />
            <Route path="r2/attendance" element={<R2Attendance />} />
            <Route path="r2/entry" element={<Round2Entry />} />
            <Route path="r2/result" element={<Round2Entry />} />
            <Route path="r3" element={<Round3Home />} />
            <Route path="r3/entry" element={<Round3Entry />} />
            <Route path="r3/result" element={<Round3Entry />} />
            <Route path="r3/verify" element={<Round3Verify />} />
            <Route path="master" element={<MasterTable />} />
            <Route path="roles" element={<RoleManagement />} />
            <Route path="test-management" element={<TestManagement />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="rank/upload" element={<RankUpload />} />
            <Route path="rank/r1" element={<RankRound1Home />} />
            <Route path="rank/r1/setup" element={<RankRound1Setup />} />
            <Route path="rank/r1/entry" element={<RankRound1Entry />} />
            <Route path="rank/r1/result" element={<RankRound1Entry />} />
            
            <Route path="rank/r2" element={<RankRound2Home />} />
            <Route path="rank/r2/attendance" element={<RankR2Attendance />} />
            <Route path="rank/r2/entry" element={<RankRound2Entry />} />
            <Route path="rank/r2/result" element={<RankRound2Entry />} />
            
            <Route path="rank/r3" element={<RankRound3Home />} />
            <Route path="rank/r3/entry" element={<RankRound3Entry />} />
            <Route path="rank/r3/result" element={<RankRound3Entry />} />
            <Route path="rank/r3/verify" element={<RankRound3Verify />} />
            <Route path="rank/master" element={<RankMasterTable />} />
            <Route path="rank/students" element={<RankStudentTable />} />
            <Route path="rank/test-management" element={<TestManagement />} />
            <Route path="rank/settings" element={<SettingsPage />} />

          </Route>
        </Routes>
      </div>
    </>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
