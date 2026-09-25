import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../../utils/api';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import nccHero from '../../../assets/ncc_pic13.jpeg';

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
      const response = await api.post('/rank-auth/register', formData);
      localStorage.setItem('r_token', response.data.token);
      localStorage.setItem('r_role', 'rank_candidate');
      localStorage.setItem('r_regimentalNo', formData.regimentalNo);
      
      toast.success('Registration successful! Buddy Number generated.');
      navigate('/rank-dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper" style={{ backgroundImage: `url(${nccHero})` }}>
      <div className="auth-overlay"></div>
            
      <div className="auth-card rank-theme">
        <h2>🎖️ Rank Verification</h2>
        <p className="subtitle">Verify your details to access the Rank Portal</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name (As per official records)</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Enter full name" />
          </div>
          
          <div className="auth-row">
            <div className="form-group">
              <label>Regimental Number</label>
              <input type="text" name="regimentalNo" value={formData.regimentalNo} onChange={handleChange} required placeholder="AS2025SDIA..." />
            </div>
            <div className="form-group">
              <label>Department</label>
              <input type="text" name="department" value={formData.department} onChange={handleChange} required placeholder="e.g. CSE" />
            </div>
          </div>

          <div className="auth-row">
            <div className="form-group">
              <label>Semester</label>
              <input type="text" name="semester" value={formData.semester} onChange={handleChange} required placeholder="e.g. 3rd Sem" />
            </div>
            <div className="form-group">
              <label>Mobile Number</label>
              <input type="tel" name="mobileNo" value={formData.mobileNo} onChange={handleChange} required placeholder="10-digit number" />
            </div>
          </div>

          <div className="form-group">
            <label>Email ID</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Institutional Email" />
          </div>

          <div className="auth-row">
            <div className="form-group">
              <label>Set Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required minLength="6" placeholder="Min. 6 characters" />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required placeholder="Retype password" />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-submit" 
            disabled={loading}
          >
            {loading ? <Loader2 className="spinner" size={20} /> : 'Verify & Register'}
          </button>
        </form>

        <div className="auth-footer">
          Already verified? <Link to="/rank-login">Login Here</Link>
        </div>
      </div>
    </div>
  );
};

export default RankRegister;
