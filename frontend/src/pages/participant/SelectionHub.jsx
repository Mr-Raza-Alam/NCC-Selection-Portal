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
        className="hub-hero-section" 
        style={{ backgroundImage: `url(${nccHero})` }}
      >
        <div className="hub-overlay"></div>
        <div className="hub-content">
          <h1>Welcome to the Selection Hub</h1>
          <p className="hub-subtitle">
            Please select your appropriate portal below to proceed with your registration and tests.
          </p>
          
          <div className="hub-cards-container">
            
            {/* New Enrollment Card */}
            <div 
              className="hub-card-action enroll-theme"
              onClick={() => navigate('/register')}
            >
              <h2>🛡️ New Enrollment</h2>
              <p>For 1st-year students applying to join the National Cadet Corps (NCC).</p>
              <div className="action-text">
                Proceed <span className="arrow">→</span>
              </div>
            </div>

            {/* Rank Selection Card */}
            <div 
              className="hub-card-action rank-theme"
              onClick={() => navigate('/rank-register')}
            >
              <h2>🎖️ Rank Selection</h2>
              <p>For existing 2nd-year cadets participating in the rank promotion cycle.</p>
              <div className="action-text">
                Proceed <span className="arrow">→</span>
              </div>
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
