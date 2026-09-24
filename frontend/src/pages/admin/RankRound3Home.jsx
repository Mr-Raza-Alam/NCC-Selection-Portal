import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import Loader from '../../components/Loader';

const RankRound3Home = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/admin/rank/settings');
      setSettings(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartR3 = async () => {
    setIsProcessing(true);
    try {
      await api.post('/admin/rank/r3/start');
      fetchSettings();
      setShowConfirm(false);
      navigate('/admin/rank/r3/entry');
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!settings) return <Loader />;

  const r3_entry = settings.r_r3_entry;
  const r3_result = settings.r_r3_result;
  const r2_result = settings.r_r2_result;

  return (
    <div>
      {isProcessing && <Loader overlay message="Starting Interview..." />}
      <h2 style={{ marginBottom: '2rem' }}>Interview (Rank Selection)</h2>
      
      {!r2_result ? (
        <div className="glass-card" style={{ maxWidth: '400px', borderColor: 'var(--danger-red)' }}>
          <h3 style={{ color: 'var(--danger-red)' }}>Written Test Incomplete</h3>
          <p style={{ color: 'var(--text-secondary)' }}>You must finalize the Written Test before you can start the Interview phase.</p>
        </div>
      ) : (!r3_entry && !r3_result) ? (
        <div className="glass-card" style={{ maxWidth: '400px' }}>
          <h3>Initial Setup</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Activate the Interview entry table.</p>
          <button className="btn btn-primary" onClick={() => setShowConfirm(true)}>Activate Interview</button>
        </div>
      ) : r3_entry && !r3_result ? (
        <div className="glass-card" style={{ maxWidth: '400px', borderColor: 'var(--warning-amber)' }}>
          <h3 style={{ color: 'var(--warning-amber)' }}>Interview Active</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Interview phase is active. You can now enter scores.</p>
          <button className="btn btn-primary" onClick={() => navigate('/admin/rank/r3/entry')}>Go to Interview Desk</button>
        </div>
      ) : (
        <div className="glass-card" style={{ maxWidth: '400px', borderColor: 'var(--accent-green)' }}>
          <h3 style={{ color: 'var(--accent-green)' }}>Interview Completed ✓</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Interview phase has been completed.</p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-outline" onClick={() => navigate('/admin/rank/r3/entry')}>View Results</button>
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
            <p style={{ marginBottom: '2rem' }}>Has the Written Test been completely finalized?</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setShowConfirm(false)}>No, Cancel</button>
              <button className="btn btn-primary" onClick={handleStartR3}>Yes, Start Interview Phase</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RankRound3Home;
