import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const Round3Entry = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/admin/r3/table');
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleScoreChange = async (id, value) => {
    try {
      await api.post('/admin/r3/score', {
        studentId: id,
        r3Score: Number(value)
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDone = async () => {
    try {
      await api.post('/admin/r3/done');
      alert('Round 3 Finalized');
      navigate('/admin/r3');
    } catch (err) {
      console.error(err);
      alert('Error finalizing R3');
    }
  };

  if (!data) return <div className="container">Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Round 3: Interview Desk (Ass.1)</h2>
        <button className="btn btn-primary" onClick={handleDone}>Done</button>
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
            {data.students.map(p => {
              const r3 = data.r3Scores.find(s => String(s.studentId) === String(p._id) || (s.studentId && s.studentId._id && String(s.studentId._id) === String(p._id)));
              const isPresent = r3 ? r3.attendance : true;
              return (
              <tr key={p._id}>
                <td>{p.name}</td>
                <td>{p.department}</td>
                <td>
                  <select 
                    value={r3?.attendance || ''} 
                    onChange={async (e) => {
                      const val = e.target.value;
                      await api.post('/admin/r3/score', { studentId: p._id, attendance: val });
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
    </div>
  );
};

export default Round3Entry;
