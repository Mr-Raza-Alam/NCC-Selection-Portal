import React from 'react';
import { useNavigate } from 'react-router-dom';
import nccHero from '../../assets/ncc_pic13.jpeg';
import BroadcastBanner from '../../components/BroadcastBanner';

const SelectionHub = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <BroadcastBanner pageType="landing" />
      
      <div 
        className="hero-section" 
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url(${nccHero})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          textAlign: 'center',
          padding: '2rem'
        }}
      >
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', fontWeight: 'bold', textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
          Welcome to the Selection Hub
        </h1>
        <p style={{ maxWidth: '600px', fontSize: '1.2rem', marginBottom: '3rem', opacity: 0.95, textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
          Please select your appropriate portal below to proceed with your registration and tests.
        </p>
        
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          
          {/* New Enrollment Card */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '12px',
            padding: '2rem',
            width: '300px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            transition: 'transform 0.3s ease'
          }}
          className="hub-card"
          >
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--secondary-gold)' }}>🛡️ New Enrollment</h2>
            <p style={{ fontSize: '1rem', opacity: 0.9, marginBottom: '2rem' }}>
              For 1st-year students applying to join the National Cadet Corps (NCC).
            </p>
            <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
              <button 
                className="btn btn-primary" 
                style={{ flex: 1, fontSize: '1.1rem' }}
                onClick={() => navigate('/register')}
              >
                Register
              </button>
              <button 
                className="btn" 
                style={{ flex: 1, fontSize: '1.1rem', backgroundColor: 'transparent', border: '1px solid var(--secondary-gold)', color: 'var(--secondary-gold)' }}
                onClick={() => navigate('/login')}
              >
                Login
              </button>
            </div>
          </div>

          {/* Rank Selection Card */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '12px',
            padding: '2rem',
            width: '300px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            transition: 'transform 0.3s ease'
          }}
          className="hub-card"
          >
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#87CEEB' }}>🎖️ Rank Selection</h2>
            <p style={{ fontSize: '1rem', opacity: 0.9, marginBottom: '2rem' }}>
              For existing 2nd-year cadets participating in the rank promotion cycle.
            </p>
            <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
              <button 
                className="btn" 
                style={{ 
                  flex: 1, 
                  fontSize: '1.1rem',
                  backgroundColor: '#87CEEB',
                  color: 'var(--primary-navy)',
                  border: 'none',
                  fontWeight: 'bold'
                }}
                onClick={() => navigate('/rank-register')}
              >
                Register
              </button>
              <button 
                className="btn" 
                style={{ 
                  flex: 1, 
                  fontSize: '1.1rem',
                  backgroundColor: 'transparent',
                  color: '#87CEEB',
                  border: '1px solid #87CEEB',
                  fontWeight: 'bold'
                }}
                onClick={() => navigate('/rank-login')}
              >
                Login
              </button>
            </div>
          </div>

        </div>
      </div>
      
      {/* Footer */}
      <footer style={{ backgroundColor: 'var(--bg-white)', borderTop: '3px solid var(--secondary-gold)', padding: '2rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--primary-navy)', margin: 0, fontWeight: '500' }}>
          ✉️ Email: raza.alam@aus.ac.in
        </p>
      </footer>
    </div>
  );
};

export default SelectionHub;
