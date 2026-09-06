import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [resetAdminPassword, setResetAdminPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/admin/settings/audit');
      setLogs(res.data);
    } catch (err) {
      console.error('Failed to load audit logs');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (newPassword.length < 8) {
      return toast.error('New password must be at least 8 characters');
    }

    try {
      await api.post('/admin/settings/password', { currentPassword, newPassword });
      toast.success('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating password');
    }
  };

  const handleResetBatch = async (e) => {
    e.preventDefault();
    if (resetConfirmText !== 'RESET') {
      return toast.error('Type exactly RESET to confirm.');
    }
    if (!resetAdminPassword) {
      return toast.error('Admin password is required.');
    }
    if (!window.confirm("WARNING: This will permanently delete all student data. Ensure you have authorization. Continue?")) {
      return;
    }

    setIsResetting(true);
    try {
      const res = await api.post('/admin/settings/reset-batch', {
        adminPassword: resetAdminPassword,
        confirmText: resetConfirmText
      });
      toast.success(res.data.message);
      setResetConfirmText('');
      setResetAdminPassword('');
      fetchLogs(); // refresh audit logs
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error during reset');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem' }}>
      <h2 style={{ color: '#1a365d', marginBottom: '2rem' }}>System Settings</h2>

      {/* Change Password */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
        <h3 style={{ color: '#2b6cb0', marginBottom: '1rem' }}>Admin Credentials</h3>
        <form onSubmit={handleChangePassword}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label>Current Password</label>
            <input 
              type="password" 
              className="form-control" 
              value={currentPassword} 
              onChange={e => setCurrentPassword(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label>New Password (Min 8 chars)</label>
            <input 
              type="password" 
              className="form-control" 
              value={newPassword} 
              onChange={e => setNewPassword(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label>Confirm New Password</label>
            <input 
              type="password" 
              className="form-control" 
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary">Update Password</button>
        </form>
      </div>

      {/* Reset for New Batch */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid #fc8181', borderRadius: '8px', backgroundColor: '#fff5f5' }}>
        <h3 style={{ color: '#c53030', marginBottom: '1rem' }}>Reset for New Batch (Nuclear Option)</h3>
        <p style={{ color: '#742a2a', marginBottom: '1.5rem' }}>
          <strong>WARNING:</strong> This action will permanently delete all student registrations, attendance, and test results for the current batch. 
          The system will automatically generate a CSV backup before deletion. Question Bank and Admin accounts will be preserved.
        </p>
        
        <form onSubmit={handleResetBatch}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label style={{ color: '#c53030', fontWeight: 'bold' }}>Step 1: Type RESET in all caps to confirm</label>
            <input 
              type="text" 
              className="form-control" 
              value={resetConfirmText} 
              onChange={e => setResetConfirmText(e.target.value)} 
              placeholder="RESET"
              required 
              style={{ border: '1px solid #fc8181' }}
            />
          </div>
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label style={{ color: '#c53030', fontWeight: 'bold' }}>Step 2: Enter your admin password to authorize</label>
            <input 
              type="password" 
              className="form-control" 
              value={resetAdminPassword} 
              onChange={e => setResetAdminPassword(e.target.value)} 
              required 
              style={{ border: '1px solid #fc8181' }}
            />
          </div>
          
          <button 
            type="submit" 
            className="btn" 
            style={{ backgroundColor: '#c53030', color: 'white', fontWeight: 'bold' }}
            disabled={isResetting || resetConfirmText !== 'RESET' || !resetAdminPassword}
          >
            {isResetting ? 'Executing Wipe...' : 'Execute Reset'}
          </button>
        </form>
      </div>

      {/* Audit Log */}
      <div className="card" style={{ padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
        <h3 style={{ color: '#2d3748', marginBottom: '1rem' }}>Audit Log (Read Only)</h3>
        {logs.length === 0 ? (
          <p style={{ color: '#718096' }}>No audit logs found.</p>
        ) : (
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#edf2f7', textAlign: 'left' }}>
                  <th style={{ padding: '0.5rem' }}>Timestamp</th>
                  <th style={{ padding: '0.5rem' }}>Admin</th>
                  <th style={{ padding: '0.5rem' }}>Action</th>
                  <th style={{ padding: '0.5rem' }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '0.5rem', fontSize: '0.9rem' }}>{new Date(log.timestamp).toLocaleString()}</td>
                    <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>{log.adminUsername}</td>
                    <td style={{ padding: '0.5rem', color: '#c53030', fontWeight: 'bold' }}>{log.action}</td>
                    <td style={{ padding: '0.5rem', fontSize: '0.9rem' }}>{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default SettingsPage;
