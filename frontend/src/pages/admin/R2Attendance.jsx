import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const R2Attendance = () => {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Reusing r2/table route since it brings r1_qualified students and their R2 results (where attendance is)
      const res = await api.get('/admin/r2/table');
      // Format into a usable array
      const formatted = res.data.students.map(s => {
        const r2 = res.data.r2Scores.find(score => score.studentId === s._id);
        return {
          ...s,
          attendance: r2 ? r2.attendance : ''
        };
      });
      setStudents(formatted);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAttendanceChange = async (studentId, value) => {
    try {
      await api.post('/admin/r2/attendance', { studentId, attendance: value });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDone = async () => {
    try {
      await api.post('/admin/r2/start');
      alert('Attendance saved. Round 2 is now ACTIVE!');
      window.location.href = '/admin/r2';
    } catch (err) {
      alert('Error starting Round 2');
    }
  };

  return (
    <div className="container">
      <h2>Pre-Round 2 Attendance</h2>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Mark 'P' (Present) or 'A' (Absent) for all R1-Qualified students before starting the test.</p>
        <button className="btn btn-primary" onClick={handleDone}>Done (Start R2 Test)</button>
      </div>
      
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Department</th>
              <th>Attendance (P/A)</th>
            </tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s._id}>
                <td>{s.name}</td>
                <td>{s.department}</td>
                <td>
                  <select 
                    value={s.attendance} 
                    onChange={(e) => handleAttendanceChange(s._id, e.target.value)}
                    style={{ background: 'var(--bg-white)', color: 'inherit', border: '1px solid var(--border-color)', padding: '0.25rem', width: '80px' }}
                  >
                    <option value="">--</option>
                    <option value="P">P - Present</option>
                    <option value="A">A - Absent</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default R2Attendance;
