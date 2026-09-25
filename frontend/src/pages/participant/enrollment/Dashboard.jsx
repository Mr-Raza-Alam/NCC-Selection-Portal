import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../utils/api';
import Loader from '../../../components/Loader';

const Dashboard = () => {
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  const [timeRemaining, setTimeRemaining] = useState(null);
  const [testStatus, setTestStatus] = useState('unknown');
  const [activeTab, setActiveTab] = useState('overview');
  const [showMenu, setShowMenu] = useState(false);

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

  if (!profile) return <Loader />;

  return (
    <div className="container" style={{ position: 'relative', textAlign: 'center', paddingBottom: '3rem' }}>
      
      {/* Profile/Menu Icon Button */}
      <div style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 10 }}>
        <button 
          onClick={() => setShowMenu(!showMenu)} 
          style={{ background: 'var(--primary-navy)', color: 'white', border: 'none', borderRadius: '50%', width: '45px', height: '45px', fontSize: '1.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.2)', transition: 'transform 0.2s' }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          title="Menu"
        >
          👤
        </button>
        
        {/* Dropdown Menu */}
        {showMenu && (
          <div style={{ position: 'absolute', top: '55px', right: '0', background: 'white', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', overflow: 'hidden', minWidth: '160px', textAlign: 'left', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
            <button style={{ padding: '0.75rem 1rem', background: activeTab==='overview'?'var(--surface-grey)':'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', color: 'var(--text-primary)', fontWeight: 'bold' }} onClick={() => { setActiveTab('overview'); setShowMenu(false); }}>🏠 Overview</button>
            <button style={{ padding: '0.75rem 1rem', background: activeTab==='profile'?'var(--surface-grey)':'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', color: 'var(--text-primary)', fontWeight: 'bold' }} onClick={() => { setActiveTab('profile'); setShowMenu(false); }}>👤 My Profile</button>
            <button style={{ padding: '0.75rem 1rem', background: activeTab==='syllabus'?'var(--surface-grey)':'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', color: 'var(--text-primary)', fontWeight: 'bold' }} onClick={() => { setActiveTab('syllabus'); setShowMenu(false); }}>📚 Syllabus</button>
            <button style={{ padding: '0.75rem 1rem', background: activeTab==='support'?'var(--surface-grey)':'transparent', border: 'none', textAlign: 'left', cursor: 'pointer', color: 'var(--text-primary)', fontWeight: 'bold' }} onClick={() => { setActiveTab('support'); setShowMenu(false); }}>⚙️ Support</button>
          </div>
        )}
      </div>

      <h2 style={{ marginTop: '2rem' }}>Welcome, {profile.name}</h2>
      
      {profile.status === 'selected' && (
        <div style={{ background: 'var(--accent-green)', color: 'black', padding: '1.5rem', borderRadius: '8px', marginTop: '2rem', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0, marginBottom: '0.5rem' }}>🎉 CONGRATULATIONS! YOU ARE SELECTED! 🎉</h2>
          <p style={{ margin: 0, fontWeight: 'bold' }}>Welcome to Assam University NCC, new batch (2026-2027)</p>
        </div>
      )}

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div>
          {profile.parentContactNo === '' && profile.status !== 'eliminated' && profile.status !== 'absent' && (
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
          
          <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '400px', opacity: (profile.status === 'eliminated' && !profile.r2Completed) ? 0.5 : 1 }}>
              <h3>Round 1 (Physical Test)</h3>
              {profile.status === 'active' && <p>Test in progress...</p>}
              {(['r1_qualified', 'r2_qualified', 'r3_qualified', 'selected'].includes(profile.status)) && (
                <p style={{ color: 'var(--accent-green)', fontWeight: 'bold' }}>R1-Qualified ✓ (Score: {profile.r1Score ?? '-'})</p>
              )}
              {profile.status === 'eliminated' && !profile.r2Completed && <p style={{ color: 'red' }}>Eliminated in R1</p>}
              {profile.status === 'eliminated' && profile.r2Completed && <p style={{ color: 'var(--text-secondary)' }}>Cleared R1 ✓ (Score: {profile.r1Score ?? '-'})</p>}
            </div>

            <div style={{ fontSize: '2.5rem', color: 'var(--accent-green)', fontWeight: 'bold', margin: '0.5rem 0' }}>↓</div>

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

            <div style={{ fontSize: '2.5rem', color: 'var(--accent-green)', fontWeight: 'bold', margin: '0.5rem 0' }}>↓</div>

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
      )}

      {/* PROFILE TAB */}
      {activeTab === 'profile' && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '400px', padding: '0', overflow: 'hidden', border: profile.status === 'selected' ? '2px solid var(--accent-green)' : '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ background: profile.status === 'selected' ? 'var(--accent-green)' : 'var(--primary-navy)', color: 'white', padding: '1rem' }}>
              <h3 style={{ margin: 0 }}>Digital ID Card</h3>
            </div>
            <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <h1 style={{ fontSize: '4rem', color: profile.status === 'selected' ? 'var(--accent-green)' : 'var(--primary-navy)', margin: 0 }}>{profile.code}</h1>
              <p style={{ color: 'var(--text-secondary)', fontWeight: 'bold' }}>Chest No.</p>
              <div style={{ width: '100%', marginTop: '1.5rem', textAlign: 'left', fontSize: '0.9rem' }}>
                <p style={{ margin: '0.5rem 0' }}><strong style={{ color: 'var(--text-secondary)' }}>Name:</strong> {profile.name}</p>
                <p style={{ margin: '0.5rem 0' }}><strong style={{ color: 'var(--text-secondary)' }}>Admission No:</strong> {profile.admissionNo}</p>
                <p style={{ margin: '0.5rem 0' }}><strong style={{ color: 'var(--text-secondary)' }}>Department:</strong> {profile.department}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SYLLABUS TAB */}
      {activeTab === 'syllabus' && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '1.5rem', textAlign: 'left', borderLeft: '4px solid var(--secondary-gold)' }}>
            <h3 style={{ marginTop: 0, color: 'var(--primary-navy)' }}>Next Steps & Instructions</h3>
            {profile.status === 'active' && (
              <p style={{ color: 'var(--text-primary)' }}>Welcome! Your next step is the Physical Test. Bring your ID card, wear sports attire, and report to the ground at the scheduled time.</p>
            )}
            {profile.status === 'r1_qualified' && !profile.r2Completed && (
              <p style={{ color: 'var(--text-primary)' }}>Congratulations on clearing the Physical Test! Prepare for the Written Test. Ensure you have a stable internet connection if taking it online, or bring a black pen if offline.</p>
            )}
            {profile.status === 'r2_qualified' && (
              <p style={{ color: 'var(--text-primary)' }}>Great job! You are qualified for the Interview round. Please wait at the designated holding area until your Chest No. is called.</p>
            )}
            {profile.status === 'r3_qualified' && (
              <p style={{ color: 'var(--text-primary)' }}>Interview completed! Please proceed to Document Verification and present your original documents (HS marksheet, A-Cert, etc.) to the verification desk.</p>
            )}
            {profile.status === 'selected' && (
              <p style={{ color: 'var(--accent-green)', fontWeight: 'bold' }}>All steps completed. You are officially selected!</p>
            )}
            {profile.status === 'eliminated' && (
              <p style={{ color: 'var(--danger-red)' }}>Unfortunately, you did not meet the cutoff for the current round. Thank you for your participation, and we encourage you to try again next year.</p>
            )}
            {profile.status === 'absent' && (
              <p style={{ color: 'var(--danger-red)' }}>You were marked absent. You are disqualified from this year's enrollment.</p>
            )}
          </div>
        </div>
      )}

      {/* SUPPORT TAB */}
      {activeTab === 'support' && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '1.5rem', textAlign: 'left' }}>
            <h3 style={{ marginTop: 0, color: 'var(--primary-navy)' }}>Help & Support</h3>
            <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0' }}>For any technical issues or queries, contact the admin desk.</p>
            <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0' }}>Email: <a href="mailto:support@ncc.example.com">support@ncc.example.com</a></p>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
