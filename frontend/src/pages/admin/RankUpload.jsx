import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Loader2, Upload } from 'lucide-react';

const RankUpload = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a CSV file first');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/rank-admin/upload-cadets', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      toast.success(response.data.message || `Successfully uploaded ${response.data.count} cadets`);
      setFile(null);
      // reset file input
      document.getElementById('csv-upload').value = '';
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error uploading cadets CSV');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ color: '#87CEEB', marginBottom: '1rem', borderBottom: '2px solid #87CEEB', paddingBottom: '0.5rem' }}>
        🎖️ Upload 2nd Year Rank Candidates
      </h2>
      
      <div className="card" style={{ maxWidth: '600px', margin: '2rem auto', textAlign: 'center', padding: '3rem' }}>
        <Upload size={48} style={{ color: '#87CEEB', marginBottom: '1rem' }} />
        <h3>Upload CSV Database</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Please upload the compiled CSV containing Name, Regimental No, Department, and Buddy No.
        </p>
        
        <input 
          type="file" 
          id="csv-upload"
          accept=".csv" 
          onChange={handleFileChange} 
          style={{ marginBottom: '1rem' }}
        />
        
        <button 
          className="btn" 
          style={{ 
            width: '100%', 
            backgroundColor: '#87CEEB', 
            color: 'var(--primary-navy)', 
            fontWeight: 'bold',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.5rem'
          }}
          onClick={handleUpload}
          disabled={loading || !file}
        >
          {loading ? <Loader2 className="spinner" size={20} /> : 'Process Upload'}
        </button>
      </div>

      <div className="card" style={{ maxWidth: '600px', margin: '0 auto', background: 'rgba(255, 204, 0, 0.1)', borderLeft: '4px solid var(--secondary-gold)' }}>
        <h4 style={{ color: 'var(--secondary-gold)', margin: '0 0 0.5rem 0' }}>CSV Format Requirements</h4>
        <ul style={{ margin: 0, paddingLeft: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
          <li>Must contain headers exactly as: <strong>Name, Regimental No., Department, Buddy No.</strong></li>
          <li>System will automatically cross-verify these details during cadet registration.</li>
          <li>If a Regimental No already exists in the system, its details will be updated.</li>
        </ul>
      </div>
    </div>
  );
};

export default RankUpload;
