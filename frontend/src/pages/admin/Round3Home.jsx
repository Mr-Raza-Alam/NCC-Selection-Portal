import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const Round3Home = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/admin/settings');
      setSettings(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (!settings) return <div>Loading...</div>;

  const isR2Completed = settings.r2Cutoff !== undefined && settings.r2Cutoff > 0;
  const isCompleted = settings.r3Completed === true;
  const isActive = settings.r3Active;

  const handleStartR3 = async () => {
    try {
      await api.post('/admin/r3/start');
      fetchSettings();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h2 style={{ marginBottom: '2rem' }}>Round 3: Interview</h2>
      
      {!isR2Completed ? (
        <div className="glass-card" style={{ maxWidth: '400px', borderColor: 'var(--danger-red)' }}>
          <h3 style={{ color: 'var(--danger-red)' }}>Round 2 Incomplete</h3>
          <p style={{ color: 'var(--text-secondary)' }}>You must finalize Round 2 (Apply Cutoff) before you can start Round 3.</p>
        </div>
      ) : (!isActive && !isCompleted) ? (
        <div className="glass-card" style={{ maxWidth: '400px' }}>
          <h3>Initial Setup</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Configure R3 attendance and enter interview scores.</p>
          <button className="btn btn-primary" onClick={handleStartR3}>Start R3</button>
        </div>
      ) : !isCompleted ? (
        <div className="glass-card" style={{ maxWidth: '400px', borderColor: 'var(--warning-amber)' }}>
          <h3 style={{ color: 'var(--warning-amber)' }}>Round 3 Active</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Round 3 is active. You can now conduct interviews.</p>
          <button className="btn btn-primary" onClick={() => navigate('/admin/r3/entry')}>Go to Interview Desk</button>
        </div>
      ) : (
        <div className="glass-card" style={{ maxWidth: '400px', borderColor: 'var(--accent-green)' }}>
          <h3 style={{ color: 'var(--accent-green)' }}>R3_Result ✓</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Round 3 has been completed.</p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-outline" onClick={() => navigate('/admin/r3/entry')}>View Results</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Round3Home;
