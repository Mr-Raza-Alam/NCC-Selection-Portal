import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../../utils/api';
import Loader from '../../../components/Loader';

const RankMasterTable = () => {
  const [masters, setMasters] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'total', direction: 'desc' });
  const role = localStorage.getItem('role');
  const features = JSON.parse(localStorage.getItem('features') || '[]');
  const canVerify = features.includes('ALL') || features.includes('R3_VERIFY');

  const [cutoff, setCutoff] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/rank-admin/master');
      setMasters(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleSelection = async (candidateId, status) => {
    try {
      await api.post('/rank-admin/finalize', { studentId: candidateId, status });
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update rank');
    }
  };

  const handleDeleteEliminated = async () => {
    if (!window.confirm("Are you sure you want to permanently delete all eliminated records?")) return;
    try {
      const res = await api.delete('/rank-admin/students/eliminated');
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
    const filtered = masters.filter(m => {
      if (!searchTerm) return true;
      const term = String(searchTerm).toLowerCase();
      return (
        (m.name && String(m.name).toLowerCase().includes(term)) ||
        (m.candidateId?.buddyNo && String(m.candidateId.buddyNo).toLowerCase().includes(term)) ||
        (m.status && String(m.status).toLowerCase().includes(term))
      );
    });

    const sorted = [...filtered];
    sorted.sort((a, b) => {
      // Eliminated always sink to bottom
      const aElim = a.status === 'eliminated' || a.status === 'Eliminated';
      const bElim = b.status === 'eliminated' || b.status === 'Eliminated';
      if (aElim && !bElim) return 1;
      if (!aElim && bElim) return -1;
      
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'B_Code', 'Department', 'R1', 'R2', 'R3', 'Total', 'Status'];
    const rows = getSortedData().map(m => [
      m.name,
      m.candidateId?.buddyNo || '',
      m.department || '',
      m.r1 ?? 0,
      m.r2 ?? 0,
      m.r3 ?? 0,
      m.total ?? 0,
      m.status
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
    const enbuddyNodUri = enbuddyNoURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", enbuddyNodUri);
    link.setAttribute("download", "master_merit_list.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <Loader />;
  if (!masters.length) return <div className="container">No Master Records Found. Ensure students are registered properly.</div>;

  return (
    <div>
      {isProcessing && <Loader overlay message="Publishing Final Merit List..." />}
      <div className="no-print action-bar" style={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0 }}>Master Table (Merit List)</h2>
        
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{ padding: '0.5rem 1rem', backgroundColor: '#ebf8ff', color: '#2b6cb0', borderRadius: '4px', fontWeight: 'bold', border: '1px solid #bee3f8', fontSize: '0.9rem', marginRight: '0.5rem' }}>
            Showing: {getSortedData().length} / {masters.length}
          </div>
          <input 
            type="text" 
            placeholder="Search Name, Code, Status..." 
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
          {['lead_admin', 'cto'].includes(role) && (
            <button className="btn btn-primary" onClick={async () => {
              if (!window.confirm("Publish Final Results? This will mark all unselected students as eliminated.")) return;
              setIsProcessing(true);
              try {
                const res = await api.post('/rank-admin/publish-results');
                toast.success(res.data.message);
                fetchData();
              } catch (err) { toast.error('Failed to publish results'); }
              finally { setIsProcessing(false); }
            }}>Publish Final Results</button>
          )}
          {role === 'lead_admin' && (
            <button className="btn btn-danger" onClick={handleDeleteEliminated}>Delete Eliminated</button>
          )}
          <button className="btn btn-outline" onClick={() => window.print()}>Export PDF</button>
          <button className="btn btn-outline" onClick={handleExportCSV}>Export CSV</button>
        </div>
      </div>

      {/* Apply Cutoff Section - Lead Admin & CTO */}
      {['lead_admin', 'cto'].includes(role) && (
        <div className="no-print action-bar" style={{ padding: '1rem', background: 'var(--surface-grey)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <label style={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>R1 Cutoff Score:</label>
          <input type="number" value={cutoff} onChange={(e) => setCutoff(e.target.value)} placeholder="Enter minimum R1 score" style={{ padding: '0.5rem', border: '1px solid var(--border-color)', borderRadius: '4px', width: '180px', background: 'var(--bg-white)', color: 'var(--text-primary)' }} />
          <button className="btn btn-primary" onClick={async () => {
            if (!cutoff) { toast.error('Enter a cutoff score'); return; }
            try {
              const res = await api.post('/rank-admin/r1/cutoff', { cutoffScore: Number(cutoff) });
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
              <th>B_Code</th>
              <th>Department</th>
              <th>R1</th>
              <th>R2</th>
              <th>R3</th>
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
                opacity: (m.status === 'eliminated' || m.status === 'Eliminated') ? 0.5 : 1
              }}>
                <td style={{ fontWeight: 'bold' }}>{m.name}</td>
                <td style={{ color: 'var(--accent-green)' }}>{m.candidateId?.buddyNo}</td>
                <td>{m.department}</td>
                <td>{m.r1 ?? '-'}</td>
                <td>{m.r2 ?? '-'}</td>
                <td>{m.r3 ?? '-'}</td>
                
                <td style={{ fontWeight: 'bold', color: 'var(--accent-green)', fontSize: '1.2rem' }}>{m.total}</td>
                
                <td>
                  <span className={`badge ${m.status === 'absent' ? 'badge-danger' : (m.status === 'promoted_cpl' || m.status === 'promoted_lcpl') ? 'badge-success' : 'badge-warning'}`}>
                    {m.status === 'promoted_cpl' ? 'Promoted (CPL)' : m.status === 'promoted_lcpl' ? 'Promoted (LCPL)' : m.status}
                  </span>
                </td>
                
                {(role === 'cto' || role === 'lead_admin') && (
                  <td className="no-print">
                    {m.status === 'absent' ? (
                      <span style={{ color: 'red' }}>Absent</span>
                    ) : (
                      <select 
                        value={['promoted_cpl', 'promoted_lcpl'].includes(m.status) ? m.status : 'cadet'}
                        onChange={(e) => handleSelection(m.candidateId._id, e.target.value)}
                        style={{
                          padding: '0.4rem',
                          borderRadius: '4px',
                          border: '1px solid var(--border-color)',
                          background: m.status === 'promoted_cpl' ? '#FFD700' : m.status === 'promoted_lcpl' ? '#87CEEB' : 'var(--bg-white)',
                          color: 'black',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="cadet">Cadet</option>
                        <option value="promoted_cpl">Promoted (CPL)</option>
                        <option value="promoted_lcpl">Promoted (LCPL)</option>
                      </select>
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

export default RankMasterTable;
