import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Step 1 State
  const [verifyData, setVerifyData] = useState({ admissionNo: '', dob: '', contactNo: '' });
  const [studentId, setStudentId] = useState(null);

  // Step 2 State
  const [resetData, setResetData] = useState({ newPassword: '', confirmPassword: '' });

  const handleVerifyChange = (e) => setVerifyData({ ...verifyData, [e.target.name]: e.target.value });
  const handleResetChange = (e) => setResetData({ ...resetData, [e.target.name]: e.target.value });

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    if (!verifyData.admissionNo || !verifyData.dob || !verifyData.contactNo) {
      setError('Please fill all fields');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const { data } = await api.post('/auth/verify-details', verifyData);
      if (data.success) {
        setStudentId(data.studentId);
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    
    if (resetData.newPassword !== resetData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (resetData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post('/auth/reset-password', { studentId, newPassword: resetData.newPassword });
      toast.success('Password updated successfully. Please login with your new password.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-card auth-box">
        <h2>Reset Password</h2>
        
        {error && <p style={{ color: 'var(--danger-red)', marginBottom: '1rem', textAlign: 'center' }}>{error}</p>}
        
        {step === 1 ? (
          <form onSubmit={handleVerifySubmit}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
              Enter your registration details below to reset your password.
            </p>
            <div className="input-group">
              <label>Admission No</label>
              <input type="text" name="admissionNo" value={verifyData.admissionNo} onChange={handleVerifyChange} required />
            </div>
            <div className="input-group">
              <label>Date of Birth</label>
              <input type="date" name="dob" value={verifyData.dob} onChange={handleVerifyChange} required />
            </div>
            <div className="input-group">
              <label>Contact No</label>
              <input type="tel" name="contactNo" value={verifyData.contactNo} onChange={handleVerifyChange} required />
            </div>
            
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
              {loading ? 'Verifying...' : 'Verify Details'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetSubmit}>
            <p style={{ color: 'var(--accent-green)', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.9rem', fontWeight: 'bold' }}>
              Details verified! Set your new password.
            </p>
            <div className="input-group">
              <label>New Password</label>
              <input type="password" name="newPassword" value={resetData.newPassword} onChange={handleResetChange} required />
            </div>
            <div className="input-group">
              <label>Confirm Password</label>
              <input type="password" name="confirmPassword" value={resetData.confirmPassword} onChange={handleResetChange} required />
            </div>
            
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}

        <p style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <Link to="/login" style={{ color: 'var(--accent-green)' }}>Back to Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
