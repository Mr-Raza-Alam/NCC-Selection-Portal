import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const Round2Entry = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [cutoff, setCutoff] = useState('');

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
      alert('Cutoff applied. Non-qualifiers removed from active list.');
      fetchData();
    } catch (err) {
      alert('Error applying cutoff');
    }
  };

  const handleDone = async () => {
    try {
      await api.post('/admin/r2/done');
      alert('Round 2 Finalized');
      navigate('/admin/r2');
    } catch (err) {
      console.error(err);
      alert('Error finalizing R2');
    }
  };

  if (!data) return <div className="container">Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Round 2 Results (Written Test)</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
          <div className="input-group" style={{ margin: 0 }}>
            <label>Set R2 Cutoff</label>
            <input type="number" value={cutoff} onChange={e => setCutoff(e.target.value)} style={{ width: '100px' }} />
          </div>
          <button className="btn btn-danger" onClick={handleApplyCutoff}>Apply Cutoff</button>
          <button className="btn btn-primary" onClick={handleDone}>Done</button>
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
                  <td style={{ fontWeight: 'bold', color: 'var(--accent-green)' }}>{r2Score?.totalScore ?? '0'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Round2Entry;
