import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../utils/api';
import toast from 'react-hot-toast';
import Loader from '../../../components/Loader';

const Round3Verify = () => {
  const navigate = useNavigate();
  const [masters, setMasters] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [r3Completed, setR3Completed] = useState(false);
  const [docVerCompleted, setDocVerCompleted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [res, settingsRes] = await Promise.all([
        api.get('/admin/master'),
        api.get('/admin/settings')
      ]);
      const qualified = res.data.filter(m => m.studentId.status === 'r2_qualified' || m.studentId.status === 'r3_qualified');
      setMasters(qualified);
      setR3Completed(settingsRes.data.r3Completed);
      setDocVerCompleted(settingsRes.data.docVerCompleted);
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
    setIsProcessing(true);
    try {
      await api.post('/admin/r3/verify-done');
      toast.success('Document Verification Finalized! Merit List generated.');
      fetchData();
    } catch (err) {
      toast.error('Failed to finalize Document Verification');
    } finally {
      setIsProcessing(false);
    }
  };

  // Gate 1: Doc Verification already completed — show success
  if (docVerCompleted) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '3rem' }}>
        <h2 style={{ color: 'var(--accent-green)' }}>Verification has been successfully done!!</h2>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Since the new batch has been enrolled, their documents are already verified.</p>
      </div>
    );
  }

  // Gate 2: R3 not completed yet — Doc Verification is locked
  if (!r3Completed) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '3rem' }}>
        <h2 style={{ color: 'var(--warning-amber)' }}>No Record found</h2>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Please complete Round 3 (Interview) first before proceeding to Document Verification.</p>
      </div>
    );
  }

  const filteredMasters = masters.filter(m => {
    if (!searchTerm) return true;
    const term = String(searchTerm).toLowerCase();
    const name = m.studentId?.name || m.name || '';
    const code = m.studentId?.code || '';
    return (
      String(name).toLowerCase().includes(term) ||
      String(code).toLowerCase().includes(term)
    );
  });

  return (
    <div className="container">
      {isProcessing && <Loader overlay message="Calculating Grand Totals & Generating Merit List..." />}
      <div className="action-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0 }}>Document Verification</h2>
        
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{ padding: '0.5rem 1rem', backgroundColor: '#ebf8ff', color: '#2b6cb0', borderRadius: '4px', fontWeight: 'bold', border: '1px solid #bee3f8', fontSize: '0.9rem', marginRight: '0.5rem' }}>
            Showing: {filteredMasters.length} / {masters.length}
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
        <button className="btn btn-primary" onClick={handleDone}>Finalize Verification & Generate Merit List</button>
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
