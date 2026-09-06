import React from 'react';
import { useNavigate } from 'react-router-dom';

// Hero Image
import nccHero from '../../assets/ncc_pic13.jpeg';

// Glimpse Images (9 total)
import pic1 from '../../assets/ncc_pic1.jpeg';
import pic2 from '../../assets/ncc_pic2.jpeg';
import pic3 from '../../assets/ncc_pic3.jpeg';
import pic4 from '../../assets/ncc_pic4.jpeg';
import pic9 from '../../assets/ncc_pic9.jpeg';
import pic11 from '../../assets/ncc_pic11.jpeg';
import pic10 from '../../assets/ncc_pic10.jpeg';
import pic7 from '../../assets/ncc_pic7.jpeg';
import pic12 from '../../assets/ncc_pic12.jpeg';

const LandingPage = () => {
  const navigate = useNavigate();

  // Create the 3x3 matrix as requested
  const glimpses = [
    pic1, pic2, pic3,
    pic4, pic9, pic11,
    pic10, pic7, pic12
  ];

  return (
    <div className="landing-container">
      {/* Hero Section */}
      <div 
        className="hero-section" 
        style={{
          // Lighter overlay so the image looks clean and bright
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.4)), url(${nccHero})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          textAlign: 'center',
          padding: '2rem'
        }}
      >
        <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem', fontWeight: 'bold', color: 'white', textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
          NCC Selection Process 2026-2027
        </h1>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem', fontWeight: 'bold', opacity: 0.95, color: 'white', textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
          Assam University Silchar
        </h2>
        <p style={{ maxWidth: '600px', fontSize: '1.1rem', marginBottom: '2.5rem', opacity: 0.95, color: 'white', textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
          Welcome to the official portal for the National Cadet Corps (NCC) recruitment drive. 
          Please log in to proceed with your application, instructions, and the written test.
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '300px' }}>
          <button 
            className="btn btn-primary" 
            style={{ fontSize: '1.2rem', padding: '1rem' }}
            onClick={() => navigate('/login')}
          >
            Student Login
          </button>
          
          <button 
            className="btn" 
            style={{ 
              backgroundColor: 'transparent', 
              border: '2px solid rgba(255,255,255,0.7)', 
              color: 'white',
              fontSize: '1rem',
              padding: '0.8rem',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
            onClick={() => navigate('/admin/login')}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            Admin Login
          </button>
        </div>
      </div>

      {/* Thumbnails Section (3x3 Matrix) */}
      <div style={{ padding: '4rem 2rem', backgroundColor: 'var(--surface-grey)' }}>
        <h3 style={{ textAlign: 'center', marginBottom: '3rem', color: 'var(--primary-navy)', fontSize: '2rem' }}>
          Glimpses of NCC Assam University
        </h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '1.5rem', 
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {glimpses.map((img, idx) => (
            <img 
              key={idx}
              src={img} 
              alt={`NCC Activity ${idx + 1}`}
              style={{
                width: '100%',
                height: '250px',
                objectFit: 'cover',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                border: '1px solid var(--border-color)',
                transition: 'transform 0.3s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            />
          ))}
        </div>
      </div>

      {/* Footer / Contact (Matches Navbar look) */}
      <footer style={{ 
        backgroundColor: 'var(--bg-white)', 
        borderTop: '3px solid var(--secondary-gold)', 
        padding: '2rem', 
        textAlign: 'center',
        boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.05)'
      }}>
        <h4 style={{ color: 'var(--primary-navy)', fontSize: '1.25rem', marginBottom: '1rem', textTransform: 'uppercase' }}>
          Support & Emergency Contact
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-secondary)' }}>
          <p style={{ margin: 0, fontWeight: '500' }}>
            📞 Phone: +91 7004891854
          </p>
          <p style={{ margin: 0, fontWeight: '500' }}>
            ✉️ Email: alam.raza23.27@gmail.com
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
