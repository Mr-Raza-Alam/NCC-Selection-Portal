import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../utils/api';
import toast from 'react-hot-toast';
import Loader from '../../../components/Loader';

const RankLiveTest = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [settings, setSettings] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  const timerRef = useRef(null);

  useEffect(() => {
    fetchTestStatus();
  }, []);

  const fetchTestStatus = async () => {
    try {
      const { data } = await api.get('/rank-test/status');
      setSettings(data.settings);
      if (!data.settings.r_r2_active || data.result?.completed) {
        toast.error('Test is not active or you have already completed it.');
        navigate('/participant/rank/dashboard');
        return;
      }

      // Check if test was already started (Resuming state)
      if (data.result?.testStartTime) {
        const startTime = new Date(data.result.testStartTime).getTime();
        const durationMs = (data.settings.r_r2_testDuration || 30) * 60 * 1000;
        const elapsedMs = Date.now() - startTime;
        const remainingSecs = Math.max(0, Math.floor((durationMs - elapsedMs) / 1000));
        
        if (remainingSecs > 0) {
          toast.success('Resuming your active test...');
          setTimeLeft(remainingSecs);
          if (data.result.draftAnswers) {
            setAnswers(data.result.draftAnswers);
          }
          await fetchQuestionsAndStart();
        } else {
          // Time is already up
          toast.error('Your time has already expired. Auto-submitting...');
          const finalAnswers = data.result.draftAnswers || {};
          setAnswers(finalAnswers);
          await submitExam(finalAnswers);
        }
      } else {
        setLoading(false);
      }
    } catch (err) {
      toast.error('Error fetching test status');
      navigate('/participant/rank/dashboard');
    }
  };

  const fetchQuestionsAndStart = async () => {
    try {
      const qRes = await api.get('/rank-test/questions');
      setQuestions(qRes.data);
      setTestStarted(true);
      setLoading(false);
    } catch (err) {
      toast.error('Failed to load questions.');
      setLoading(false);
    }
  };

  const handleStartTest = async () => {
    if (!agreed) {
      toast.error('You must agree to the instructions first.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/rank-test/start');
      const durationInSeconds = (settings?.r_r2_testDuration || 30) * 60;
      setTimeLeft(durationInSeconds);
      await fetchQuestionsAndStart();
    } catch (err) {
      toast.error('Failed to start test.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (testStarted && timeLeft !== null) {
      if (timeLeft <= 0) {
        handleAutoSubmit();
        return;
      }
      timerRef.current = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timerRef.current);
    }
  }, [testStarted, timeLeft]);

  const handleAutoSubmit = async () => {
    toast.error('Time is up! Auto-submitting...');
    await submitExam(answers);
  };

  const handleManualSubmit = async () => {
    if (window.confirm('Are you sure you want to submit? You cannot change answers after this.')) {
      await submitExam(answers);
    }
  };

  const submitExam = async (currentAnswers) => {
    setLoading(true);
    clearTimeout(timerRef.current);
    
    const formattedAnswers = Object.keys(currentAnswers).map(qId => ({
      questionId: qId,
      selectedOption: currentAnswers[qId]
    }));

    try {
      await api.post('/rank-test/submit', { answers: formattedAnswers });
      toast.success('Exam submitted successfully!');
      navigate('/participant/rank/dashboard');
    } catch (err) {
      toast.error('Error submitting exam.');
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, optIdx) => {
    const newAnswers = { ...answers, [questionId]: optIdx };
    setAnswers(newAnswers);
    // Fire and forget auto-save to server
    api.post('/rank-test/save-draft', { questionId, selectedOption: optIdx }).catch(e => console.error("Draft save failed"));
  };

  if (loading) return <Loader />;

  // --- INSTRUCTION SCREEN ---
  if (!testStarted) {
    return (
      <div className="container" style={{ marginTop: '2rem' }}>
        <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
          <h2 style={{ color: 'var(--primary-navy)', textAlign: 'center', marginBottom: '1.5rem', borderBottom: '2px dashed var(--border-color)', paddingBottom: '1rem' }}>
            📝 Knowledge Hub Assessment Instructions
          </h2>
          
          <div style={{ background: 'var(--surface-grey)', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
            <ul style={{ lineHeight: '1.8', color: 'var(--text-secondary)' }}>
              <li><strong>Objective:</strong> This test is for assessing your knowledge. It does <strong>NOT</strong> impact your promotion merit.</li>
              <li><strong>Duration:</strong> You will have <strong>{settings?.r_r2_testDuration || 30} minutes</strong> to complete the exam.</li>
              <li><strong>Auto-Save (Resumable):</strong> Your progress is automatically saved to the server. If your device dies or loses connection, you can log back in and resume where you left off!</li>
              <li><strong>Submission:</strong> The test will automatically submit when the global timer reaches zero.</li>
            </ul>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', padding: '1rem', border: '1px solid var(--accent-blue)', borderRadius: '8px', background: 'rgba(33, 150, 243, 0.05)' }}>
            <input 
              type="checkbox" 
              id="agreeCheck" 
              checked={agreed} 
              onChange={(e) => setAgreed(e.target.checked)} 
              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
            />
            <label htmlFor="agreeCheck" style={{ cursor: 'pointer', fontWeight: 'bold', color: 'var(--primary-navy)' }}>
              I have read and understood all the instructions.
            </label>
          </div>

          <button 
            className="btn btn-primary" 
            style={{ width: '100%', fontSize: '1.2rem', padding: '1rem', backgroundColor: agreed ? 'var(--accent-green)' : 'var(--border-color)' }} 
            disabled={!agreed}
            onClick={handleStartTest}
          >
            Start Assessment
          </button>
        </div>
      </div>
    );
  }

  // --- LIVE EXAM SCREEN ---
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ paddingBottom: '4rem', userSelect: 'none' }} onContextMenu={(e) => e.preventDefault()}>
      {/* Sticky Timer Bar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100, backgroundColor: 'var(--primary-navy)', color: 'var(--bg-white)',
        padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        boxShadow: '0 4px 15px rgba(0,0,0,0.2)', marginBottom: '2rem'
      }}>
        <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Knowledge Hub Assessment</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ 
            fontSize: '1.5rem', fontWeight: 'bold', fontFamily: 'monospace', 
            backgroundColor: timeLeft <= 300 ? 'var(--danger-red)' : 'var(--bg-white)', 
            color: timeLeft <= 300 ? 'var(--bg-white)' : 'var(--primary-navy)',
            padding: '0.25rem 1rem', borderRadius: '4px' 
          }}>
            ⏱ {formatTime(timeLeft)}
          </div>
          <button className="btn btn-primary" style={{ backgroundColor: 'var(--accent-green)', color: 'white', border: 'none' }} onClick={handleManualSubmit}>
            Submit Test
          </button>
        </div>
      </div>

      <div className="container" style={{ maxWidth: '800px' }}>
        <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,165,0,0.1)', color: 'var(--warning-amber)', borderRadius: '8px', border: '1px solid var(--warning-amber)', textAlign: 'center', fontSize: '0.9rem' }}>
          <strong>🔒 Security Active:</strong> Copying, pasting, and right-clicking are disabled. Your answers are auto-saving every time you select an option.
        </div>

        {questions.map((q, idx) => (
          <div key={q._id} className="glass-card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
            <h4 style={{ marginBottom: '1rem', color: 'var(--primary-navy)', lineHeight: '1.5' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Q{idx + 1}.</span> {q.questionText}
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {q.options.map((opt, optIdx) => (
                <label key={optIdx} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px',
                  cursor: 'pointer', transition: 'all 0.2s',
                  backgroundColor: answers[q._id] === optIdx ? 'rgba(76, 175, 80, 0.1)' : 'var(--bg-white)',
                  borderColor: answers[q._id] === optIdx ? 'var(--accent-green)' : 'var(--border-color)'
                }}>
                  <input 
                    type="radio" 
                    name={`question_${q._id}`} 
                    value={optIdx}
                    checked={answers[q._id] === optIdx}
                    onChange={() => handleAnswerChange(q._id, optIdx)}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <span style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{opt}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
        
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.2rem' }} onClick={handleManualSubmit}>
            Submit Assessment
          </button>
        </div>
      </div>
    </div>
  );
};

export default RankLiveTest;
