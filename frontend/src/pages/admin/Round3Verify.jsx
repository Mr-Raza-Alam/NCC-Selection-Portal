import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const Round3Verify = () => {
  const navigate = useNavigate();
  const [masters, setMasters] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/admin/master');
      // Filter for students who are at least r2_qualified (so r2_qualified or r3_qualified)
      const qualified = res.data.filter(m => m.studentId.status === 'r2_qualified' || m.studentId.status === 'r3_qualified');
      setMasters(qualified);
    } catch (err) {
      console.error(err);
    }
  };

  const handleVerify = async (studentId, field, value) => {
    try {
      const m = masters.find(x => x.studentId._id === studentId);
      const payload = {
        studentId: studentId,
        hs: field === 'hs' ? Number(value) : (m.hs || 0),
        aCert: field === 'aCert' ? Number(value) : (m.aCert || 0),
        other: field === 'other' ? Number(value) : (m.other || 0),
      };
      
      await api.post('/admin/r3/verify', payload);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDone = async () => {
    try {
      await api.post('/admin/r3/done');
      toast.success('Round 3 Finalized! Totals calculated.');
      navigate('/admin/master');
    } catch (err) {
      toast.error('Failed to finalize R3');
    }
  };

  const filteredMasters = masters.filter(m => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const name = m.studentId?.name || m.name || '';
    const code = m.studentId?.code || '';
    return (
      name.toLowerCase().includes(term) ||
      code.toLowerCase().includes(term)
    );
  });

  return (
    <div className="container">
      <div className="action-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0 }}>Round 3: Document Verify (Ass.2)</h2>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ padding: '0.5rem 1rem', backgroundColor: '#ebf8ff', color: '#2b6cb0', borderRadius: '4px', fontWeight: 'bold', border: '1px solid #bee3f8', fontSize: '0.9rem' }}>
            Showing: {filteredMasters.length} / {masters.length}
          </div>
          <input 
            type="text" 
            placeholder="Search Name or Code..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', minWidth: '220px' }}
          />
        </div>

        <button className="btn btn-primary" onClick={handleDone}>Finalize R3 & Calculate Totals</button>
      </div>
      
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Code</th>
              <th>HS Marks (0-10)</th>
              <th>A-Cert (0/5)</th>
              <th>Sports (0/5)</th>
            </tr>
          </thead>
          <tbody>
            {filteredMasters.map(m => (
              <tr key={m._id}>
                <td>{m.studentId.name || m.name}</td>
                <td>{m.studentId.code}</td>
                <td>
                  <input 
                    type="number" 
                    step="0.1"
                    defaultValue={m.hs ?? ''}
                    onBlur={(e) => handleVerify(m.studentId._id, 'hs', e.target.value)}
                    style={{ width: '80px', padding: '0.25rem', background: 'var(--bg-white)', color: 'inherit', border: '1px solid var(--border-color)' }}
                  />
                </td>
                <td>
                  <select 
                    value={m.aCert || 0}
                    onChange={(e) => handleVerify(m.studentId._id, 'aCert', e.target.value)}
                    style={{ background: 'var(--bg-white)', color: 'inherit', border: '1px solid var(--border-color)', padding: '0.25rem' }}
                  >
                    <option value={0}>0</option>
                    <option value={5}>5</option>
                  </select>
                </td>
                <td>
                  <select 
                    value={m.other || 0}
                    onChange={(e) => handleVerify(m.studentId._id, 'other', e.target.value)}
                    style={{ background: 'var(--bg-white)', color: 'inherit', border: '1px solid var(--border-color)', padding: '0.25rem' }}
                  >
                    <option value={0}>0</option>
                    <option value={5}>5</option>
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

export default Round3Verify;
