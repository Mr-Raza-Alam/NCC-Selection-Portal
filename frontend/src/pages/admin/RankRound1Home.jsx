import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import Loader from '../../components/Loader';

const RankRound1Home = () => {
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

  if (!settings) return <Loader />;

  const r1_entry = settings.r_r1_entry;
  const r1_result = settings.r_r1_result;

  return (
    <div>
      <h2 style={{ marginBottom: '2rem' }}>Physical Test (Rank Selection)</h2>
      
      {!r1_entry && !r1_result ? (
        <div className="glass-card" style={{ maxWidth: '400px' }}>
          <h3>Initial Setup</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Configure activities and max marks before starting.</p>
          <button className="btn btn-primary" onClick={() => navigate('/admin/rank/r1/setup')}>Set-Up R1 Config</button>
        </div>
      ) : r1_entry && !r1_result ? (
        <div className="glass-card" style={{ maxWidth: '400px', borderColor: 'var(--warning-amber)' }}>
          <h3 style={{ color: 'var(--warning-amber)' }}>Physical Test Active</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Physical Test has started. You can now enter scores and mark attendance.</p>
          <button className="btn btn-primary" onClick={() => navigate('/admin/rank/r1/entry')}>Go to Entry Table</button>
        </div>
      ) : (
        <div className="glass-card" style={{ maxWidth: '400px', borderColor: 'var(--accent-green)' }}>
          <h3 style={{ color: 'var(--accent-green)' }}>Physical Test Completed ✓</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Physical Test has been completed and cutoffs are applied.</p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-outline" onClick={() => navigate('/admin/rank/r1/entry')}>View Results</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RankRound1Home;
