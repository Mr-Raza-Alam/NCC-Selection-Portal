import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', department: '', dob: '', admissionNo: '', email: '', contactNo: '', password: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/register', formData);
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', 'participant');
      localStorage.setItem('name', data.name);
      localStorage.setItem('code', data.code);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-card auth-box">
        <h2>Participant Registration</h2>
        {error && <p style={{color: 'var(--danger-red)', marginBottom: '1rem'}}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Full Name</label>
            <input type="text" name="name" required onChange={handleChange} />
          </div>
          <div className="input-group">
            <label>Department</label>
            <input type="text" name="department" required onChange={handleChange} />
          </div>
          <div className="input-group">
            <label>Date of Birth</label>
            <input type="date" name="dob" required onChange={handleChange} />
          </div>
          <div className="input-group">
            <label>Admission No</label>
            <input type="text" name="admissionNo" required onChange={handleChange} />
          </div>
          <div className="input-group">
            <label>Email ID</label>
            <input type="email" name="email" required onChange={handleChange} />
          </div>
          <div className="input-group">
            <label>Contact No</label>
            <input type="tel" name="contactNo" required onChange={handleChange} />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input type="password" name="password" required onChange={handleChange} />
          </div>
          <div className="input-group" style={{ flexDirection: 'row', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <input type="checkbox" required style={{ marginTop: '0.3rem', width: 'auto' }} />
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              I declare that I am a legitimate student of Assam University and all information provided is true. Any false information will lead to immediate disqualification from the NCC selection process.
            </label>
          </div>
          <button type="submit" className="btn btn-primary" style={{width: '100%'}}>Register</button>
        </form>
        <p style={{marginTop: '1rem', textAlign: 'center'}}>
          Already registered? <Link to="/login" style={{color: 'var(--accent-green)'}}>Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
