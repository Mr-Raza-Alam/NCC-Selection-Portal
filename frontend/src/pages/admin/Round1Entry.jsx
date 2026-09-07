import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const Round1Entry = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [cutoff, setCutoff] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/admin/r1/table');
      setData(res.data);
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
      fetchData(); // refresh totals
    } catch (err) {
      console.error(err);
    }
  };

  const handleApplyCutoff = async () => {
    try {
      await api.post('/admin/r1/cutoff', { cutoff: Number(cutoff) });
      toast.success('Cutoff applied. Non-qualifiers removed from active list.');
      fetchData();
    } catch (err) {
      toast.error('Error applying cutoff');
    }
  };

  const handleDone = async () => {
    try {
      await api.post('/admin/r1/done');
      toast.success('Round 1 Finalized');
      navigate('/admin/r1');
    } catch (err) {
      console.error(err);
      toast.error('Error finalizing R1');
    }
  };

  if (!data) return <div className="container">Loading...</div>;

  return (
    <div>
      <div className="action-bar" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Round 1 Score Entry</h2>
        <div className="action-bar" style={{ margin: 0 }}>
          <div className="input-group" style={{ margin: 0 }}>
            <label style={{ fontSize: '0.8rem' }}>Set R1 Cutoff</label>
            <input type="number" value={cutoff} onChange={e => setCutoff(e.target.value)} style={{ width: '100%', maxWidth: '100px' }} />
          </div>
          <button className="btn btn-danger" onClick={handleApplyCutoff}>Apply Cutoff</button>
          <button className="btn btn-primary" onClick={handleDone}>Done</button>
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
            {data.students.map(p => {
              const pScores = data.r1Scores.find(s => String(s.studentId) === String(p._id) || (s.studentId?._id && String(s.studentId._id) === String(p._id)));
              const isPresent = pScores ? pScores.attendance : '';
              return (
                <tr key={p._id}>
                  <td style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--accent-green)' }}>{p.code}</td>
                  <td>{p.name}</td>
                  <td>
                    <select 
                      value={pScores?.attendance || ''} 
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
    </div>
  );
};

export default Round1Entry;
