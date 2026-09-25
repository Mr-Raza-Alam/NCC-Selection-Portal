import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import Loader from '../../components/Loader';

const Round1Entry = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isResultView = location.pathname.includes('/result');
  const [data, setData] = useState(null);
  const [cutoff, setCutoff] = useState('');
  const [showCutoffModal, setShowCutoffModal] = useState(false);
  const [showDoneModal, setShowDoneModal] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [processingMsg, setProcessingMsg] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [res, settingsRes] = await Promise.all([
        api.get('/admin/r1/table'),
        api.get('/admin/settings')
      ]);
      setData(res.data);
      setIsCompleted(settingsRes.data.r1Completed);
    } catch (err) {
      console.error(err);
    }
  };

  const handleScoreChange = async (studentId, activityId, activityName, value) => {
    try {
      await api.post('/admin/r1/score', {
        studentId,
        activityId,
        activityName,
        score: value
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleApplyCutoff = async () => {
    setProcessingMsg('Applying Cutoff...');
    try {
      await api.post('/admin/r1/cutoff', { cutoff: Number(cutoff) });
      toast.success('Cutoff applied. Non-qualifiers removed from active list.');
      setShowCutoffModal(false);
      fetchData();
    } catch (err) {
      toast.error('Error applying cutoff');
    } finally {
      setProcessingMsg('');
    }
  };

  const handleDone = async () => {
    setProcessingMsg('Finalizing Round 1...');
    try {
      await api.post('/admin/r1/done');
      toast.success('Round 1 Finalized! You are now viewing the locked results.');
      setShowDoneModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Error finalizing R1');
    } finally {
      setProcessingMsg('');
    }
  };

  if (!data) return <Loader />;

  // Route-aware logic: Entry vs Result
  if (isResultView && !isCompleted) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '3rem' }}>
        <h2 style={{ color: 'var(--warning-amber)' }}>No Record!</h2>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Please finalize Round 1 (Physical Test) first to view results.</p>
      </div>
    );
  }

  if (!isResultView && isCompleted) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '3rem' }}>
        <h2 style={{ color: 'var(--danger-red)' }}>No Record!</h2>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Since the physical test has been successfully completed. Waiting for next year....!!</p>
      </div>
    );
  }

  const filteredStudents = data.students.filter(p => {
    if (!searchTerm) return true;
    const term = String(searchTerm).toLowerCase();
    return (
      (p.name && String(p.name).toLowerCase().includes(term)) ||
      (p.code && String(p.code).toLowerCase().includes(term))
    );
  });

  return (
    <div>
      {processingMsg && <Loader overlay message={processingMsg} />}
      <div className="action-bar" style={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0 }}>{isCompleted ? "Round 1 Results (Locked)" : "Round 1 Score Entry"}</h2>
        
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{ padding: '0.5rem 1rem', backgroundColor: '#ebf8ff', color: '#2b6cb0', borderRadius: '4px', fontWeight: 'bold', border: '1px solid #bee3f8', fontSize: '0.9rem', marginRight: '0.5rem' }}>
            Showing: {filteredStudents.length} / {data.students.length}
          </div>
          <input 
            type="text" 
            placeholder="Search Name or Code..." 
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && setSearchTerm(searchInput)}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', minWidth: '220px' }}
          />
          <button className="btn btn-primary" onClick={() => setSearchTerm(searchInput)}>Search</button>
          {searchTerm && (
            <button className="btn btn-outline" onClick={() => { setSearchInput(''); setSearchTerm(''); }}>Clear</button>
          )}
        </div>

        <div className="action-bar" style={{ margin: 0 }}>
          {!isCompleted && (
            <>
              <div className="input-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.8rem' }}>Set R1 Cutoff</label>
                <input type="number" value={cutoff} onChange={e => setCutoff(e.target.value)} style={{ width: '100%', maxWidth: '100px' }} />
              </div>
              <button className="btn btn-danger" onClick={() => setShowCutoffModal(true)}>Apply Cutoff</button>
              <button className="btn btn-primary" onClick={() => setShowDoneModal(true)}>Done</button>
            </>
          )}
        </div>
      </div>
      
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Attendance (P/A)</th>
              {data.activities.map(act => (
                <th key={act._id}>{act.activityName} ({act.totalMarks})</th>
              ))}
              <th>Total R1</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map(p => {
              const pScores = data.r1Scores.find(s => String(s.studentId) === String(p._id) || (s.studentId?._id && String(s.studentId._id) === String(p._id)));
              return (
                <tr key={p._id}>
                  <td style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--accent-green)' }}>{p.code}</td>
                  <td>{p.name}</td>
                  <td>
                    <select 
                      value={pScores?.attendance || ''}
                      disabled={isCompleted} 
                      onChange={async (e) => {
                        const val = e.target.value;
                        await api.post('/admin/r1/score', { studentId: p._id, attendance: val });
                        fetchData();
                      }}
                      style={{ padding: '0.25rem', background: 'var(--bg-white)', color: 'inherit', border: '1px solid var(--border-color)' }}
                    >
                      <option value="">Select</option>
                      <option value="P">P</option>
                      <option value="A">A</option>
                    </select>
                  </td>
                  {data.activities.map(act => {
                    const scoreObj = pScores?.activityScores?.find(s => String(s.activityId) === String(act._id));
                    return (
                      <td key={act._id}>
                        <input 
                          type="number" 
                          defaultValue={scoreObj ? scoreObj.score : ''}
                          disabled={isCompleted}
                          onBlur={(e) => handleScoreChange(p._id, act._id, act.activityName, e.target.value)}
                          style={{ width: '60px', padding: '0.25rem', background: 'var(--bg-white)', color: 'inherit', border: '1px solid var(--border-color)' }}
                        />
                      </td>
                    );
                  })}
                  <td style={{ fontWeight: 'bold' }}>{pScores?.totalScore ?? 0}</td>
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
            <h3 style={{ color: 'var(--primary-navy)', marginBottom: '1rem' }}>Finalize Round 1</h3>
            <p style={{ color: 'var(--text-primary)', marginBottom: '2rem', fontWeight: 'bold' }}>
              Are you sure you want to finalize Round 1? This will calculate the final totals for this round. Make sure all scores and cutoffs have been correctly applied.
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

export default Round1Entry;
