import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TestInstructions = () => {
  const [agreed, setAgreed] = useState(false);
  const navigate = useNavigate();

  const instructions = [
    "This is an online test. Ensure you have a stable internet connection before starting.",
    "All questions are compulsory. Each question carries 1 mark. There is no negative marking.",
    "Read each question carefully and select the most appropriate option (A, B, C, or D).",
    "You can navigate between questions using the Next/Previous buttons.",
    "Do NOT refresh the page or close the browser window during the test — your progress will be lost.",
    "The test will auto-submit when the 30-minute timer ends. Click Submit only when you are done.",
    "The timer is displayed at the top of your screen. Manage your time wisely."
  ];

  const handleStart = () => {
    if (agreed) {
      sessionStorage.setItem('agreedToInstructions', 'true');
      navigate('/test');
    }
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="glass-card" style={{ maxWidth: '700px', width: '100%', padding: '2rem' }}>
        <h2 style={{ textAlign: 'center', color: 'var(--primary-navy)', marginBottom: '1.5rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '1rem' }}>
          Test Instructions
        </h2>
        
        <div style={{ background: 'var(--bg-white)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '2rem' }}>
          <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
            {instructions.map((inst, idx) => (
              <li key={idx} style={{ marginBottom: '0.5rem' }}>{inst}</li>
            ))}
          </ul>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', padding: '1rem', background: 'var(--surface-grey)', borderRadius: '8px' }}>
          <input 
            type="checkbox" 
            id="agreeCheck" 
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            style={{ width: '1.2rem', height: '1.2rem', cursor: 'pointer' }}
          />
          <label htmlFor="agreeCheck" style={{ cursor: 'pointer', fontWeight: '500', color: 'var(--text-primary)' }}>
            I have read and understood the instructions.
          </label>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
            Cancel
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleStart}
            disabled={!agreed}
            style={{ opacity: agreed ? 1 : 0.5, cursor: agreed ? 'pointer' : 'not-allowed' }}
          >
            Proceed to Test
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestInstructions;
