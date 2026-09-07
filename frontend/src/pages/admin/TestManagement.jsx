import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const SECTIONS = [
  "Current Affairs",
  "NCC Foundation",
  "General Aptitude & General Studies",
  "Reasoning"
];

const TestManagement = () => {
  const [config, setConfig] = useState({ timerMinutes: 30, windowStart: '', windowEnd: '', resultsVisibility: false });
  const [overview, setOverview] = useState({ r2Active: false, totalStudents: 0, attemptedStudents: 0 });
  
  const [questions, setQuestions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    fetchConfig();
    fetchQuestions();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await api.get('/admin/test-config');
      const fetchedConfig = res.data.config;
      setConfig({
        ...fetchedConfig,
        windowStart: fetchedConfig.windowStart ? new Date(fetchedConfig.windowStart).toISOString().slice(0, 16) : '',
        windowEnd: fetchedConfig.windowEnd ? new Date(fetchedConfig.windowEnd).toISOString().slice(0, 16) : ''
      });
      setOverview(res.data.overview);
    } catch (err) {
      toast.error('Failed to load test config');
    }
  };

  const fetchQuestions = async () => {
    try {
      const res = await api.get('/admin/questions');
      setQuestions(res.data);
    } catch (err) {
      toast.error('Failed to load questions');
    }
  };

  const handleSaveConfig = async () => {
    try {
      await api.post('/admin/test-config', config);
      toast.success('Test Configuration Saved');
      fetchConfig();
    } catch (err) {
      toast.error('Failed to save configuration');
    }
  };

  const handleClearWindow = async () => {
    const updated = { ...config, windowStart: '', windowEnd: '' };
    setConfig(updated);
    try {
      await api.post('/admin/test-config', updated);
      toast.success('Test Window Cleared');
      fetchConfig();
    } catch (err) {
      toast.error('Failed to clear window');
    }
  };

  const startEdit = (q) => {
    setEditingId(q._id);
    setEditForm({ ...q });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async (id) => {
    try {
      await api.put(`/admin/questions/${id}`, editForm);
      toast.success('Question updated');
      setEditingId(null);
      fetchQuestions();
    } catch (err) {
      toast.error('Failed to update question');
    }
  };

  const deleteQuestion = async (id) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      await api.delete(`/admin/questions/${id}`);
      toast.success('Question deleted');
      fetchQuestions();
    } catch (err) {
      toast.error('Failed to delete question');
    }
  };

  const addQuestion = async (section) => {
    const newQ = {
      questionNumber: questions.length + 1,
      section,
      questionText: 'New Question',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 0
    };
    try {
      await api.post('/admin/questions', newQ);
      toast.success('Question added');
      fetchQuestions();
    } catch (err) {
      toast.error('Failed to add question');
    }
  };

  const handleResetOriginal = async () => {
    if (!window.confirm("WARNING: This will discard all edits and reset to the originally uploaded JSON. Are you sure?")) return;
    try {
      const res = await api.post('/admin/questions/reset');
      toast.success(`Reset complete. ${res.data.count} questions loaded.`);
      fetchQuestions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset questions');
    }
  };

  // Group questions by section
  const groupedQuestions = SECTIONS.map(sec => ({
    section: sec,
    items: questions.filter(q => q.section === sec)
  }));

  const now = new Date();
  const start = config.windowStart ? new Date(config.windowStart) : null;
  const end = config.windowEnd ? new Date(config.windowEnd) : null;
  let windowStatus = 'Not set';
  if (start && end) {
    if (now < start) windowStatus = 'Not yet open';
    else if (now > end) windowStatus = 'Closed';
    else windowStatus = 'Currently open';
  }

  return (
    <div className="container" style={{ padding: '2rem' }}>
      <h2 style={{ color: '#1a365d', marginBottom: '1.5rem' }}>Test Management</h2>

      {/* 2.5 Status Overview */}
      <div className="card" style={{ padding: '1rem', marginBottom: '2rem', backgroundColor: '#ebf8ff', border: '1px solid #bee3f8', borderRadius: '8px' }}>
        <h4 style={{ color: '#2b6cb0', marginBottom: '0.5rem' }}>Status Overview</h4>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', fontSize: '0.9rem' }}>
          <div><strong>Timer:</strong> {config.timerMinutes} mins</div>
          <div><strong>Window Status:</strong> <span style={{ color: windowStatus === 'Currently open' ? 'green' : (windowStatus === 'Closed' ? 'red' : 'orange') }}>{windowStatus}</span></div>
          <div><strong>R2 Status:</strong> {overview.r2Active ? 'ACTIVE' : 'Not Started'}</div>
          <div><strong>Results Visibility:</strong> {config.resultsVisibility ? 'ON' : 'OFF'}</div>
          <div><strong>Questions:</strong> {questions.length}</div>
          <div><strong>Students:</strong> {overview.totalStudents} total / {overview.attemptedStudents} attempted</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        {/* 2.1 Timer & Visibility */}
        <div className="card" style={{ flex: 1, padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
          <h3 style={{ color: '#2d3748', marginBottom: '1rem' }}>Test Settings</h3>
          
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label>Test Duration (minutes)</label>
            <input 
              type="number" 
              className="form-control" 
              value={config.timerMinutes} 
              onChange={e => setConfig({ ...config, timerMinutes: e.target.value })} 
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label>Results Visibility for Students</label>
            <select 
              className="form-control" 
              value={config.resultsVisibility} 
              onChange={e => setConfig({ ...config, resultsVisibility: e.target.value === 'true' })}
            >
              <option value="false">OFF (Only show total score)</option>
              <option value="true">ON (Show correct answers & breakdown)</option>
            </select>
          </div>

          <button className="btn btn-primary" onClick={handleSaveConfig}>Save Settings</button>
        </div>

        {/* 2.2 Test Window */}
        <div className="card" style={{ flex: 1, padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
          <h3 style={{ color: '#2d3748', marginBottom: '1rem' }}>Test Window (IST)</h3>
          
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label>Start Date & Time</label>
            <input 
              type="datetime-local" 
              className="form-control" 
              value={config.windowStart} 
              onChange={e => setConfig({ ...config, windowStart: e.target.value })} 
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label>End Date & Time</label>
            <input 
              type="datetime-local" 
              className="form-control" 
              value={config.windowEnd} 
              onChange={e => setConfig({ ...config, windowEnd: e.target.value })} 
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-primary" onClick={handleSaveConfig}>Save Window</button>
            <button className="btn btn-danger" onClick={handleClearWindow}>Clear Window</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestManagement;
