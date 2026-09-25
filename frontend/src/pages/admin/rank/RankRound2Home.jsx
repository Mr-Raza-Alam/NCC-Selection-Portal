import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../utils/api';
import Loader from '../../../components/Loader';

const RankRound2Home = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);

  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/rank-admin/settings');
      setSettings(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartR2 = async () => {
    try {
      await api.post('/rank-admin/r2/start');
      toast.success('Written Test Entry Activated');
      fetchSettings();
      setShowConfirm(false);
      navigate('/admin/rank/r2/entry');
    } catch (err) {
      toast.error('Failed to start Written Test');
    }
  };

  if (!settings) return <Loader />;

  const r2_entry = settings.r_r2_entry;
  const r2_result = settings.r_r2_result;
  const r1_result = settings.r_r1_result;

  return (
    <div>
      <h2 style={{ marginBottom: '2rem' }}>Written Test (Rank Selection)</h2>
      
      {!r1_result ? (
        <div className="glass-card" style={{ maxWidth: '400px', borderColor: 'var(--danger-red)' }}>
          <h3 style={{ color: 'var(--danger-red)' }}>Physical Test Incomplete</h3>
          <p style={{ color: 'var(--text-secondary)' }}>You must finalize the Physical Test before you can start the Written Test phase.</p>
        </div>
      ) : (!r2_entry && !r2_result) ? (
        <div className="glass-card" style={{ maxWidth: '400px' }}>
          <h3>Initial Setup</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Configure R2 attendance and activate the Written Test entry table.</p>
          <button className="btn btn-primary" onClick={() => setShowConfirm(true)}>Activate Written Test</button>
        </div>
      ) : (
        <div className="glass-card" style={{ maxWidth: '400px', borderColor: 'var(--accent-green)' }}>
          <h3 style={{ color: 'var(--accent-green)' }}>Written Test Active ✓</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            {r2_result ? 'Written Test has been completed and cutoffs are applied.' : 'Written Test is currently ACTIVE.'}
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-outline" onClick={() => navigate('/admin/rank/r2/entry')}>View Table</button>
          </div>
        </div>
      )}

      {showConfirm && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="glass-card" style={{ width: '90%', maxWidth: '400px', padding: '2rem' }}>
            <h3 style={{ color: 'var(--primary-navy)', marginBottom: '1rem' }}>Confirm</h3>
            <p style={{ marginBottom: '2rem' }}>Has the Physical Test been completely finalized and finished on ground?</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setShowConfirm(false)}>No, Cancel</button>
              <button className="btn btn-primary" onClick={handleStartR2}>Yes, Start Written Test Phase</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RankRound2Home;
