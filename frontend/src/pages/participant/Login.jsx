import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', dob: '', password: '' });
  const [error, setError] = useState('');

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
            <label>Full Name</label>
            <input type="text" name="name" required onChange={handleChange} />
          </div>
          <div className="input-group">
            <label>Date of Birth</label>
            <input type="date" name="dob" required onChange={handleChange} />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input type="password" name="password" required onChange={handleChange} />
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
