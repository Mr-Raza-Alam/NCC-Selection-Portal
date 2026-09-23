import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';
import Loader from '../../components/Loader';
import nccHero from '../../assets/ncc_pic13.jpeg';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', department: '', dob: '', admissionNo: '', email: '', contactNo: '', parentContactNo: '', password: ''
  });
  const [error, setError] = useState('');
  const [emailWarning, setEmailWarning] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === 'email') {
      const email = e.target.value;
      if (email.length > 0 && !/^[a-zA-Z]/.test(email)) {
        setEmailWarning('Are you sure this is your correct email? It looks unusual.');
      } else {
        setEmailWarning('');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data } = await api.post('/auth/register', formData);
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', 'participant');
      localStorage.setItem('name', data.name);
      localStorage.setItem('code', data.code);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-wrapper" style={{ backgroundImage: `url(${nccHero})` }}>
      <div className="auth-overlay"></div>
      {isLoading && <Loader overlay message="Registering..." />}

      <div className="auth-card enroll-theme">
        <h2>🛡️ New Enrollment</h2>
        <p className="subtitle">Create your account for the NCC Selection Process</p>

        {error && <p style={{ color: '#ff6b6b', marginBottom: '1rem', textAlign: 'center', background: 'rgba(255,0,0,0.1)', padding: '0.5rem', borderRadius: '4px' }}>{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" name="name" required onChange={handleChange} placeholder="Enter your full name" />
          </div>

          <div className="auth-row">
            <div className="form-group">
              <label>Department</label>
              <input type="text" name="department" required onChange={handleChange} placeholder="e.g. CSE" />
            </div>
            <div className="form-group">
              <label>Date of Birth</label>
              <input type="date" name="dob" required onChange={handleChange} />
            </div>
          </div>

          <div className="auth-row">
            <div className="form-group">
              <label>Admission No</label>
              <input type="text" name="admissionNo" required onChange={handleChange} placeholder="e.g. 2024-..." />
            </div>
            <div className="form-group">
              <label>Student Contact No</label>
              <input type="tel" name="contactNo" required onChange={handleChange} placeholder="10-digit number" />
            </div>
          </div>

          <div className="form-group">
            <label>Email ID</label>
            <input type="email" name="email" required onChange={handleChange} placeholder="Your email address" />
            {emailWarning && <span style={{ color: 'var(--warning-amber)', fontSize: '0.8rem', marginTop: '0.3rem', display: 'block' }}>{emailWarning}</span>}
          </div>

          <div className="auth-row">
            <div className="form-group">
              <label>Parent Contact No</label>
              <input type="tel" name="parentContactNo" onChange={handleChange} placeholder="Optional" />
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
                  placeholder="Min. 6 chars"
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '10px', cursor: 'pointer', fontSize: '1.2rem', userSelect: 'none' }}
                >
                  {showPassword ? '👁️' : '🙈'}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1.5rem', marginTop: '0.5rem' }}>
            <input type="checkbox" required style={{ marginTop: '0.3rem', cursor: 'pointer' }} />
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #666)', lineHeight: '1.4', fontWeight: 'normal' }}>
              I declare that I am a legitimate student of Assam University and all information provided is true. Any false information will lead to immediate disqualification from the NCC selection process.
            </label>
          </div>

          <button type="submit" className="btn-submit">Register</button>
        </form>

        <div className="auth-footer">
          Already registered? <Link to="/login">Login here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
