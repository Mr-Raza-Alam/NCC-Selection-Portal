import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import Loader from '../../components/Loader';

const RankRound3Entry = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
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
        api.get('/admin/rank/r3/table'),
        api.get('/admin/rank/settings')
      ]);
      setData(res.data);
      setIsCompleted(settingsRes.data.r_r3_result);
      if (!settingsRes.data.r_r3_entry && !settingsRes.data.r_r3_result) {
        // Interview test not active
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleScoreChange = async (id, value) => {
    try {
      await api.post('/admin/rank/r3/score', {
        candidateId: id,
        r3Score: Number(value)
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDone = async () => {
    setProcessingMsg('Finalizing Interview Phase...');
    try {
      await api.post('/admin/rank/r3/done');
      toast.success('Interview Phase Finalized! You are now viewing the locked results.');
      setShowDoneModal(false);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Error finalizing R3');
    } finally {
      setProcessingMsg('');
    }
  };

  if (!data) return <Loader />;

  const filteredStudents = data.students.filter(p => {
    if (!searchTerm) return true;
    const term = String(searchTerm).toLowerCase();
    return (
      (p.name && String(p.name).toLowerCase().includes(term)) ||
      (p.buddyNo && String(p.buddyNo).toLowerCase().includes(term)) ||
      (p.department && String(p.department).toLowerCase().includes(term))
    );
  });

  if (isCompleted) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '3rem' }}>
        <h2 style={{ color: 'var(--danger-red)' }}>No Record!</h2>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Since the interview test has been successfully completed. Waiting for next year....!!</p>
      </div>
    );
  }

  return (
    <div>
      {processingMsg && <Loader overlay message={processingMsg} />}
      <div className="action-bar" style={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0 }}>{isCompleted ? "Interview Results (Locked)" : "Interview Desk"}</h2>
        
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{ padding: '0.5rem 1rem', backgroundColor: '#ebf8ff', color: '#2b6cb0', borderRadius: '4px', fontWeight: 'bold', border: '1px solid #bee3f8', fontSize: '0.9rem', marginRight: '0.5rem' }}>
            Showing: {filteredStudents.length} / {data.students.length}
          </div>
          <input 
            type="text" 
            placeholder="Search Name, Code, Dept..." 
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
        {!isCompleted && (
          <button className="btn btn-primary" onClick={() => setShowDoneModal(true)}>Done</button>
        )}
      </div>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Department</th>
              <th>Attendance (P/A)</th>
              <th>Interview Score (out of 10)</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map(p => {
              const r3 = data.r3Scores.find(s => String(s.candidateId) === String(p._id) || (s.candidateId && s.candidateId._id && String(s.candidateId._id) === String(p._id)));
              const isPresent = r3 ? r3.attendance : true;
              return (
              <tr key={p._id}>
                <td>{p.name}</td>
                <td>{p.department}</td>
                <td>
                  <select 
                    value={r3?.attendance || ''}
                    disabled={isCompleted} 
                    onChange={async (e) => {
                      const val = e.target.value;
                      await api.post('/admin/rank/r3/score', { candidateId: p._id, attendance: val });
                      fetchData();
                    }}
                    style={{ padding: '0.25rem', background: 'var(--bg-white)', color: 'inherit', border: '1px solid var(--border-color)' }}
                  >
                    <option value="">Select</option>
                    <option value="P">P</option>
                    <option value="A">A</option>
                  </select>
                </td>
                <td>
                  <input 
                    type="number" 
                    step="0.1"
                    defaultValue={r3?.r3Score ?? ''}
                    disabled={isCompleted || r3?.attendance === 'A'}
                    onBlur={(e) => handleScoreChange(p._id, e.target.value)}
                    style={{ width: '80px', padding: '0.25rem', background: 'var(--bg-white)', color: 'inherit', border: '1px solid var(--border-color)' }}
                  />
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
            <h3 style={{ color: 'var(--primary-navy)', marginBottom: '1rem' }}>Finalize Interview Phase</h3>
            <p style={{ color: 'var(--text-primary)', marginBottom: '2rem', fontWeight: 'bold' }}>
              Are you sure you want to finalize the Interview Phase? This action will calculate the grand total across all tests and generate the final Master Record. This action is irreversible.
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

export default RankRound3Entry;
