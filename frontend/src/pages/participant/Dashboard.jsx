import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const Dashboard = () => {
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Because of the schema change, we might need a custom profile route to grab the Student data. 
        // But assuming the route returns the student document:
        const { data } = await api.get('/participants/profile');
        setProfile(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, []);

  if (!profile) return <div className="container">Loading...</div>;

  return (
    <div className="container" style={{ textAlign: 'center' }}>
      <h2>Welcome, {profile.name}</h2>
      
      {profile.status === 'selected' && (
        <div style={{ background: 'var(--accent-green)', color: 'black', padding: '1.5rem', borderRadius: '8px', marginTop: '2rem', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0, marginBottom: '0.5rem' }}>🎉 CONGRATULATIONS! YOU ARE SELECTED! 🎉</h2>
          <p style={{ margin: 0, fontWeight: 'bold' }}>Welcome to Assam University NCC, new batch (2026-2027)</p>
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'center', marginTop: profile.status === 'selected' ? '1rem' : '2rem' }}>
        
        {/* Code Card */}
        <div className="glass-card" style={{ flex: '1 1 300px', padding: '2rem', border: profile.status === 'selected' ? '2px solid var(--accent-green)' : 'none', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h1 style={{ fontSize: '4rem', color: 'var(--accent-green)', margin: 0 }}>{profile.code}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Your 2-digit unique identifier for Round 1</p>
        </div>

        {/* My Details Card */}
        <div className="glass-card" style={{ flex: '1 1 300px', padding: '2rem', textAlign: 'left' }}>
          <h3 style={{ marginTop: 0, color: 'var(--primary-navy)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>My Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
            <div><strong style={{ color: 'var(--text-secondary)' }}>Name</strong><br/>{profile.name}</div>
            <div><strong style={{ color: 'var(--text-secondary)' }}>Department</strong><br/>{profile.department}</div>
            <div><strong style={{ color: 'var(--text-secondary)' }}>DOB</strong><br/>{profile.dob ? new Date(profile.dob).toLocaleDateString() : 'N/A'}</div>
            <div><strong style={{ color: 'var(--text-secondary)' }}>Admission No</strong><br/>{profile.admissionNo}</div>
            <div><strong style={{ color: 'var(--text-secondary)' }}>Email</strong><br/>{profile.email}</div>
            <div><strong style={{ color: 'var(--text-secondary)' }}>Contact No</strong><br/>{profile.contactNo}</div>
          </div>
        </div>

      </div>

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
            <button className="btn btn-primary" onClick={() => navigate('/test')}>Start R2</button>
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
            <p style={{ color: 'var(--accent-green)', fontWeight: 'bold' }}>R3-Qualified ✓ (Score: {profile.r3Score ?? '-'})</p>
          )}
          
          {profile.status === 'eliminated' && profile.r3Completed && <p style={{ color: 'red' }}>Eliminated in R3</p>}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
