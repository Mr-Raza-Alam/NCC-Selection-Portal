import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './Navbar';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem('role');
  const features = JSON.parse(localStorage.getItem('features') || '[]');
  const name = localStorage.getItem('adminName');
  const [profileOpen, setProfileOpen] = useState(false);

  const hasFeature = (f) => features.includes(f);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/admin/login');
  };

  const menuItems = [
    { title: 'Selection Process', isHeader: true },
    { name: 'Round 1 (Physical)', path: '/admin/r1', feature: ['R1_SETUP', 'R1_SCORE'] },
    { name: 'Round 2 (Written)', path: '/admin/r2', feature: ['R2_START', 'R2_ATTENDANCE'] },
    { name: 'Round 3 (Interview)', path: '/admin/r3', feature: ['R3_SCORE', 'R3_VERIFY'] },
    { title: 'Records', isHeader: true },
    { name: 'Student Record', path: '/admin/students', feature: ['STUDENT_TABLE'] },
    { name: 'Master Table', path: '/admin/master', feature: ['MASTER_TABLE', 'R3_VERIFY'] },
    { name: 'Test Management', path: '/admin/test-management', feature: ['TEST_MANAGEMENT'] },
    { name: 'Settings', path: '/admin/settings', feature: ['SETTINGS'] },
    { title: 'System', isHeader: true, role: 'lead_admin' },
    { name: 'Role Management', path: '/admin/roles', role: 'lead_admin' }
  ];

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="admin-layout-wrapper" style={{ position: 'relative' }}>
        <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)}></div>
        {/* Sidebar */}
        <div className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div 
            onClick={() => navigate('/admin/dashboard')}
            style={{ cursor: 'pointer', height: '70px', display: 'flex', alignItems: 'center', padding: '0 1.5rem', fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--primary-navy)', borderBottom: '1px solid var(--border-color)' }}
          >
            Admin Panel
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 0' }}>
            {menuItems.map((item, idx) => {
              let canSee = true;
              if (role === 'lead_admin') {
                canSee = true;
              } else if (item.role && item.role !== role) {
                canSee = false;
              } else if (item.feature) {
                canSee = item.feature.some(f => hasFeature(f));
              }

              if (!canSee) return null;

              if (item.isHeader) {
                return <div key={idx} style={{ padding: '1rem 1.5rem 0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>{item.title}</div>;
              }

              const isActive = location.pathname.startsWith(item.path);
              return (
                <div
                  key={item.path}
                  onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                  style={{
                    padding: '0.75rem 1.5rem',
                    cursor: 'pointer',
                    background: isActive ? 'var(--primary-navy)' : 'transparent',
                    borderRight: isActive ? '3px solid var(--secondary-gold)' : 'none',
                    color: isActive ? 'white' : 'inherit',
                    transition: 'all 0.2s'
                  }}
                >
                  {item.name}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg-white)' }}>

          {/* Sub-header / Profile Bar */}
          <div style={{ height: '70px', background: 'var(--bg-white)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 2rem' }}>
            <div style={{ position: 'relative' }}>
              <div
                onClick={() => setProfileOpen(!profileOpen)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'var(--surface-grey)', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer' }}
              >
                <span style={{ fontSize: '1.2rem' }}>👤</span>
                <span style={{ fontWeight: 'bold', textTransform: 'capitalize', color: 'var(--primary-navy)' }}>{name || role}</span>
              </div>

              {profileOpen && (
                <div style={{ position: 'absolute', top: '120%', right: 0, width: '250px', background: 'var(--bg-white)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '1rem', zIndex: 1000, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary-navy)' }}>Profile Details</h4>
                  {name && <p style={{ margin: '0 0 0.25rem 0', color: 'var(--text-secondary)' }}>Name: <strong style={{ color: 'var(--primary-navy)', textTransform: 'capitalize' }}>{name}</strong></p>}
                  <p style={{ margin: '0 0 1rem 0', color: 'var(--text-secondary)' }}>Role: <strong style={{ color: 'var(--accent-green)', textTransform: 'capitalize' }}>{role}</strong></p>
                  <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '1rem 0' }} />
                  <button className="btn btn-danger" style={{ width: '100%' }} onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          </div>

          {/* Page Content */}
          <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
            {(() => {
              const currentItem = menuItems.find(item => !item.isHeader && location.pathname.startsWith(item.path));
              let hasAccess = true;

              if (currentItem) {
                if (role === 'lead_admin') {
                  hasAccess = true;
                } else if (currentItem.role && currentItem.role !== role) {
                  hasAccess = false;
                } else if (currentItem.feature) {
                  hasAccess = currentItem.feature.some(f => hasFeature(f));
                }
              }

              if (!hasAccess) {
                return (
                  <div className="container" style={{ textAlign: 'center', marginTop: '5rem' }}>
                    <h3 style={{ color: 'var(--danger-red)' }}>Your Role is {role}, so you won't access all other feature</h3>
                  </div>
                );
              }

              return <Outlet />;
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

      export default AdminLayout;
