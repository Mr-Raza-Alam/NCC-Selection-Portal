import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import BroadcastBanner from '../../components/BroadcastBanner';

const Dashboard = () => {
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  const [timeRemaining, setTimeRemaining] = useState(null);
  const [testStatus, setTestStatus] = useState('unknown');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/participants/profile');
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
      setTestStatus('open'); // Default if no window is set
    }
  }, [profile]);

  if (!profile) return <div className="container">Loading...</div>;

  return (
    <div className="container" style={{ textAlign: 'center' }}>
      <BroadcastBanner pageType="dashboard" />
      <h2>Welcome, {profile.name}</h2>
      
      {profile.status === 'selected' && (
        <div style={{ background: 'var(--accent-green)', color: 'black', padding: '1.5rem', borderRadius: '8px', marginTop: '2rem', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0, marginBottom: '0.5rem' }}>🎉 CONGRATULATIONS! YOU ARE SELECTED! 🎉</h2>
          <p style={{ margin: 0, fontWeight: 'bold' }}>Welcome to Assam University NCC, new batch (2026-2027)</p>
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'center', marginTop: profile.status === 'selected' ? '1rem' : '2rem' }}>
        
        {/* Code Card */}
        <div className="glass-card" style={{ flex: '1 1 250px', padding: '2rem', border: profile.status === 'selected' ? '2px solid var(--accent-green)' : 'none', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h1 style={{ fontSize: '4rem', color: 'var(--accent-green)', margin: 0 }}>{profile.code}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Your Chest Number</p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.25rem' }}>Remember this during Physical Test</p>
        </div>

        {/* My Details Card */}
        <div className="glass-card" style={{ flex: '1 1 250px', padding: '2rem', textAlign: 'left' }}>
          <h3 style={{ marginTop: 0, color: 'var(--primary-navy)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>My Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
            <div><strong style={{ color: 'var(--text-secondary)' }}>Name</strong><br/>{profile.name}</div>
            <div><strong style={{ color: 'var(--text-secondary)' }}>Department</strong><br/>{profile.department}</div>
            <div><strong style={{ color: 'var(--text-secondary)' }}>DOB</strong><br/>{profile.dob ? new Date(profile.dob).toLocaleDateString('en-GB') : 'N/A'}</div>
            <div><strong style={{ color: 'var(--text-secondary)' }}>Admission No</strong><br/>{profile.admissionNo}</div>
            <div><strong style={{ color: 'var(--text-secondary)' }}>Email</strong><br/>{profile.email}</div>
            <div><strong style={{ color: 'var(--text-secondary)' }}>Contact No</strong><br/>{profile.contactNo}</div>
          </div>
        </div>

      </div>

      {/* Complete Profile Card */}
      {profile.parentContactNo === '' && (
        <div className="glass-card" style={{ maxWidth: '600px', margin: '2rem auto', padding: '2rem', border: '2px solid var(--warning-amber)' }}>
          <h3 style={{ color: 'var(--warning-amber)', marginTop: 0 }}>⚠️ Complete Your Profile</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Please provide your parent's contact number to complete your profile.</p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <input 
              type="tel" 
              id="parentContactInput"
              placeholder="+91 xxxxxxxxxx" 
              style={{ flex: 1, padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}
            />
            <button className="btn btn-primary" onClick={async () => {
              const val = document.getElementById('parentContactInput').value;
              try {
                const { data } = await api.post('/participants/complete-profile', { parentContactNo: val });
                setProfile({...profile, parentContactNo: data.parentContactNo});
              } catch (err) {
                alert(err.response?.data?.message || 'Error updating profile');
              }
            }}>Save</button>
          </div>
        </div>
      )}

      <div style={{ marginTop: '3rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
        
        {/* Down Arrow from Code to Round 1 */}
        <div style={{ fontSize: '2.5rem', color: 'var(--accent-green)', fontWeight: 'bold', margin: '0.5rem 0' }}>
          ↓
        </div>

        {/* Round 1 Indicator */}
        <div className="glass-card" style={{ width: '100%', maxWidth: '400px', opacity: (profile.status === 'eliminated' && !profile.r2Completed) ? 0.5 : 1 }}>
          <h3>Round 1 (Physical Test)</h3>
          {profile.status === 'active' && <p>Test in progress...</p>}
          {(['r1_qualified', 'r2_qualified', 'r3_qualified', 'selected'].includes(profile.status)) && (
            <p style={{ color: 'var(--accent-green)', fontWeight: 'bold' }}>R1-Qualified ✓ (Score: {profile.r1Score ?? '-'})</p>
          )}
          {profile.status === 'eliminated' && !profile.r2Completed && <p style={{ color: 'red' }}>Eliminated in R1</p>}
          {profile.status === 'eliminated' && profile.r2Completed && <p style={{ color: 'var(--text-secondary)' }}>Cleared R1 ✓ (Score: {profile.r1Score ?? '-'})</p>}
        </div>

        {/* Down Arrow from Round 1 to Round 2 */}
        <div style={{ fontSize: '2.5rem', color: 'var(--accent-green)', fontWeight: 'bold', margin: '0.5rem 0' }}>
          ↓
        </div>

        {/* Round 2 Indicator */}
        <div className="glass-card" style={{ width: '100%', maxWidth: '400px', opacity: (profile.status === 'eliminated' && profile.r2Completed && !profile.r3Completed) ? 0.5 : 1 }}>
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
                <button className="btn btn-primary" style={{ width: '100%', fontSize: '1.2rem', padding: '1rem', animation: 'fadeIn 1s ease-in' }} onClick={() => navigate('/test-instructions')}>
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

          {(['r2_qualified', 'r3_qualified', 'selected'].includes(profile.status)) && (
            <p style={{ color: 'var(--accent-green)', fontWeight: 'bold' }}>R2-Qualified ✓ (Score: {profile.r2Score ?? '-'})</p>
          )}
          
          {profile.status === 'eliminated' && profile.r2Completed && !profile.r3Completed && <p style={{ color: 'red' }}>Eliminated in R2</p>}
          {profile.status === 'eliminated' && profile.r3Completed && <p style={{ color: 'var(--text-secondary)' }}>Cleared R2 ✓ (Score: {profile.r2Score ?? '-'})</p>}
        </div>

        {/* Down Arrow from Round 2 to Round 3 */}
        <div style={{ fontSize: '2.5rem', color: 'var(--accent-green)', fontWeight: 'bold', margin: '0.5rem 0' }}>
          ↓
        </div>

        {/* Round 3 Indicator */}
        <div className="glass-card" style={{ width: '100%', maxWidth: '400px', opacity: (profile.status === 'eliminated' && profile.r3Completed) ? 0.5 : 1 }}>
          <h3>Round 3 (Interview)</h3>
          {['active', 'r1_qualified'].includes(profile.status) && <p>Waiting for R2 Results...</p>}
          
          {profile.status === 'r2_qualified' && (
            <p style={{ color: 'var(--accent-green)', fontWeight: 'bold' }}>Start-R3 (Proceed to Interview Desk)</p>
          )}
          
          {['r3_qualified', 'selected'].includes(profile.status) && (
            <div>
              <p style={{ color: 'var(--accent-green)', fontWeight: 'bold' }}>R3-Qualified ✓ (Score: {profile.r3Score ?? '-'})</p>
              {profile.status === 'r3_qualified' && (
                <p style={{ color: 'var(--warning-amber)', fontWeight: 'bold', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  Waiting for CTO Sir's confirmation after document verification.
                </p>
              )}
            </div>
          )}
          
          {profile.status === 'eliminated' && profile.r3Completed && <p style={{ color: 'red' }}>Eliminated in R3</p>}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
