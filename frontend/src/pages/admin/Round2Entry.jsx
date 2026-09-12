import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const Round2Entry = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [cutoff, setCutoff] = useState('');
  const [showCutoffModal, setShowCutoffModal] = useState(false);
  const [showDoneModal, setShowDoneModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/admin/r2/table');
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleApplyCutoff = async () => {
    try {
      await api.post('/admin/r2/cutoff', { cutoff: Number(cutoff) });
      toast.success('Cutoff applied. Non-qualifiers removed from active list.');
      setShowCutoffModal(false);
      fetchData();
    } catch (err) {
      toast.error('Error applying cutoff');
    }
  };

  const handleDone = async () => {
    try {
      await api.post('/admin/r2/done');
      toast.success('Round 2 Finalized');
      setShowDoneModal(false);
      navigate('/admin/r2');
    } catch (err) {
      console.error(err);
      toast.error('Error finalizing R2');
    }
  };

  if (!data) return <div className="container">Loading...</div>;

  return (
    <div>
      <div className="action-bar" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Round 2 Results (Written Test)</h2>
        <div className="action-bar" style={{ margin: 0 }}>
          <div className="input-group" style={{ margin: 0 }}>
            <label style={{ fontSize: '0.8rem' }}>Set R2 Cutoff</label>
            <input type="number" value={cutoff} onChange={e => setCutoff(e.target.value)} style={{ width: '100%', maxWidth: '100px' }} />
          </div>
          <button className="btn btn-danger" onClick={() => setShowCutoffModal(true)}>Apply Cutoff</button>
          <button className="btn btn-primary" onClick={() => setShowDoneModal(true)}>Done</button>
        </div>
      </div>
      
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Department</th>
              <th>Attendance (P/A)</th>
              <th>Score (out of 40)</th>
            </tr>
          </thead>
          <tbody>
            {data.students.map(p => {
              const r2Score = data.r2Scores.find(s => String(s.studentId) === String(p._id) || (s.studentId && s.studentId._id && String(s.studentId._id) === String(p._id)));
              const isPresent = r2Score ? r2Score.attendance : true;
              return (
                <tr key={p._id}>
                  <td style={{ fontWeight: 'bold' }}>{p.name}</td>
                  <td>{p.department}</td>
                  <td>
                    <select 
                      value={r2Score?.attendance || ''} 
                      onChange={async (e) => {
                        const val = e.target.value;
                        await api.post('/admin/r2/attendance', { studentId: p._id, attendance: val });
                        fetchData();
                      }}
                      style={{ padding: '0.25rem', background: 'var(--bg-white)', color: 'inherit', border: '1px solid var(--border-color)' }}
                    >
                      <option value="">Select</option>
                      <option value="P">P</option>
                      <option value="A">A</option>
                    </select>
                  </td>
                  <td style={{ fontWeight: 'bold', color: 'var(--accent-green)' }}>
                    <input 
                      type="number" 
                      defaultValue={r2Score?.totalScore ?? ''} 
                      onBlur={async (e) => {
                        const score = e.target.value;
                        if(score === '') return;
                        try {
                          await api.post('/admin/r2/score', { studentId: p._id, score: Number(score) });
                          toast.success(`Score updated for ${p.name}`);
                          fetchData();
                        } catch (err) {
                          toast.error('Failed to update score');
                        }
                      }}
                      disabled={r2Score?.attendance === 'A'}
                      style={{ padding: '0.25rem', width: '80px', border: '1px solid var(--border-color)', background: 'var(--bg-white)', color: 'inherit' }}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showCutoffModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="glass-card" style={{ width: '90%', maxWidth: '500px', padding: '2rem' }}>
            <h3 style={{ color: 'var(--primary-navy)', marginBottom: '1rem' }}>Apply Cutoff?</h3>
            <p style={{ marginBottom: '1rem' }}>This will eliminate non-qualifiers from the active list.</p>
            <p style={{ color: 'var(--warning-amber)', marginBottom: '2rem', fontWeight: 'bold' }}>
              Note: You must hit the 'Done' button after applying the cutoff to finalize the round.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setShowCutoffModal(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleApplyCutoff}>Yes, Apply Cutoff</button>
            </div>
          </div>
        </div>
      )}

      {showDoneModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="glass-card" style={{ width: '90%', maxWidth: '500px', padding: '2rem' }}>
            <h3 style={{ color: 'var(--primary-navy)', marginBottom: '1rem' }}>Finalize Round 2</h3>
            <p style={{ color: 'var(--text-primary)', marginBottom: '2rem', fontWeight: 'bold' }}>
              Are you sure you want to finalize Round 2? This will sync all written test scores to the Master Record. Make sure you have applied the cutoff first.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setShowDoneModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleDone}>Yes, Finalize</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Round2Entry;
