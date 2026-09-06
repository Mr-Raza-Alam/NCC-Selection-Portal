import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/admin/login', formData);
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('features', JSON.stringify(data.features || []));
      localStorage.setItem('adminName', data.username || '');
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Admin login failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-card auth-box">
        <h2>Admin Portal</h2>
        {error && <p style={{color: 'var(--danger-red)', marginBottom: '1rem'}}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Username</label>
            <input type="text" onChange={(e) => setFormData({...formData, username: e.target.value})} />
          </div>
          <div className="input-group">
            <label>Password</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input 
                type={showPassword ? "text" : "password"} 
                style={{ width: '100%', paddingRight: '40px' }}
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
              />
              <span 
                onClick={() => setShowPassword(!showPassword)}
                style={{ 
                  position: 'absolute', 
                  right: '10px', 
                  cursor: 'pointer', 
                  fontSize: '1.2rem',
                  userSelect: 'none'
                }}
              >
                {showPassword ? '👁️' : '🙈'}
              </span>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{width: '100%'}}>Login</button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
