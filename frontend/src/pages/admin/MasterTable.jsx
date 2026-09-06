import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const MasterTable = () => {
  const [masters, setMasters] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'total', direction: 'desc' });
  const role = localStorage.getItem('role');
  const features = JSON.parse(localStorage.getItem('features') || '[]');
  const canVerify = features.includes('ALL') || features.includes('R3_VERIFY');

  const [cutoff, setCutoff] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/admin/master');
      setMasters(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleSelection = async (studentId, isSelected) => {
    try {
      await api.post('/admin/finalize', { studentId, isSelected });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDocUpdate = async (studentId, field, value) => {
    try {
      const master = masters.find(m => m.studentId._id === studentId);
      const payload = {
        studentId,
        hs: field === 'hs' ? Number(value) : master.hs,
        aCert: field === 'aCert' ? Number(value) : master.aCert,
        other: field === 'other' ? Number(value) : master.other
      };
      await api.post('/admin/r3/verify', payload);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteEliminated = async () => {
    if (!window.confirm("Are you sure you want to permanently delete all eliminated records?")) return;
    try {
      const res = await api.delete('/admin/students/eliminated');
      toast.success(res.data.message);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const sortData = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedData = () => {
    const sorted = [...masters];
    sorted.sort((a, b) => {
      // Eliminated always sink to bottom
      if (a.status === 'eliminated' && b.status !== 'eliminated') return 1;
      if (a.status !== 'eliminated' && b.status === 'eliminated') return -1;
      
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'Code', 'Age', 'R1', 'R2', 'R3', 'HS', 'A-Cert', 'Sports', 'Total', 'Status'];
    const rows = getSortedData().map(m => [
      m.name,
      m.studentId?.code || '',
      m.age,
      m.r1 ?? 0,
      m.r2 ?? 0,
      m.r3 ?? 0,
      m.hs ?? 0,
      m.aCert ?? 0,
      m.other ?? 0,
      m.total ?? 0,
      m.status
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "master_merit_list.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="container">Loading...</div>;
  if (!masters.length) return <div className="container">No Master Records Found. Ensure students are registered properly.</div>;

  return (
    <div>
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Master Table (Merit List)</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          {['assistant1', 'assistant2'].includes(role) && canVerify && (
            <button className="btn btn-primary" onClick={() => toast.success('Document Entry Finalized!')}>Entry Done</button>
          )}
          {role === 'lead_admin' && (
            <button className="btn btn-danger" onClick={handleDeleteEliminated}>Delete Eliminated</button>
          )}
          <button className="btn btn-outline" onClick={() => window.print()}>Export PDF</button>
          <button className="btn btn-outline" onClick={handleExportCSV}>Export CSV</button>
        </div>
      </div>

      {/* Apply Cutoff Section - Lead Admin Only */}
      {role === 'lead_admin' && (
        <div className="no-print" style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem', padding: '1rem', background: 'var(--surface-grey)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <label style={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>R1 Cutoff Score:</label>
          <input type="number" value={cutoff} onChange={(e) => setCutoff(e.target.value)} placeholder="Enter minimum R1 score" style={{ padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px', width: '180px', background: 'var(--bg-white)', color: 'var(--text-primary)' }} />
          <button className="btn btn-primary" onClick={async () => {
            if (!cutoff) { toast.error('Enter a cutoff score'); return; }
            try {
              const res = await api.post('/admin/r1/cutoff', { cutoffScore: Number(cutoff) });
              toast.success(res.data.message || 'Cutoff Applied!');
              fetchData();
            } catch (err) { toast.error('Failed to apply cutoff'); }
          }}>Apply Cutoff</button>
        </div>
      )}
      
      <div className="table-wrapper print-area">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Code</th>
              <th onClick={() => sortData('age')} style={{ cursor: 'pointer' }}>Age {sortConfig.key === 'age' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
              <th>R1</th>
              <th>R2</th>
              <th>R3</th>
              <th>HS</th>
              <th>A-Cert</th>
              <th>Other</th>
              <th onClick={() => sortData('total')} style={{ cursor: 'pointer' }}>Total {sortConfig.key === 'total' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}</th>
              <th>Status</th>
              {(role === 'cto' || role === 'lead_admin') && (
                <th className="no-print">Selection (CTO)</th>
              )}
            </tr>
          </thead>
          <tbody>
            {getSortedData().map(m => (
              <tr key={m._id} style={{ 
                background: m.status === 'Selected' ? 'rgba(0, 255, 128, 0.1)' : 'transparent',
                opacity: m.status === 'eliminated' ? 0.5 : 1
              }}>
                <td style={{ fontWeight: 'bold' }}>{m.name}</td>
                <td style={{ color: 'var(--accent-green)' }}>{m.studentId?.code}</td>
                <td>{m.age}</td>
                <td>{m.r1 ?? '-'}</td>
                <td>{m.r2 ?? '-'}</td>
                <td>{m.r3 ?? '-'}</td>
                
                {/* Editable Docs for Ass.2 */}
                <td>
                  {canVerify && m.status !== 'eliminated' ? (
                    <input type="number" defaultValue={m.hs} onBlur={(e) => handleDocUpdate(m.studentId._id, 'hs', e.target.value)} style={{ width: '50px', background: 'transparent', color: 'inherit', border: '1px solid var(--border-color)' }} />
                  ) : m.hs ?? '-'}
                </td>
                <td>
                  {canVerify && m.status !== 'eliminated' ? (
                    <input type="number" defaultValue={m.aCert} onBlur={(e) => handleDocUpdate(m.studentId._id, 'aCert', e.target.value)} style={{ width: '50px', background: 'transparent', color: 'inherit', border: '1px solid var(--border-color)' }} />
                  ) : m.aCert ?? '-'}
                </td>
                <td>
                  {canVerify && m.status !== 'eliminated' ? (
                    <input type="number" defaultValue={m.other} onBlur={(e) => handleDocUpdate(m.studentId._id, 'other', e.target.value)} style={{ width: '50px', background: 'transparent', color: 'inherit', border: '1px solid var(--border-color)' }} />
                  ) : m.other ?? '-'}
                </td>
                
                <td style={{ fontWeight: 'bold', color: 'var(--accent-green)', fontSize: '1.2rem' }}>{m.total}</td>
                
                <td>
                  <span className={`badge ${m.status === 'eliminated' ? 'badge-danger' : m.status === 'Selected' ? 'badge-success' : 'badge-warning'}`}>
                    {m.status}
                  </span>
                </td>
                
                {(role === 'cto' || role === 'lead_admin') && (
                  <td className="no-print">
                    {m.status === 'eliminated' ? (
                      <span style={{ color: 'red' }}>Eliminated</span>
                    ) : (
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={m.status === 'Selected'}
                          onChange={(e) => handleSelection(m.studentId._id, e.target.checked)}
                          style={{ width: '20px', height: '20px' }}
                        />
                        {m.status}
                      </label>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MasterTable;
