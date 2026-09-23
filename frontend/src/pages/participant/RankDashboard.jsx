import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import BroadcastBanner from '../../components/BroadcastBanner';
import Loader from '../../components/Loader';

const RankDashboard = () => {
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  const [timeRemaining, setTimeRemaining] = useState(null);
  const [testStatus, setTestStatus] = useState('unknown');

  useEffect(() => {
    // Need a new route in participantRoutes or rankAuthRoutes to get rank profile
    // Or just a specific rank profile route. Let's assume we create GET /api/rank-auth/profile
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/rank-auth/profile');
        setProfile(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile?.testWindowStart && profile?.testWindowEnd) {
      const updateTimer = () => {
        const now = new Date();
        const start = new Date(profile.testWindowStart);
        const end = new Date(profile.testWindowEnd);

        if (now < start) {
          setTestStatus('before');
          const diff = start - now;
          const hours = Math.floor(diff / 3600000);
          const mins = Math.floor((diff % 3600000) / 60000);
          const secs = Math.floor((diff % 60000) / 1000);
          if (hours > 24) {
             setTimeRemaining(`${Math.floor(hours/24)} days left`);
          } else if (hours > 0) {
             setTimeRemaining(`${hours}h ${mins}m`);
          } else {
             setTimeRemaining(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
          }
        } else if (now >= start && now <= end) {
          setTestStatus('open');
        } else {
          setTestStatus('closed');
        }
      };
      
      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    } else if (profile) {
      setTestStatus('open');
    }
  }, [profile]);

  if (!profile) return <Loader />;

  const isSelected = ['promoted_cpl', 'promoted_lcpl'].includes(profile.status);

  return (
    <div className="container" style={{ textAlign: 'center' }}>
      <BroadcastBanner pageType="dashboard" />
      <h2>Welcome, {profile.name}</h2>
      
      {isSelected && (
        <div style={{ background: '#FFD700', color: 'black', padding: '1.5rem', borderRadius: '8px', marginTop: '2rem', marginBottom: '1rem', boxShadow: '0 4px 15px rgba(255,215,0,0.4)' }}>
          <h2 style={{ margin: 0, marginBottom: '0.5rem' }}>🌟 CONGRATULATIONS! 🌟</h2>
          <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.2rem' }}>
            You have been {profile.status === 'promoted_cpl' ? 'Promoted to Corporal (CPL)!' : 'Promoted to Lance Corporal (LCPL)!'}
          </p>
        </div>
      )}

      {profile.status === 'cadet' && profile.r3Completed && (
        <div style={{ background: 'var(--surface-grey)', color: 'var(--text-primary)', padding: '1.5rem', borderRadius: '8px', marginTop: '2rem', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0, marginBottom: '0.5rem' }}>Rank Selection Concluded</h2>
          <p style={{ margin: 0 }}>Your current rank remains: <strong>Cadet</strong>.</p>
        </div>
      )}

      {profile.status === 'absent' && (
        <div style={{ background: 'var(--danger-red)', color: 'white', padding: '1.5rem', borderRadius: '8px', marginTop: '2rem', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0, marginBottom: '0.5rem' }}>Selection Concluded</h2>
          <p style={{ margin: 0 }}>You were Absent. Your current rank remains: <strong>Cadet</strong>.</p>
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'center', marginTop: isSelected ? '1rem' : '2rem' }}>
        
        {/* Buddy Code Card */}
        <div className="glass-card" style={{ flex: '1 1 250px', padding: '2rem', border: isSelected ? '2px solid #FFD700' : 'none', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h1 style={{ fontSize: '4rem', color: '#87CEEB', margin: 0 }}>{profile.buddyNo}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Your Buddy Number</p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.25rem' }}>Remember this during Physical Test</p>
        </div>

        {/* My Details Card */}
        <div className="glass-card" style={{ flex: '1 1 250px', padding: '2rem', textAlign: 'left' }}>
          <h3 style={{ marginTop: 0, color: '#87CEEB', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>My Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
            <div><strong style={{ color: 'var(--text-secondary)' }}>Name</strong><br/>{profile.name}</div>
            <div><strong style={{ color: 'var(--text-secondary)' }}>Department</strong><br/>{profile.department}</div>
            <div><strong style={{ color: 'var(--text-secondary)' }}>Semester</strong><br/>{profile.semester}</div>
            <div><strong style={{ color: 'var(--text-secondary)' }}>Regimental No</strong><br/>{profile.regimentalNo}</div>
            <div><strong style={{ color: 'var(--text-secondary)' }}>Email</strong><br/>{profile.email}</div>
            <div><strong style={{ color: 'var(--text-secondary)' }}>Mobile No</strong><br/>{profile.mobileNo}</div>
          </div>
        </div>

      </div>

      <div style={{ marginTop: '3rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
        
        {/* Round 1 Indicator */}
        <div className="glass-card" style={{ width: '100%', maxWidth: '400px', opacity: (profile.status === 'absent' && !profile.r2Completed) ? 0.5 : 1 }}>
          <h3>Round 1 (Physical Test)</h3>
          {profile.status === 'active' && <p>Test in progress...</p>}
          {(['r1_qualified', 'r2_qualified', 'r3_qualified', 'promoted_cpl', 'promoted_lcpl', 'cadet'].includes(profile.status)) && (
            <p style={{ color: 'var(--accent-green)', fontWeight: 'bold' }}>R1-Qualified ✓ (Score: {profile.r1Score ?? '-'})</p>
          )}
          {profile.status === 'absent' && !profile.r2Completed && <p style={{ color: 'var(--danger-red)' }}>Absent in R1</p>}
        </div>

        {/* Down Arrow */}
        <div style={{ fontSize: '2.5rem', color: '#87CEEB', fontWeight: 'bold', margin: '0.5rem 0' }}>↓</div>

        {/* Round 2 Indicator */}
        <div className="glass-card" style={{ width: '100%', maxWidth: '400px', opacity: (profile.status === 'absent' && profile.r2Completed && !profile.r3Completed) ? 0.5 : 1 }}>
          <h3>Round 2 (Written Test)</h3>
          {profile.status === 'active' && <p>Waiting for R1 Results...</p>}
          
          {profile.status === 'r1_qualified' && !profile.r2Completed && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
              {testStatus === 'before' && (
                <div style={{ padding: '1rem 2rem', background: 'var(--surface-grey)', borderRadius: '8px', border: '1px solid var(--border-color)', animation: 'pulse 2s infinite' }}>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Written Test opens in:</p>
                  <h2 style={{ margin: 0, color: 'var(--primary-navy)', fontFamily: 'monospace', fontSize: '2.5rem' }}>{timeRemaining}</h2>
                </div>
              )}
              {testStatus === 'open' && (
                <button className="btn btn-primary" style={{ width: '100%', fontSize: '1.2rem', padding: '1rem', animation: 'fadeIn 1s ease-in' }} onClick={() => navigate('/rank-test-instructions')}>
                  Start R2 Written Test
                </button>
              )}
              {testStatus === 'closed' && (
                <p style={{ color: 'var(--danger-red)', fontWeight: 'bold' }}>Test Window is Closed</p>
              )}
            </div>
          )}
          
          {profile.status === 'r1_qualified' && profile.r2Completed && (
            <p style={{ color: 'var(--accent-green)', fontWeight: 'bold' }}>Test Submitted! Waiting for results...</p>
          )}

          {(['r2_qualified', 'r3_qualified', 'promoted_cpl', 'promoted_lcpl', 'cadet'].includes(profile.status)) && (
            <p style={{ color: 'var(--accent-green)', fontWeight: 'bold' }}>R2-Qualified ✓ (Score: {profile.r2Score ?? '-'})</p>
          )}
          
          {profile.status === 'absent' && profile.r2Completed && !profile.r3Completed && <p style={{ color: 'var(--danger-red)' }}>Absent in R2</p>}
        </div>

        {/* Down Arrow */}
        <div style={{ fontSize: '2.5rem', color: '#87CEEB', fontWeight: 'bold', margin: '0.5rem 0' }}>↓</div>

        {/* Round 3 Indicator */}
        <div className="glass-card" style={{ width: '100%', maxWidth: '400px', opacity: (profile.status === 'absent' && profile.r3Completed) ? 0.5 : 1 }}>
          <h3>Round 3 (Interview)</h3>
          {['active', 'r1_qualified'].includes(profile.status) && <p>Waiting for R2 Results...</p>}
          
          {profile.status === 'r2_qualified' && (
            <p style={{ color: 'var(--accent-green)', fontWeight: 'bold' }}>Start-R3 (Proceed to Interview Desk)</p>
          )}
          
          {['r3_qualified', 'promoted_cpl', 'promoted_lcpl', 'cadet'].includes(profile.status) && (
            <div>
              <p style={{ color: 'var(--accent-green)', fontWeight: 'bold' }}>R3-Completed ✓ (Score: {profile.r3Score ?? '-'})</p>
              {profile.status === 'r3_qualified' && (
                <p style={{ color: 'var(--warning-amber)', fontWeight: 'bold', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  Waiting for CTO Sir's Final Rank Declaration.
                </p>
              )}
            </div>
          )}
          
          {profile.status === 'absent' && profile.r3Completed && <p style={{ color: 'var(--danger-red)' }}>Absent in R3</p>}
        </div>

      </div>
    </div>
  );
};

export default RankDashboard;
