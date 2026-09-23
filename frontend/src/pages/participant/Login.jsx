import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';
import Loader from '../../components/Loader';
import nccHero from '../../assets/ncc_pic13.jpeg';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ code: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data } = await api.post('/auth/login', formData);
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', 'participant');
      localStorage.setItem('name', data.name);
      localStorage.setItem('code', data.code);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-wrapper" style={{ backgroundImage: `url(${nccHero})` }}>
      <div className="auth-overlay"></div>
      {isLoading && <Loader overlay message="Logging in..." />}
      
      <div className="auth-card enroll-theme">
        <h2>🛡️ Participant Login</h2>
        <p className="subtitle">Enter your credentials to access the 1st-Year Portal</p>
        
        {error && <p style={{color: '#ff6b6b', marginBottom: '1rem', textAlign: 'center', background: 'rgba(255,0,0,0.1)', padding: '0.5rem', borderRadius: '4px'}}>{error}</p>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Chest No (Code)</label>
            <input type="number" name="code" required onChange={handleChange} placeholder="e.g. 128" />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input 
                type={showPassword ? "text" : "password"} 
                name="password" 
                style={{ width: '100%', paddingRight: '40px' }}
                required 
                onChange={handleChange} 
                placeholder="Enter password"
              />
              <span 
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '10px', cursor: 'pointer', fontSize: '1.2rem', userSelect: 'none' }}
              >
                {showPassword ? '👁️' : '🙈'}
              </span>
            </div>
            <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
              <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>Forgot Password?</Link>
            </div>
          </div>
          
          <button type="submit" className="btn-submit">Login</button>
        </form>
        
        <div className="auth-footer">
          New participant? <Link to="/register">Register here</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
