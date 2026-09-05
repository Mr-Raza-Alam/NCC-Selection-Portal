import React from 'react';

const AdminDashboard = () => {
  const role = sessionStorage.getItem('role');
  const adminName = sessionStorage.getItem('adminName') || '';

  const getRoleName = () => {
    switch(role) {
      case 'lead_admin': return 'Lead Admin';
      case 'cto': return 'Care Taker Officer';
      case 'assistant':
        if (adminName === 'Ravi Kumar') return 'Assistant 1';
        if (adminName === 'Mallika Thapa') return 'Assistant 2';
        return 'Assistant';
      default: return 'Admin';
    }
  };

  return (
    <div className="container" style={{ textAlign: 'center', marginTop: '10vh' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: role === 'cto' ? '0' : '0.5rem', color: 'var(--accent-green)' }}>
        Welcome back, {getRoleName()}
      </h1>
      {role === 'cto' && (
        <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: 'var(--accent-green)' }}>
          Assam University NCC, Silchar
        </h2>
      )}
      {role === 'assistant' && (
        <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
          {adminName}
        </h2>
      )}
      {role === 'lead_admin' && (
        <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
          {adminName}
        </h2>
      )}
      <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
        Please select an option from the sidebar to begin managing the selection process.
      </p>
    </div>
  );
};

export default AdminDashboard;
