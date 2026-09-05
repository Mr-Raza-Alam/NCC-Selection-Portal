import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const StudentTable = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await api.get('/admin/students');
      setStudents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Student Record (Registration Data)</h2>
      </div>
      
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Reg Code</th>
              <th>Name</th>
              <th>Department</th>
              <th>DOB</th>
              <th>Admission No.</th>
              <th>Contact No.</th>
              <th>Email</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s._id}>
                <td style={{ fontWeight: 'bold', color: 'var(--accent-green)' }}>{s.code}</td>
                <td>{s.name}</td>
                <td>{s.department}</td>
                <td>{new Date(s.dob).toLocaleDateString()}</td>
                <td>{s.admissionNo}</td>
                <td>{s.contactNo}</td>
                <td>{s.email}</td>
                <td style={{ textTransform: 'uppercase', fontSize: '0.8rem', color: s.status === 'eliminated' ? 'red' : 'inherit' }}>
                  {s.status.replace('_', ' ')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentTable;
