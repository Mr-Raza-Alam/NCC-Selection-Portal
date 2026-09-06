import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const ALL_FEATURES = [
  'R1_SETUP', 'R1_SCORE', 
  'R2_START', 'R2_ATTENDANCE', 'R2_SCORE',
  'R3_SCORE', 'R3_VERIFY', 
  'STUDENT_TABLE', 'MASTER_TABLE', 'TEST_MANAGEMENT', 'SETTINGS'
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
    const newFeatures = currentFeatures.includes(feature)
      ? currentFeatures.filter(f => f !== feature)
      : [...currentFeatures, feature];
    
    try {
      await api.post('/admin/roles/update', { adminId, features: newFeatures });
      fetchAdmins(); // refresh
    } catch (err) {
      toast.error('Failed to update features');
    }
  };

  return (
    <div>
      <h2>Role Management</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Role</th>
            <th>Features Access</th>
          </tr>
        </thead>
        <tbody>
          {admins.map(admin => (
            <tr key={admin._id}>
              <td>{admin.username}</td>
              <td>{admin.role}</td>
              <td>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                  {ALL_FEATURES.map(f => (
                    <label key={f} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <input 
                        type="checkbox" 
                        checked={admin.features.includes('ALL') || admin.features.includes(f)}
                        disabled={admin.features.includes('ALL')}
                        onChange={() => toggleFeature(admin._id, f, admin.features)}
                      />
                      <span style={{ fontSize: '0.85rem' }}>{f}</span>
                    </label>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RoleManagement;
