import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Register from './pages/participant/Register';
import Login from './pages/participant/Login';
import Dashboard from './pages/participant/Dashboard';
import Test from './pages/participant/Test';
import TestInstructions from './pages/participant/TestInstructions';
import { Toaster } from 'react-hot-toast';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import Round1Setup from './pages/admin/Round1Setup';
import Round1Entry from './pages/admin/Round1Entry';
import Round1Home from './pages/admin/Round1Home';
import R2Attendance from './pages/admin/R2Attendance';
import Round2Entry from './pages/admin/Round2Entry';
import Round2Home from './pages/admin/Round2Home';
import Round3Entry from './pages/admin/Round3Entry';
import Round3Verify from './pages/admin/Round3Verify';
import Round3Home from './pages/admin/Round3Home';
import MasterTable from './pages/admin/MasterTable';
import RoleManagement from './pages/admin/RoleManagement';
import TestManagement from './pages/admin/TestManagement';
import SettingsPage from './pages/admin/SettingsPage';
import LandingPage from './pages/participant/LandingPage';
import Navbar from './components/Navbar';
import AdminLayout from './components/AdminLayout';

const PrivateRoute = ({ children, role }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');
  
  if (!token) return <Navigate to={role === 'participant' ? '/login' : '/admin/login'} />;
  
  if (role === 'participant' && userRole !== 'participant') {
    return <Navigate to="/login" />;
  }
  
  if (role === 'admin' && !['cto', 'lead_admin', 'assistant', 'assistant1', 'assistant2'].includes(userRole)) {
    return <Navigate to="/admin/login" />;
  }
  
  return children;
};

import StudentTable from './pages/admin/StudentTable';

// Wrapper to conditionally render participant Navbar
const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isLandingPage = location.pathname === '/';

  return (
    <>
      <Toaster position="top-right" toastOptions={{ style: { background: 'var(--surface-grey)', color: 'var(--text-primary)' } }} />
      {!isAdminRoute && <Navbar />}
      <div className={!isAdminRoute ? 'container' : ''}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          
          <Route path="/dashboard" element={
            <PrivateRoute role="participant"><Dashboard /></PrivateRoute>
          } />

          <Route path="/test-instructions" element={
            <PrivateRoute role="participant"><TestInstructions /></PrivateRoute>
          } />
          
          <Route path="/test" element={
            <PrivateRoute role="participant"><Test /></PrivateRoute>
          } />
          
          <Route path="/admin/login" element={<AdminLogin />} />
          
          {/* Admin Routes wrapped in AdminLayout */}
          <Route path="/admin" element={<PrivateRoute role="admin"><AdminLayout /></PrivateRoute>}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="students" element={<StudentTable />} />
            <Route path="r1" element={<Round1Home />} />
            <Route path="r1/setup" element={<Round1Setup />} />
            <Route path="r1/entry" element={<Round1Entry />} />
            <Route path="r2" element={<Round2Home />} />
            <Route path="r2/attendance" element={<R2Attendance />} />
            <Route path="r2/entry" element={<Round2Entry />} />
            <Route path="r3" element={<Round3Home />} />
            <Route path="r3/entry" element={<Round3Entry />} />
            <Route path="r3/verify" element={<Round3Verify />} />
            <Route path="master" element={<MasterTable />} />
            <Route path="roles" element={<RoleManagement />} />
            <Route path="test-management" element={<TestManagement />} />
            <Route path="settings" element={<SettingsPage />} />
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
