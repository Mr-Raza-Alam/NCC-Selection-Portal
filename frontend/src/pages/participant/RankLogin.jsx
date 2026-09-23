import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import BroadcastBanner from '../../components/BroadcastBanner';

const RankLogin = () => {
  const [formData, setFormData] = useState({
    regimentalNo: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.submitter?.blur(); // Blur the button to prevent double clicks if enter pressed
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('/api/rank-auth/login', formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', 'rank_candidate');
      localStorage.setItem('regimentalNo', response.data.regimentalNo);
      
      toast.success('Login successful!');
      navigate('/rank-dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials or you haven\'t registered yet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <BroadcastBanner pageType="landing" />
      <div className="form-card" style={{ maxWidth: '400px', margin: '4rem auto' }}>
        <div className="form-header">
          <h2 style={{ color: '#87CEEB', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>🎖️ Rank Selection Portal</h2>
          <p>Login to access your Rank Dashboard</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Regimental Number</label>
            <input
              type="text"
              name="regimentalNo"
              value={formData.regimentalNo}
              onChange={handleChange}
              placeholder="e.g. AS2025SDIA..."
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn" 
            style={{ 
              width: '100%', 
              backgroundColor: '#87CEEB', 
              color: 'var(--primary-navy)', 
              fontWeight: 'bold', 
              marginTop: '1rem',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            disabled={loading}
          >
            {loading ? <Loader2 className="spinner" size={20} /> : 'Login to Portal'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem' }}>
          <p style={{ color: 'var(--text-secondary)' }}>
            Not registered yet? <Link to="/rank-register" style={{ color: '#87CEEB', fontWeight: 'bold' }}>Register Here</Link>
          </p>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Looking for New Enrollment? <Link to="/login" style={{ color: 'var(--secondary-gold)', fontWeight: 'bold' }}>Go to Enrollment Hub</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RankLogin;
