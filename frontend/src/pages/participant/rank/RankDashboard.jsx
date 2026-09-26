import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../utils/api';
import Loader from '../../../components/Loader';

const RankDashboard = () => {
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  const [timeRemaining, setTimeRemaining] = useState(null);
  const [testStatus, setTestStatus] = useState('unknown');
  const [activeTab, setActiveTab] = useState('overview');
  const [showMenu, setShowMenu] = useState(false);

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
    <div className="container" style={{ position: 'relative', textAlign: 'center', paddingBottom: '3rem' }}>
      
      {/* Profile/Menu Icon Button */}
      <div style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 10 }}>
        <button 
          onClick={() => setShowMenu(!showMenu)} 
          style={{ 
            background: 'linear-gradient(135deg, var(--surface-grey), white)', 
            color: 'var(--primary-navy)', 
            border: '2px solid var(--secondary-gold)', 
            borderRadius: '50%', 
            width: '60px', 
            height: '60px', 
            fontSize: '1.8rem', 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)', 
            transition: 'all 0.3s ease' 
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
          }}
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

      <h2 style={{ marginTop: '2rem' }}>
        Welcome, {profile.status === 'promoted_cpl' ? 'Cpl.' : profile.status === 'promoted_lcpl' ? 'LCpl.' : 'Cdt.'} {profile.name}
      </h2>
      
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

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div>
          {(!profile.parentContactNo || !profile.dob) && profile.status !== 'eliminated' && profile.status !== 'absent' && (
            <div className="glass-card" style={{ maxWidth: '600px', margin: '2rem auto', padding: '2rem', border: '2px solid var(--warning-amber)' }}>
              <h3 style={{ color: 'var(--warning-amber)', marginTop: 0 }}>⚠️ Complete Your Profile</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Please provide your Date of Birth and Parent's Contact Number.</p>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexDirection: 'column' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
                   <label style={{ fontWeight: 'bold' }}>Date of Birth:</label>
                   <input 
                     type="date" 
                     id="dobInput"
                     defaultValue={profile.dob ? new Date(profile.dob).toISOString().split('T')[0] : ''}
                     style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'var(--bg-white)', color: 'var(--text-primary)' }}
                   />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left' }}>
                   <label style={{ fontWeight: 'bold' }}>Parent Contact:</label>
                   <input 
                     type="tel" 
                     id="parentContactInput"
                     placeholder="+91 xxxxxxxxxx" 
                     defaultValue={profile.parentContactNo || ''}
                     style={{ width: '100%', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '4px', background: 'var(--bg-white)', color: 'var(--text-primary)' }}
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

          <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
            
            <div className="glass-card" style={{ width: '100%', maxWidth: '400px', opacity: (profile.status === 'absent' && !profile.r2Completed) ? 0.5 : 1 }}>
              <h3>Round 1 (Physical Test)</h3>
              {profile.status === 'cadet' && !profile.r1Completed && <p>Test in progress...</p>}
              {(['r_r1_qualified', 'r_r2_qualified', 'r_r3_qualified', 'promoted_cpl', 'promoted_lcpl'].includes(profile.status)) && (
                <p style={{ color: 'var(--accent-green)', fontWeight: 'bold' }}>Physical Test Qualified ✓ (Score: {profile.r1Score ?? '-'})</p>
              )}
              {profile.status === 'cadet' && profile.r1Completed && profile.r1Score !== null && (
                <p style={{ color: 'var(--warning-amber)', fontWeight: 'bold' }}>Physical Test Concluded (Score: {profile.r1Score ?? '-'})</p>
              )}
              {profile.status === 'absent' && !profile.r2Completed && <p style={{ color: 'var(--danger-red)' }}>Absent in R1</p>}
            </div>

            <div style={{ fontSize: '2.5rem', color: '#87CEEB', fontWeight: 'bold', margin: '0.5rem 0' }}>↓</div>

            <div className="glass-card" style={{ width: '100%', maxWidth: '400px', opacity: (profile.status === 'absent' && profile.r2Completed && !profile.r3Completed) ? 0.5 : 1 }}>
              <h3>Round 2 (Written Test)</h3>
              {profile.status === 'cadet' && !profile.r1Completed && <p>Waiting for R1 Results...</p>}
              
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

            <div style={{ fontSize: '2.5rem', color: '#87CEEB', fontWeight: 'bold', margin: '0.5rem 0' }}>↓</div>

            <div className="glass-card" style={{ width: '100%', maxWidth: '400px', opacity: (profile.status === 'absent' && profile.r3Completed) ? 0.5 : 1 }}>
              <h3>Round 3 (Interview)</h3>
              {(['r_r1_qualified'].includes(profile.status) || (profile.status === 'cadet' && !profile.r1Completed)) && <p>Waiting for R2 Results...</p>}
              
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
      )}

      {/* PROFILE TAB */}
      {activeTab === 'profile' && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '400px', padding: '0', overflow: 'hidden', border: isSelected ? '2px solid #FFD700' : '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
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
        </div>
      )}

      {/* SYLLABUS TAB */}
      {activeTab === 'syllabus' && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '1.5rem', textAlign: 'left', borderLeft: '4px solid #87CEEB' }}>
            <h3 style={{ marginTop: 0, color: 'var(--primary-navy)' }}>Rank Syllabus & Instructions</h3>
            {profile.status === 'cadet' && !profile.r1Completed && (
              <p style={{ color: 'var(--text-primary)' }}>Welcome to the Rank Selection process. Your first step is the Physical Test. Bring your full uniform and report to the ground.</p>
            )}
            {profile.status === 'r_r1_qualified' && !profile.r2Completed && (
              <p style={{ color: 'var(--text-primary)' }}>You have cleared the Physical Test. Next up is the Written Test.</p>
            )}
            {(profile.status === 'absent' || (profile.status === 'cadet' && profile.r1Completed)) && (
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

export default RankDashboard;
