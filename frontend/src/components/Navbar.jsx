import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token') || localStorage.getItem('e_token') || localStorage.getItem('r_token');
  const role = localStorage.getItem('role') || localStorage.getItem('e_role') || localStorage.getItem('r_role');

  const handleLogout = () => {
    localStorage.clear();
    if (window.location.pathname.includes('/admin')) {
      navigate('/admin/login');
    } else if (window.location.pathname.includes('/rank')) {
      navigate('/rank-login');
    } else {
      navigate('/login');
    }
  };

  return (
    <nav className="navbar">
      <div className="logos left" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
