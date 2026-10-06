import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../utils/api';
import Loader from '../../../components/Loader';
import { toast } from 'react-hot-toast';

const RankRound2Home = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);
  
  // Test Settings States
  const [testDate, setTestDate] = useState('');
  const [testTime, setTestTime] = useState('');
  const [testDuration, setTestDuration] = useState(30);
  const [markPerQuestion, setMarkPerQuestion] = useState(1);

  // Question Management States
  const [questions, setQuestions] = useState([]);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  
  const appendFileRef = useRef(null);
  const replaceFileRef = useRef(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get('/rank-admin/test-settings');
      setSettings(res.data);
      if (res.data.r_r2_testDate) {
        setTestDate(new Date(res.data.r_r2_testDate).toISOString().split('T')[0]);
      }
      setTestTime(res.data.r_r2_testTime || '');
      setTestDuration(res.data.r_r2_testDuration || 30);
      setMarkPerQuestion(res.data.r_r2_markPerQuestion || 1);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load settings');
    }
  };

  const handleSaveSettings = async () => {
    try {
      await api.post('/rank-admin/test-settings', {
        r_r2_testDate: testDate,
        r_r2_testTime: testTime,
        r_r2_testDuration: testDuration,
        r_r2_markPerQuestion: markPerQuestion
      });
      toast.success('Test Settings Saved');
      fetchSettings();
    } catch (err) {
      toast.error('Failed to save settings');
    }
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const endpoint = type === 'append' ? '/rank-admin/questions/append' : '/rank-admin/questions/replace';
    
    try {
      const res = await api.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(res.data.message);
      e.target.value = null; // reset
    } catch (err) {
      toast.error('File upload failed');
    }
  };

  const fetchQuestions = async () => {
    try {
      const res = await api.get('/rank-admin/questions');
      setQuestions(res.data);
      setShowQuestionModal(true);
    } catch (err) {
      toast.error('Failed to fetch questions');
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await api.delete(`/rank-admin/questions/${id}`);
      setQuestions(questions.filter(q => q._id !== id));
      toast.success('Question deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  if (!settings) return <Loader />;

  return (
    <div>
      <h2 style={{ marginBottom: '2rem' }}>Regular Assessment: Test Management</h2>
      
      <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        
        {/* TEST SETTINGS CARD */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '1rem', color: 'var(--primary-navy)' }}>Test Settings</h3>
          
          <div className="input-group">
            <label>Test Date</label>
            <input type="date" value={testDate} onChange={(e) => setTestDate(e.target.value)} />
          </div>
          
          <div className="input-group">
            <label>Start Time</label>
            <input type="time" value={testTime} onChange={(e) => setTestTime(e.target.value)} />
          </div>
          
          <div className="input-group">
            <label>Duration (Minutes)</label>
            <input type="number" value={testDuration} onChange={(e) => setTestDuration(Number(e.target.value))} />
          </div>
          
          <div className="input-group">
            <label>Mark Per Question</label>
            <input type="number" value={markPerQuestion} onChange={(e) => setMarkPerQuestion(Number(e.target.value))} />
          </div>

          <button className="btn btn-primary" onClick={handleSaveSettings} style={{ width: '100%' }}>
            Save Settings
          </button>
        </div>

        {/* QUESTION BANK CARD */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '1rem', color: 'var(--primary-navy)' }}>Question Bank CRM</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Upload CSV files to manage test questions. Format: Question, Option1, Option2, Option3, Option4, CorrectAnswer(0-3).
          </p>

          <input type="file" ref={appendFileRef} style={{ display: 'none' }} accept=".csv" onChange={(e) => handleFileUpload(e, 'append')} />
          <input type="file" ref={replaceFileRef} style={{ display: 'none' }} accept=".csv" onChange={(e) => handleFileUpload(e, 'replace')} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <button className="btn btn-outline" style={{ borderColor: 'var(--accent-blue)', color: 'var(--accent-blue)' }} onClick={() => appendFileRef.current.click()}>
              Add Question (CSV)
            </button>
            <button className="btn btn-primary" onClick={() => replaceFileRef.current.click()}>
              Update Question (CSV)
            </button>
            <button className="btn btn-outline" onClick={fetchQuestions}>
              View Questions
            </button>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'center' }}>
        <button 
          className="btn btn-primary" 
          style={{ padding: '1rem 3rem', fontSize: '1.2rem', backgroundColor: 'var(--accent-green)' }}
          onClick={() => navigate('/admin/rank/r2/entry')}
        >
          Go to Entry Table ➔
        </button>
      </div>

      {/* VIEW QUESTIONS MODAL */}
      {showQuestionModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem'
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '1000px', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ color: 'var(--primary-navy)' }}>Question Bank ({questions.length})</h3>
              <button className="btn btn-outline" onClick={() => setShowQuestionModal(false)}>Close</button>
            </div>
            
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Q.No</th>
                    <th>Question Text</th>
                    <th>Options</th>
                    <th>Correct Answer</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((q, idx) => (
                    <tr key={q._id}>
                      <td>{idx + 1}</td>
                      <td>{q.questionText}</td>
                      <td style={{ fontSize: '0.85rem' }}>
                        1. {q.options[0]}<br/>
                        2. {q.options[1]}<br/>
                        3. {q.options[2]}<br/>
                        4. {q.options[3]}
                      </td>
                      <td><strong>Opt {q.correctAnswer + 1}</strong></td>
                      <td>
                        <button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }} onClick={() => handleDeleteQuestion(q._id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {questions.length === 0 && (
                    <tr><td colSpan="5" style={{ textAlign: 'center' }}>No questions found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RankRound2Home;
