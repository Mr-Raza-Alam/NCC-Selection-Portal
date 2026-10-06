import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../utils/api';
import toast from 'react-hot-toast';
import Loader from '../../../components/Loader';

const RankRound2Entry = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [settings, setSettings] = useState(null);
  const [showDoneModal, setShowDoneModal] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [processingMsg, setProcessingMsg] = useState('');

  const pollingRef = useRef(null);

  useEffect(() => {
    fetchData();
    return () => stopPolling();
  }, []);

  useEffect(() => {
    if (settings && settings.r_r2_active && !settings.r_r2_result) {
      startPolling();
    } else {
      stopPolling();
    }
  }, [settings]);

  const startPolling = () => {
    if (pollingRef.current) return;
    pollingRef.current = setInterval(() => {
      api.get('/rank-admin/r2/table').then(res => {
        setData(res.data);
      }).catch(err => console.error(err));
    }, 5000); // 5 seconds polling
  };

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  const fetchData = async () => {
    try {
      const [res, settingsRes] = await Promise.all([
        api.get('/rank-admin/r2/table'),
        api.get('/rank-admin/test-settings')
      ]);
      setData(res.data);
      setSettings(settingsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleActivateTest = async () => {
    setProcessingMsg('Activating Test...');
    try {
      await api.post('/rank-admin/r2/start');
      toast.success('Test is now LIVE for cadets!');
      fetchData();
    } catch (err) {
      toast.error('Failed to activate test');
    } finally {
      setProcessingMsg('');
    }
  };

  const handleDone = async () => {
    setProcessingMsg('Finalizing...');
    try {
      await api.post('/rank-admin/r2/done');
      toast.success('Test Finalized! Absentees marked 0.');
      setShowDoneModal(false);
      fetchData();
    } catch (err) {
      toast.error('Error finalizing test');
    } finally {
      setProcessingMsg('');
    }
  };

  if (!data || !settings) return <Loader />;

  const isCompleted = settings.r_r2_result;
  const isActive = settings.r_r2_active;

  const filteredStudents = data.candidates.filter(p => {
    if (!searchTerm) return true;
    const term = String(searchTerm).toLowerCase();
    return (
      (p.name && String(p.name).toLowerCase().includes(term)) ||
      (p.regimentalNo && String(p.regimentalNo).toLowerCase().includes(term)) ||
      (p.department && String(p.department).toLowerCase().includes(term))
    );
  });

  return (
    <div>
      {processingMsg && <Loader overlay message={processingMsg} />}
      <div className="action-bar" style={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0 }}>
          {isCompleted ? "Written Test Results (Locked)" : isActive ? "🟢 LIVE: Written Test" : "Written Test Entry"}
        </h2>
        
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{ padding: '0.5rem 1rem', backgroundColor: '#ebf8ff', color: '#2b6cb0', borderRadius: '4px', fontWeight: 'bold', border: '1px solid #bee3f8', fontSize: '0.9rem', marginRight: '0.5rem' }}>
            Showing: {filteredStudents.length} / {data.candidates.length}
          </div>
          <input 
            type="text" 
            placeholder="Search Name, Reg. No..." 
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && setSearchTerm(searchInput)}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', minWidth: '220px' }}
          />
          <button className="btn btn-primary" onClick={() => setSearchTerm(searchInput)}>Search</button>
        </div>

        <div className="action-bar" style={{ margin: 0 }}>
          {!isCompleted && !isActive && (
            <button className="btn btn-primary" style={{ backgroundColor: 'var(--accent-blue)' }} onClick={handleActivateTest}>
              Activate Test
            </button>
          )}
          {!isCompleted && isActive && (
            <button className="btn btn-outline" style={{ borderColor: 'var(--accent-green)', color: 'var(--accent-green)', borderWidth: '2px' }} onClick={() => setShowDoneModal(true)}>
              Finalize Test
            </button>
          )}
        </div>
      </div>
      
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Reg. No.</th>
              <th>Department</th>
              <th>Attendance</th>
              <th>Test Score</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map(p => {
              const r2Score = data.r2Scores.find(s => String(s.candidateId) === String(p._id));
              return (
                <tr key={p._id}>
                  <td style={{ fontWeight: 'bold' }}>{p.name}</td>
                  <td>{p.regimentalNo || 'N/A'}</td>
                  <td>{p.department}</td>
                  <td>
                    <select 
                      value={r2Score?.attendance || ''}
                      disabled={isCompleted || isActive} 
                      onChange={async (e) => {
                        const val = e.target.value;
                        await api.post('/rank-admin/r2/attendance', { candidateId: p._id, attendance: val });
                        // Re-fetch only table data
                        api.get('/rank-admin/r2/table').then(res => setData(res.data));
                      }}
                      style={{ padding: '0.25rem', background: 'var(--bg-white)', color: 'inherit', border: '1px solid var(--border-color)' }}
                    >
                      <option value="">Select</option>
                      <option value="P">P</option>
                      <option value="A">A</option>
                    </select>
                  </td>
                  <td style={{ fontWeight: 'bold', color: 'var(--accent-green)' }}>
                    {r2Score?.completed ? (r2Score.totalScore ?? 0) : (isActive ? 'Testing...' : '-')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showDoneModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="glass-card" style={{ width: '90%', maxWidth: '500px', padding: '2rem' }}>
            <h3 style={{ color: 'var(--primary-navy)', marginBottom: '1rem' }}>Finalize Written Test</h3>
            <p style={{ color: 'var(--text-primary)', marginBottom: '2rem', fontWeight: 'bold' }}>
              Are you sure you want to finalize? This will lock all scores and assign '0' to absentees.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setShowDoneModal(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ backgroundColor: 'var(--accent-green)' }} onClick={handleDone}>Yes, Finalize</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RankRound2Entry;
