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

  return (
    <div>
      <h2 style={{ marginBottom: '2rem' }}>Round 1: Physical Test</h2>
      
      {!isCompleted ? (
        <div className="glass-card" style={{ maxWidth: '400px' }}>
          <h3>Initial Setup</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Configure activities and max marks before starting.</p>
          <button className="btn btn-primary" onClick={() => navigate('/admin/r1/setup')}>Set-Up R1 Config</button>
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
