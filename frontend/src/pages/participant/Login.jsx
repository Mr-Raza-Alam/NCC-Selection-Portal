import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ code: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/login', formData);
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', 'participant');
      localStorage.setItem('name', data.name);
      localStorage.setItem('code', data.code);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-card auth-box">
        <h2>Participant Login</h2>
        {error && <p style={{color: 'var(--danger-red)', marginBottom: '1rem'}}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Chest No (Code)</label>
            <input type="number" name="code" required onChange={handleChange} placeholder="e.g. 128" />
          </div>
          <div className="input-group">
            <label>Password</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input 
                type={showPassword ? "text" : "password"} 
                name="password" 
                style={{ width: '100%', paddingRight: '40px' }}
                required 
                onChange={handleChange} 
              />
              <span 
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '10px', cursor: 'pointer', fontSize: '1.2rem', userSelect: 'none' }}
              >
                {showPassword ? '👁️' : '🙈'}
              </span>
            </div>
            <div style={{ textAlign: 'right', marginTop: '0.25rem' }}>
              <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--accent-green)' }}>Forgot Password?</Link>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{width: '100%'}}>Login</button>
        </form>
        <p style={{marginTop: '1rem', textAlign: 'center'}}>
          New participant? <Link to="/register" style={{color: 'var(--accent-green)'}}>Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
