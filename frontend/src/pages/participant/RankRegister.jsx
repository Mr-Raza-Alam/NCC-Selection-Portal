import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import BroadcastBanner from '../../components/BroadcastBanner';

const RankRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    regimentalNo: '',
    department: '',
    semester: '',
    mobileNo: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post('/api/rank-auth/register', formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', 'rank_candidate');
      localStorage.setItem('regimentalNo', formData.regimentalNo);
      
      toast.success('Registration successful! Buddy Number generated.');
      navigate('/rank-dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container" style={{ padding: '2rem 1rem' }}>
      <BroadcastBanner pageType="landing" />
      <div className="form-card" style={{ maxWidth: '500px', margin: '2rem auto' }}>
        <div className="form-header">
          <h2 style={{ color: '#87CEEB', textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>🎖️ Rank Candidate Verification</h2>
          <p>Please verify your details and set a password to access the Rank Portal.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label>Full Name (As per official records)</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label>Regimental Number</label>
              <input type="text" name="regimentalNo" value={formData.regimentalNo} onChange={handleChange} required placeholder="e.g. AS2025SDIA..." />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Department</label>
              <input type="text" name="department" value={formData.department} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label>Semester</label>
              <input type="text" name="semester" value={formData.semester} onChange={handleChange} required placeholder="e.g. CSE, 3rd Sem" />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Mobile Number</label>
              <input type="tel" name="mobileNo" value={formData.mobileNo} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group">
            <label>Email ID</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>

          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label>Set Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required minLength="6" />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Confirm Password</label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
            </div>
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
            {loading ? <Loader2 className="spinner" size={20} /> : 'Verify & Register'}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem' }}>
          <p style={{ color: 'var(--text-secondary)' }}>
            Already verified? <Link to="/rank-login" style={{ color: '#87CEEB', fontWeight: 'bold' }}>Login Here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RankRegister;
