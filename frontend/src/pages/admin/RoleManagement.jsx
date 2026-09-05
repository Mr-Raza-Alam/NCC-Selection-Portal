import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const ALL_FEATURES = [
  'R1_SETUP', 'R1_SCORE', 
  'R2_START', 'R2_ATTENDANCE', 'R2_SCORE',
  'R3_SCORE', 'R3_VERIFY', 
  'STUDENT_TABLE', 'MASTER_TABLE'
];

const RoleManagement = () => {
  const [admins, setAdmins] = useState([]);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const res = await api.get('/admin/roles');
      setAdmins(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleFeature = async (adminId, feature, currentFeatures) => {
    let newFeatures = [...currentFeatures];
    if (newFeatures.includes(feature)) {
      newFeatures = newFeatures.filter(f => f !== feature);
    } else {
      newFeatures.push(feature);
    }
    
    try {
      await api.post('/admin/roles/update', { adminId, features: newFeatures });
      fetchAdmins(); // refresh
    } catch (err) {
      toast.error('Failed to update features');
    }
  };

  return (
    <div className="container">
      <h2>Role Management (Lead Admin Only)</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Dynamically assign features to Sub-Admins.</p>
      
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Role</th>
              <th>Assigned Features</th>
            </tr>
          </thead>
          <tbody>
            {admins.map(admin => (
              <tr key={admin._id}>
                <td style={{ fontWeight: 'bold' }}>{admin.username}</td>
                <td style={{ color: 'var(--accent-green)' }}>{admin.role}</td>
                <td>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {admin.features.includes('ALL') ? (
                      <span style={{ padding: '0.25rem 0.5rem', background: 'var(--accent-green)', borderRadius: '4px', color: 'black' }}>
                        ALL ACCESS
                      </span>
                    ) : (
                      ALL_FEATURES.map(f => (
                        <label key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'var(--surface-grey)', padding: '0.25rem 0.5rem', borderRadius: '4px', cursor: 'pointer' }}>
                          <input 
                            type="checkbox" 
                            checked={admin.features.includes(f)}
                            onChange={() => toggleFeature(admin._id, f, admin.features)}
                          />
                          <span style={{ fontSize: '0.85rem' }}>{f}</span>
                        </label>
                      ))
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RoleManagement;
