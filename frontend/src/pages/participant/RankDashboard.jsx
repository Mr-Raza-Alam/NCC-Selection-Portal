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
        
        {/* Cadet Profile Card */}
        <div className="glass-card" style={{ flex: '1 1 300px', padding: '0', overflow: 'hidden', border: isSelected ? '2px solid #FFD700' : '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ background: isSelected ? '#FFD700' : '#87CEEB', color: isSelected ? 'black' : 'var(--primary-navy)', padding: '1rem', fontWeight: 'bold' }}>
            <h3 style={{ margin: 0 }}>Cadet Profile</h3>
          </div>
          <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h1 style={{ fontSize: '4rem', color: isSelected ? '#FFD700' : '#87CEEB', margin: 0, textShadow: isSelected ? '0 2px 10px rgba(255,215,0,0.3)' : 'none' }}>
              {profile.buddyNo}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontWeight: 'bold' }}>Buddy No.</p>
            
            <div style={{ width: '100%', marginTop: '1.5rem', textAlign: 'left', fontSize: '0.9rem' }}>
              <p style={{ margin: '0.5rem 0' }}><strong style={{ color: 'var(--text-secondary)' }}>Name:</strong> {profile.name}</p>
              <p style={{ margin: '0.5rem 0' }}><strong style={{ color: 'var(--text-secondary)' }}>Regimental No:</strong> {profile.regimentalNo}</p>
              <p style={{ margin: '0.5rem 0' }}><strong style={{ color: 'var(--text-secondary)' }}>Current Rank:</strong> <span style={{ fontWeight: 'bold', color: 'var(--accent-green)' }}>{profile.status === 'promoted_cpl' ? 'Corporal (CPL)' : profile.status === 'promoted_lcpl' ? 'Lance Corporal (LCPL)' : 'Cadet'}</span></p>
              <p style={{ margin: '0.5rem 0' }}><strong style={{ color: 'var(--text-secondary)' }}>Department:</strong> {profile.department}</p>
            </div>
          </div>
        </div>

        {/* Dynamic Instructions & Syllabus */}
        <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'left', borderLeft: '4px solid #87CEEB' }}>
            <h3 style={{ marginTop: 0, color: 'var(--primary-navy)' }}>Rank Syllabus & Instructions</h3>
            {profile.status === 'active' && (
              <p style={{ color: 'var(--text-primary)' }}>Welcome to the Rank Selection process. Your first step is the Physical Test. Bring your full uniform and report to the ground.</p>
            )}
            {profile.status === 'r_r1_qualified' && !profile.r2Completed && (
              <p style={{ color: 'var(--text-primary)' }}>You have cleared the Physical Test. Next up is the Written Test.</p>
            )}
            {['cadet', 'absent'].includes(profile.status) && (
              <p style={{ color: 'var(--danger-red)' }}>You did not qualify for promotion this year. Keep your spirits high and prepare for the next opportunity!</p>
            )}
            
            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '1rem 0' }} />
            <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)' }}>Written Test Topics (R2)</h4>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
              <li>Drill & Weapon Training</li>
              <li>Map Reading & Field Craft</li>
              <li>NCC Organization & History</li>
              <li>National Integration & Awareness</li>
            </ul>
          </div>
        </div>

      </div>

      {/* Complete Profile Card */}
      {(!profile.parentContactNo || !profile.dob) && profile.status !== 'eliminated' && profile.status !== 'absent' && (
        <div className="glass-card" style={{ maxWidth: '600px', margin: '2rem auto', padding: '2rem', border: '2px solid var(--warning-amber)' }}>
          <h3 style={{ color: 'var(--warning-amber)', marginTop: 0 }}>⚠️ Complete Your Profile</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Please provide your Date of Birth and Parent's Contact Number.</p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexDirection: 'column' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
               <label style={{ width: '120px', textAlign: 'right', fontWeight: 'bold' }}>Date of Birth:</label>
               <input 
                 type="date" 
                 id="dobInput"
                 defaultValue={profile.dob ? new Date(profile.dob).toISOString().split('T')[0] : ''}
                 style={{ flex: 1, padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}
               />
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
               <label style={{ width: '120px', textAlign: 'right', fontWeight: 'bold' }}>Parent Contact:</label>
               <input 
                 type="tel" 
                 id="parentContactInput"
                 placeholder="+91 xxxxxxxxxx" 
                 defaultValue={profile.parentContactNo || ''}
                 style={{ flex: 1, padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}
               />
            </div>
            <button className="btn btn-primary" style={{ alignSelf: 'flex-end', padding: '0.75rem 2rem' }} onClick={async () => {
              const dobVal = document.getElementById('dobInput').value;
              const contactVal = document.getElementById('parentContactInput').value;
              if (!dobVal || !contactVal) return alert('Both fields are required');
              try {
                const { data } = await api.post('/rank-auth/complete-profile', { parentContactNo: contactVal, dob: dobVal });
                setProfile({...profile, parentContactNo: data.parentContactNo, dob: data.dob});
              } catch (err) {
                alert(err.response?.data?.message || 'Error updating profile');
              }
            }}>Save Details</button>
          </div>
        </div>
      )}

      <div style={{ marginTop: '3rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
        
        {/* Round 1 Indicator */}
        <div className="glass-card" style={{ width: '100%', maxWidth: '400px', opacity: (profile.status === 'absent' && !profile.r2Completed) ? 0.5 : 1 }}>
          <h3>Round 1 (Physical Test)</h3>
          {profile.status === 'active' && <p>Test in progress...</p>}
          {(['r_r1_qualified', 'r_r2_qualified', 'r_r3_qualified', 'promoted_cpl', 'promoted_lcpl'].includes(profile.status)) && (
            <p style={{ color: 'var(--accent-green)', fontWeight: 'bold' }}>Physical Test Qualified ✓ (Score: {profile.r1Score ?? '-'})</p>
          )}
          {profile.status === 'cadet' && profile.r1Completed && profile.r1Score !== null && (
            <p style={{ color: 'var(--warning-amber)', fontWeight: 'bold' }}>Physical Test Concluded (Score: {profile.r1Score ?? '-'})</p>
          )}
          {profile.status === 'absent' && !profile.r2Completed && <p style={{ color: 'var(--danger-red)' }}>Absent in R1</p>}
        </div>

        {/* Down Arrow */}
        <div style={{ fontSize: '2.5rem', color: '#87CEEB', fontWeight: 'bold', margin: '0.5rem 0' }}>↓</div>

        {/* Round 2 Indicator */}
        <div className="glass-card" style={{ width: '100%', maxWidth: '400px', opacity: (profile.status === 'absent' && profile.r2Completed && !profile.r3Completed) ? 0.5 : 1 }}>
          <h3>Round 2 (Written Test)</h3>
          {profile.status === 'active' && <p>Waiting for R1 Results...</p>}
          
          {profile.status === 'r_r1_qualified' && !profile.r2Completed && (
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
          
          {profile.status === 'r_r1_qualified' && profile.r2Completed && (
            <p style={{ color: 'var(--accent-green)', fontWeight: 'bold' }}>Test Submitted! Waiting for results...</p>
          )}

          {(['r_r2_qualified', 'r_r3_qualified', 'promoted_cpl', 'promoted_lcpl'].includes(profile.status)) && (
            <p style={{ color: 'var(--accent-green)', fontWeight: 'bold' }}>Written Test Qualified ✓ (Score: {profile.r2Score ?? '-'})</p>
          )}
          {profile.status === 'cadet' && profile.r2Completed && profile.r2Score !== null && (
            <p style={{ color: 'var(--warning-amber)', fontWeight: 'bold' }}>Written Test Concluded (Score: {profile.r2Score ?? '-'})</p>
          )}
          
          {profile.status === 'absent' && profile.r2Completed && !profile.r3Completed && <p style={{ color: 'var(--danger-red)' }}>Absent in R2</p>}
        </div>

        {/* Down Arrow */}
        <div style={{ fontSize: '2.5rem', color: '#87CEEB', fontWeight: 'bold', margin: '0.5rem 0' }}>↓</div>

        {/* Round 3 Indicator */}
        <div className="glass-card" style={{ width: '100%', maxWidth: '400px', opacity: (profile.status === 'absent' && profile.r3Completed) ? 0.5 : 1 }}>
          <h3>Round 3 (Interview)</h3>
          {['active', 'r_r1_qualified'].includes(profile.status) && <p>Waiting for R2 Results...</p>}
          
          {profile.status === 'r_r2_qualified' && (
            <p style={{ color: 'var(--accent-green)', fontWeight: 'bold' }}>Start-R3 (Proceed to Interview Desk)</p>
          )}
          
          {['r_r3_qualified', 'promoted_cpl', 'promoted_lcpl'].includes(profile.status) && (
            <div>
              <p style={{ color: 'var(--accent-green)', fontWeight: 'bold' }}>Interview Completed ✓ (Score: {profile.r3Score ?? '-'})</p>
              {profile.status === 'r_r3_qualified' && (
                <p style={{ color: 'var(--warning-amber)', fontWeight: 'bold', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  Waiting for CTO Sir's Final Rank Declaration.
                </p>
              )}
            </div>
          )}
          {profile.status === 'cadet' && profile.r3Completed && profile.r3Score !== null && (
            <div>
              <p style={{ color: 'var(--warning-amber)', fontWeight: 'bold' }}>Interview Completed (Score: {profile.r3Score ?? '-'})</p>
            </div>
          )}
          
          {profile.status === 'absent' && profile.r3Completed && <p style={{ color: 'var(--danger-red)' }}>Absent in R3</p>}
        </div>

      </div>
    </div>
  );
};

export default RankDashboard;
