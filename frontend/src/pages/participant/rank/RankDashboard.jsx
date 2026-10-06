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
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const [r2Data, setR2Data] = useState(null);
  const [detailedResult, setDetailedResult] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);

  useEffect(() => {
    const fetchProfileAndStatus = async () => {
      try {
        const [profileRes, statusRes] = await Promise.all([
          api.get('/rank-auth/profile'),
          api.get('/rank-test/status')
        ]);
        setProfile(profileRes.data);
        setR2Data(statusRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfileAndStatus();

    const interval = setInterval(async () => {
      try {
        const { data } = await api.get('/rank-test/status');
        setR2Data(data);
      } catch(err){}
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleViewResult = async () => {
    try {
      const res = await api.get('/rank-test/result');
      setDetailedResult(res.data);
      setShowResultModal(true);
    } catch (err) {
      console.error(err);
    }
  };

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
      
      {isSelected && !bannerDismissed && (
        <div style={{ background: '#FFD700', color: 'black', padding: '1.5rem', borderRadius: '8px', marginTop: '2rem', marginBottom: '1rem', boxShadow: '0 4px 15px rgba(255,215,0,0.4)', position: 'relative' }}>
          <button onClick={() => setBannerDismissed(true)} style={{ position: 'absolute', top: '0.5rem', right: '0.75rem', background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'rgba(0,0,0,0.5)', lineHeight: 1 }} title="Dismiss">✕</button>
          <h2 style={{ margin: 0, marginBottom: '0.5rem' }}>🌟 CONGRATULATIONS! 🌟</h2>
          <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.2rem' }}>
            You have been {profile.status === 'promoted_cpl' ? 'Promoted to Corporal (CPL)!' : 'Promoted to Lance Corporal (LCPL)!'}
          </p>
        </div>
      )}

      {profile.status === 'cadet' && profile.r3Completed && !bannerDismissed && (
        <div style={{ background: 'var(--surface-grey)', color: 'var(--text-primary)', padding: '1.5rem', borderRadius: '8px', marginTop: '2rem', marginBottom: '1rem', position: 'relative' }}>
          <button onClick={() => setBannerDismissed(true)} style={{ position: 'absolute', top: '0.5rem', right: '0.75rem', background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-secondary)', lineHeight: 1 }} title="Dismiss">✕</button>
          <h2 style={{ margin: 0, marginBottom: '0.5rem' }}>Rank Selection Concluded</h2>
          <p style={{ margin: 0 }}>Your current rank remains: <strong>Cadet</strong>.</p>
        </div>
      )}

      {profile.status === 'absent' && !bannerDismissed && (
        <div style={{ background: 'var(--danger-red)', color: 'white', padding: '1.5rem', borderRadius: '8px', marginTop: '2rem', marginBottom: '1rem', position: 'relative' }}>
          <button onClick={() => setBannerDismissed(true)} style={{ position: 'absolute', top: '0.5rem', right: '0.75rem', background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'rgba(255,255,255,0.7)', lineHeight: 1 }} title="Dismiss">✕</button>
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

          <div style={{ marginTop: '2rem', display: 'flex', flexWrap: 'wrap', gap: '3rem', justifyContent: 'center', alignItems: 'flex-start' }}>
            
            {/* ZONE A: PROMOTION TRACK */}
            <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
              <h2 style={{ color: 'var(--primary-navy)', borderBottom: '2px solid #87CEEB', paddingBottom: '0.5rem' }}>🎖️ Promotion Tracker</h2>
              
              <div className="glass-card" style={{ width: '100%', maxWidth: '400px', opacity: (profile.status === 'absent' && !profile.r3Completed) ? 0.5 : 1 }}>
                <h3>Round 1 (Physical Test)</h3>
                {profile.status === 'cadet' && !profile.r1Completed && <p>Test in progress...</p>}
                {(['r_r1_qualified', 'r_r3_qualified', 'promoted_cpl', 'promoted_lcpl'].includes(profile.status)) && (
                  <p style={{ color: 'var(--accent-green)', fontWeight: 'bold' }}>Physical Test Qualified ✓ (Score: {profile.r1Score ?? '-'})</p>
                )}
                {profile.status === 'cadet' && profile.r1Completed && profile.r1Score !== null && (
                  <p style={{ color: 'var(--warning-amber)', fontWeight: 'bold' }}>Physical Test Concluded (Score: {profile.r1Score ?? '-'})</p>
                )}
                {profile.status === 'absent' && !profile.r3Completed && <p style={{ color: 'var(--danger-red)' }}>Absent in R1</p>}
              </div>

              <div style={{ fontSize: '2.5rem', color: '#87CEEB', fontWeight: 'bold', margin: '0.25rem 0' }}>↓</div>

              <div className="glass-card" style={{ width: '100%', maxWidth: '400px', opacity: (profile.status === 'absent' && profile.r3Completed) ? 0.5 : 1 }}>
                <h3>Round 3 (Interview)</h3>
                {profile.status === 'cadet' && !profile.r1Completed && <p>Waiting for R1 Results...</p>}
                
                {profile.status === 'r_r1_qualified' && (
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

            {/* ZONE B: KNOWLEDGE HUB (Standalone Written Test) */}
            <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
              <h2 style={{ color: 'var(--primary-navy)', borderBottom: '2px dashed var(--accent-green)', paddingBottom: '0.5rem' }}>📚 Knowledge Hub</h2>
              
              <div className="glass-card" style={{ width: '100%', maxWidth: '400px', border: '1px solid var(--accent-green)' }}>
                <h3>Regular Written Assessment</h3>
                
                {r2Data && !r2Data.result?.completed && !r2Data.settings?.r_r2_active && !r2Data.settings?.r_r2_result && (
                  <div style={{ padding: '1rem 2rem', background: 'var(--surface-grey)', borderRadius: '8px', border: '1px solid var(--border-color)', width: '100%', marginTop: '1rem' }}>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>📅 Scheduled Test Date:</p>
                    <h3 style={{ margin: '0.5rem 0', color: 'var(--primary-navy)' }}>
                      {r2Data.settings?.r_r2_testDate ? new Date(r2Data.settings.r_r2_testDate).toLocaleDateString() : 'TBA'}
                    </h3>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      Time: {r2Data.settings?.r_r2_testTime || 'TBA'}
                    </p>
                    <p style={{ margin: '1rem 0 0 0', color: 'var(--warning-amber)', fontSize: '0.85rem', fontWeight: 'bold' }}>
                      ⏳ Please wait here. The "Start Test" button will appear automatically when the admin activates the test.
                    </p>
                  </div>
                )}
                
                {r2Data && !r2Data.result?.completed && r2Data.settings?.r_r2_active && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                    <button className="btn btn-primary" style={{ width: '100%', fontSize: '1.2rem', padding: '1rem', animation: 'fadeIn 1s ease-in' }} onClick={() => navigate('/participant/rank/test')}>
                      Start Written Assessment
                    </button>
                  </div>
                )}

                {r2Data && r2Data.result?.completed && !r2Data.settings?.r_r2_result && (
                  <div style={{ marginTop: '1rem' }}>
                    <p style={{ color: 'var(--accent-green)', fontWeight: 'bold', fontSize: '1.1rem' }}>Test Submitted ✓</p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Waiting for admin to finalize the round to view your results.</p>
                  </div>
                )}
                
                {r2Data && r2Data.result?.completed && r2Data.settings?.r_r2_result && (
                  <div style={{ marginTop: '1rem' }}>
                    <p style={{ color: 'var(--accent-green)', fontWeight: 'bold', fontSize: '1.1rem' }}>Assessment Finalized ✓</p>
                    <button className="btn btn-outline" style={{ borderColor: 'var(--accent-green)', color: 'var(--accent-green)', borderWidth: '2px', width: '100%', marginTop: '1rem' }} onClick={handleViewResult}>
                      View Detailed Result
                    </button>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '1rem' }}>* This score is for continuous learning and does not affect Rank Promotion merit.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PROFILE TAB — Digital ID Card */}
      {activeTab === 'profile' && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '420px', padding: '0', overflow: 'hidden', border: isSelected ? '2px solid #FFD700' : '2px solid #87CEEB', display: 'flex', flexDirection: 'column', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}>
            {/* Card Header with Rank Badge */}
            <div style={{ background: isSelected ? 'linear-gradient(135deg, #FFD700, #FFA500)' : 'linear-gradient(135deg, #87CEEB, #4682B4)', color: isSelected ? 'black' : 'white', padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: 0, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8 }}>NCC Digital Identity</p>
                <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '1.1rem' }}>3 Assam Battalion, NCC</h3>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.25)', borderRadius: '8px', padding: '0.4rem 0.75rem', fontWeight: 'bold', fontSize: '0.8rem', backdropFilter: 'blur(4px)' }}>
                {profile.status === 'promoted_cpl' ? '⭐ CPL' : profile.status === 'promoted_lcpl' ? '⭐ LCPL' : '🎖️ CDT'}
              </div>
            </div>
            
            {/* Card Body */}
            <div style={{ padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'var(--bg-white)' }}>
              {/* Big Buddy Number */}
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: isSelected ? 'linear-gradient(135deg, #FFD700, #FFA500)' : 'linear-gradient(135deg, #87CEEB, #4682B4)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', boxShadow: '0 4px 15px rgba(0,0,0,0.15)' }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: isSelected ? 'black' : 'white' }}>{profile.buddyNo}</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>Buddy No.</p>
              
              {/* Rank Title */}
              <h2 style={{ margin: '1rem 0 0.25rem 0', color: 'var(--primary-navy)', fontSize: '1.4rem' }}>
                {profile.status === 'promoted_cpl' ? 'Cpl.' : profile.status === 'promoted_lcpl' ? 'LCpl.' : 'Cdt.'} {profile.name}
              </h2>
              
              {/* Details Grid */}
              <div style={{ width: '100%', marginTop: '1.25rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
                  <div>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Regimental No.</p>
                    <p style={{ margin: '0.2rem 0 0 0', fontWeight: '600', color: 'var(--text-primary)' }}>{profile.regimentalNo}</p>
                  </div>
                  <div>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Current Rank</p>
                    <p style={{ margin: '0.2rem 0 0 0', fontWeight: '700', color: isSelected ? '#B8860B' : 'var(--accent-green)' }}>
                      {profile.status === 'promoted_cpl' ? 'Corporal (CPL)' : profile.status === 'promoted_lcpl' ? 'Lance Corporal (LCPL)' : 'Cadet'}
                    </p>
                  </div>
                  <div>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Department</p>
                    <p style={{ margin: '0.2rem 0 0 0', fontWeight: '600', color: 'var(--text-primary)' }}>{profile.department}</p>
                  </div>
                  <div>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Semester</p>
                    <p style={{ margin: '0.2rem 0 0 0', fontWeight: '600', color: 'var(--text-primary)' }}>{profile.semester || '-'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Card Footer */}
            <div style={{ background: 'var(--surface-grey)', padding: '0.75rem 1.5rem', fontSize: '0.7rem', color: 'var(--text-secondary)', textAlign: 'center', borderTop: '1px solid var(--border-color)' }}>
              Assam University Silchar • Session 2026-2027
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

      {/* DETAILED RESULT MODAL */}
      {showResultModal && detailedResult && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem'
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '900px', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ color: 'var(--primary-navy)' }}>Your Knowledge Score: {detailedResult.totalScore}</h3>
              <button className="btn btn-outline" onClick={() => setShowResultModal(false)}>Close</button>
            </div>
            
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Q.No</th>
                    <th>Question</th>
                    <th>Your Answer</th>
                    <th>Correct Answer</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {detailedResult.cadetAnswers.map((ans, idx) => (
                    <tr key={idx} style={{ backgroundColor: ans.isCorrect ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)' }}>
                      <td>{idx + 1}</td>
                      <td>{ans.questionText}</td>
                      <td>{ans.markedAnswer}</td>
                      <td style={{ fontWeight: 'bold' }}>{ans.correctAnswer}</td>
                      <td style={{ fontSize: '1.5rem', textAlign: 'center' }}>
                        {ans.isCorrect ? '✅' : '❌'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* DETAILED RESULT MODAL */}
      {showResultModal && detailedResult && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem'
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '900px', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ color: 'var(--primary-navy)' }}>Your Knowledge Score: {detailedResult.totalScore}</h3>
              <button className="btn btn-outline" onClick={() => setShowResultModal(false)}>Close</button>
            </div>
            
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Q.No</th>
                    <th>Question</th>
                    <th>Your Answer</th>
                    <th>Correct Answer</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {detailedResult.cadetAnswers.map((ans, idx) => (
                    <tr key={idx} style={{ backgroundColor: ans.isCorrect ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)' }}>
                      <td>{idx + 1}</td>
                      <td>{ans.questionText}</td>
                      <td>{ans.markedAnswer}</td>
                      <td style={{ fontWeight: 'bold' }}>{ans.correctAnswer}</td>
                      <td style={{ fontSize: '1.5rem', textAlign: 'center' }}>
                        {ans.isCorrect ? '✅' : '❌'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default RankDashboard;
