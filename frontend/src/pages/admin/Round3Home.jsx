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

  // We can assume R3 is completed if a specific flag is set, or if we rely on a manual check.
  // For now, let's assume if there are no more active R3 students, or we use a flag.
  // We'll just rely on a theoretical `settings.r3Completed` flag or we'll add a 'Finish R3' route later.
  // Since we have '/admin/r3/done', let's assume it updates the Master table. We'll show Set-Up R3 for now.
  const isCompleted = settings.r3Completed === true; // We might need to add this to Settings model

  return (
    <div>
      <h2 style={{ marginBottom: '2rem' }}>Round 3: Interview</h2>
      
      {!isCompleted ? (
        <div className="glass-card" style={{ maxWidth: '400px' }}>
          <h3>Initial Setup</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Configure R3 attendance and enter interview scores.</p>
          <button className="btn btn-primary" onClick={() => navigate('/admin/r3/entry')}>Set-Up R3 Config</button>
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
