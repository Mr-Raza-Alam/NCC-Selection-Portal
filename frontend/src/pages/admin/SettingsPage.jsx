import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const SettingsPage = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [resetAdminPassword, setResetAdminPassword] = useState('');
  const [resetType, setResetType] = useState('nuclear');
  const [isResetting, setIsResetting] = useState(false);
  const [logs, setLogs] = useState([]);
  
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastTarget, setBroadcastTarget] = useState('none');
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);

  useEffect(() => {
    fetchLogs();
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/admin/settings');
      setBroadcastMessage(res.data.broadcastMessage || '');
      setBroadcastTarget(res.data.broadcastTarget || 'none');
    } catch (err) {
      console.error('Failed to load settings');
    }
  };

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

  const handleReset = async (e) => {
    e.preventDefault();
    if (resetConfirmText !== 'RESET') {
      return toast.error('Type RESET to confirm');
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
        confirmText: resetConfirmText,
        resetType
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

  const handleBroadcastSubmit = async () => {
    try {
      await api.post('/admin/settings/broadcast', { broadcastMessage, broadcastTarget });
      toast.success('Broadcast message updated');
      setShowBroadcastModal(false);
    } catch (err) {
      toast.error('Failed to update broadcast');
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

      {/* Broadcast Notification */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#ebf8ff' }}>
        <h3 style={{ color: '#2b6cb0', marginBottom: '1rem' }}>Broadcast Notification</h3>
        <p style={{ color: '#2c5282', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Pin a global message to the top of specific pages. Select "None" to remove the active broadcast.
        </p>
        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label>Broadcast Message</label>
          <textarea 
            className="form-control" 
            value={broadcastMessage} 
            onChange={e => setBroadcastMessage(e.target.value)} 
            rows="3"
            placeholder="e.g. Test window is extended by 10 minutes..."
            style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #bee3f8' }}
          />
        </div>
        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label>Target Page</label>
          <select 
            className="form-control" 
            value={broadcastTarget} 
            onChange={e => setBroadcastTarget(e.target.value)}
          >
            <option value="none">None (Disabled)</option>
            <option value="landing">Landing Page Only</option>
            <option value="dashboard">Student Dashboard Only</option>
            <option value="both">Both Landing Page & Dashboard</option>
          </select>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={(e) => { e.preventDefault(); setShowBroadcastModal(true); }}
        >
          Update Broadcast
        </button>
      </div>

      {/* Granular Reset */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid #fc8181', borderRadius: '8px', backgroundColor: '#fff5f5' }}>
        <h3 style={{ color: '#c53030', marginBottom: '1rem' }}>Database Reset Options</h3>
        <p style={{ color: '#9b2c2c', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Select which part of the database you want to reset. This action requires your admin password.
        </p>
        
        <form onSubmit={handleReset}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label>Reset Target</label>
            <select 
              className="form-control" 
              value={resetType} 
              onChange={e => setResetType(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #feb2b2' }}
            >
              <option value="nuclear">Nuclear Reset (Everything - New Batch)</option>
              <option value="questions">Question Bank Only</option>
              <option value="r1">Round 1 Scores & Setup Only</option>
              <option value="r2">Round 2 Scores Only</option>
              <option value="r3">Round 3 Scores Only</option>
            </select>
          </div>

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

      {/* Broadcast Flashbox Modal */}
      {showBroadcastModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="modal-content glass-card" style={{ maxWidth: '400px', width: '90%', padding: '2rem', textAlign: 'center', backgroundColor: '#fff', borderRadius: '8px' }}>
            <h3 style={{ color: 'var(--primary-navy)', marginBottom: '1rem' }}>Confirm Broadcast</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.95rem', lineHeight: '1.5' }}>
              Are you sure to send this broadcast msg right away? It will instantly appear on the selected target page(s).
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn btn-outline" onClick={() => setShowBroadcastModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleBroadcastSubmit}>Confirm & Send</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SettingsPage;
