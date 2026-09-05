import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const Test = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!sessionStorage.getItem('agreedToInstructions')) {
      navigate('/test-instructions');
      return;
    }

    const initTest = async () => {
      try {
        const { data: qData } = await api.get('/test/questions');
        setQuestions(qData);
        
        const { data: timeData } = await api.post('/test/start');
        const endTime = new Date(timeData.endTime).getTime();
        
        timerRef.current = setInterval(() => {
          const now = new Date().getTime();
          const distance = endTime - now;
          
          if (distance < 0) {
            clearInterval(timerRef.current);
            submitTest();
          } else {
            setTimeLeft(Math.floor(distance / 1000));
          }
        }, 1000);
        
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Error loading test');
        setLoading(false);
      }
    };
    initTest();

    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    // Auto-save every 30 seconds if there are answers
    const autoSave = setInterval(() => {
      if (Object.keys(answers).length > 0) {
        api.post('/test/save', { answers: Object.values(answers) }).catch(console.error);
      }
    }, 30000);
    return () => clearInterval(autoSave);
  }, [answers]);

  const handleOptionChange = (qId, optionIndex) => {
    setAnswers({ ...answers, [qId]: optionIndex });
  };

  const submitTest = async () => {
    try {
      await api.post('/test/submit', { answersMap: answers });
      toast.success('Test submitted successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Error submitting test');
    }
  };

  const formatTime = (seconds) => {
    if (seconds === null) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) return <div className="container">Loading test...</div>;
  if (error) return <div className="container"><h2 style={{color: 'var(--danger-red)'}}>{error}</h2></div>;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Round 2: Written Test</h2>
        <div className="glass-card" style={{ padding: '1rem', color: 'var(--danger-red)', fontSize: '1.5rem', fontWeight: 'bold' }}>
          Time Left: {formatTime(timeLeft)}
        </div>
      </div>

      <div className="grid">
        {questions.map((q, i) => (
          <div key={q._id} className="glass-card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>{i + 1}. {q.questionText}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {q.options.map((opt, optIdx) => (
                <label key={optIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name={`q_${q._id}`} 
                    value={optIdx}
                    checked={answers[q._id] === optIdx}
                    onChange={() => handleOptionChange(q._id, optIdx)}
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <button className="btn btn-primary" onClick={submitTest} style={{ padding: '1rem 3rem', fontSize: '1.2rem' }}>
          Submit Test
        </button>
      </div>
    </div>
  );
};

export default Test;
