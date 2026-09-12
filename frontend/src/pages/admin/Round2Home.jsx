import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const Round2Home = () => {
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

  const isCompleted = settings.r2Cutoff !== undefined && settings.r2Cutoff > 0;
  const isActive = settings.r2Active;
  const isR1Completed = settings.r1Cutoff !== undefined && settings.r1Cutoff > 0;

  return (
    <div>
      <h2 style={{ marginBottom: '2rem' }}>Round 2: Written Test</h2>
      
      {!isR1Completed ? (
        <div className="glass-card" style={{ maxWidth: '400px', borderColor: 'var(--danger-red)' }}>
          <h3 style={{ color: 'var(--danger-red)' }}>Round 1 Incomplete</h3>
          <p style={{ color: 'var(--text-secondary)' }}>You must finalize Round 1 (Apply Cutoff) before you can start Round 2.</p>
        </div>
      ) : (!isActive && !isCompleted) ? (
        <div className="glass-card" style={{ maxWidth: '400px' }}>
          <h3>Initial Setup</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Configure R2 attendance and start the test.</p>
          <button className="btn btn-primary" onClick={() => navigate('/admin/r2/attendance')}>Set-Up R2 Config</button>
        </div>
      ) : (
        <div className="glass-card" style={{ maxWidth: '400px', borderColor: 'var(--accent-green)' }}>
          <h3 style={{ color: 'var(--accent-green)' }}>R2_Result (Live Table) ✓</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            {isCompleted ? 'Round 2 has been completed and cutoffs are applied.' : 'Round 2 Test is currently ACTIVE. Students are taking the test.'}
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-outline" onClick={() => navigate('/admin/r2/entry')}>View Results</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Round2Home;
