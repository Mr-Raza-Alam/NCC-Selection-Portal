import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const Round1Home = () => {
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

  const isCompleted = settings.r1Cutoff !== undefined && settings.r1Cutoff > 0;
  const isSetup = settings.r1SetupComplete;

  return (
    <div>
      <h2 style={{ marginBottom: '2rem' }}>Round 1: Physical Test</h2>
      
      {!isSetup ? (
        <div className="glass-card" style={{ maxWidth: '400px' }}>
          <h3>Initial Setup</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Configure activities and max marks before starting.</p>
          <button className="btn btn-primary" onClick={() => navigate('/admin/r1/setup')}>Set-Up R1 Config</button>
        </div>
      ) : !isCompleted ? (
        <div className="glass-card" style={{ maxWidth: '400px', borderColor: 'var(--warning-amber)' }}>
          <h3 style={{ color: 'var(--warning-amber)' }}>Round 1 Active</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>R1 Setup is complete. You can now enter scores and mark attendance.</p>
          <button className="btn btn-primary" onClick={() => navigate('/admin/r1/entry')}>Go to Entry Table</button>
        </div>
      ) : (
        <div className="glass-card" style={{ maxWidth: '400px', borderColor: 'var(--accent-green)' }}>
          <h3 style={{ color: 'var(--accent-green)' }}>R1_Result ✓</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Round 1 has been completed and cutoffs are applied.</p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-outline" onClick={() => navigate('/admin/r1/entry')}>View Results</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Round1Home;
