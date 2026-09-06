import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const name = localStorage.getItem('username') || localStorage.getItem('name');
  const code = localStorage.getItem('code');

  const handleLogout = () => {
    localStorage.clear();
    navigate(role === 'participant' ? '/login' : '/admin/login');
  };

  return (
    <nav className="navbar">
      <div className="logos left">
        <img src="/AUS_Logo.jpg" alt="Assam University Logo" />
      </div>
      
      <div className="center-title">
        <h1>NCC Selection Portal</h1>
        <h3>3 Assam Battalion, NCC — Assam University Silchar</h3>
      </div>
      
      <div className="logos right" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {token && (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button 
              onClick={() => document.body.classList.toggle('navy-theme')}
              style={{ background: 'transparent', border: '1px solid var(--border-color)', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-primary)' }}
              title="Toggle Theme"
            >
              🌗
            </button>
            <button onClick={handleLogout} className="btn btn-danger" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}>
              Logout
            </button>
          </div>
        )}
        <img src="/Ncc_Logo.jpg" alt="NCC Logo" />
      </div>
    </nav>
  );
};

export default Navbar;
