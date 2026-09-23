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
    <div className="auth-wrapper" style={{ backgroundImage: `url('/src/assets/ncc_pic13.jpeg')` }}>
      <div className="auth-overlay"></div>
      <BroadcastBanner pageType="landing" />
      
      <div className="auth-card rank-theme">
        <h2>🎖️ Rank Selection Portal</h2>
        <p className="subtitle">Login to access your Rank Dashboard</p>

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
            className="btn-submit" 
            disabled={loading}
          >
            {loading ? <Loader2 className="spinner" size={20} /> : 'Login to Portal'}
          </button>
        </form>

        <div className="auth-footer" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div>
            Not registered yet? <Link to="/rank-register">Register Here</Link>
          </div>
          <div>
            <Link to="/login" style={{ fontSize: '0.85rem', opacity: 0.8, color: 'rgba(255,255,255,0.7)', marginLeft: 0 }}>Switch to New Enrollment Portal</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RankLogin;
