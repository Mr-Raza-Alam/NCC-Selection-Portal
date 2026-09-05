import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const Round1Setup = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([{ activityName: '', totalMarks: 10 }]);
  const [showModal, setShowModal] = useState(false);

  const totalMarks = activities.reduce((sum, act) => sum + (Number(act.totalMarks) || 0), 0);

  const handleAdd = () => {
    setActivities([...activities, { activityName: '', totalMarks: 10 }]);
  };

  const handleRemove = (index) => {
    const newActs = [...activities];
    newActs.splice(index, 1);
    setActivities(newActs);
  };

  const handleChange = (index, field, value) => {
    const newActs = [...activities];
    newActs[index][field] = value;
    setActivities(newActs);
  };

  const handleDoneClick = () => {
    if (activities.some(a => !a.activityName.trim())) {
      toast.error('Please name all activities before proceeding.');
      return;
    }
    setShowModal(true);
  };

  const handleConfirmSubmit = async () => {
    try {
      await api.post('/admin/r1/setup', { activities });
      toast.success('R1 Setup Complete');
      navigate('/admin/r1/entry');
    } catch (err) {
      toast.error('Failed to setup R1');
    }
  };

  return (
    <div className="container">
      <h2>Set Up Round 1 Activities</h2>
      <div className="glass-card" style={{ marginTop: '1rem' }}>
        {activities.map((act, i) => (
          <div key={i} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', alignItems: 'flex-end' }}>
            <div className="input-group" style={{ margin: 0, flex: 1 }}>
              <label>Activity {i + 1} Name</label>
              <input 
                type="text" 
                value={act.activityName} 
                onChange={(e) => handleChange(i, 'activityName', e.target.value)} 
                placeholder="e.g., Running 1.6km"
              />
            </div>
            <div className="input-group" style={{ margin: 0, width: '150px' }}>
              <label>Total Marks</label>
              <input 
                type="number" 
                value={act.totalMarks} 
                onChange={(e) => handleChange(i, 'totalMarks', Number(e.target.value))} 
              />
            </div>
            {activities.length > 1 && (
              <button className="btn btn-danger" onClick={() => handleRemove(i)} style={{ padding: '0.75rem 1rem' }}>
                X
              </button>
            )}
          </div>
        ))}
        
        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button className="btn btn-outline" onClick={handleAdd}>+ Add Activity</button>
          <button className="btn btn-primary" onClick={handleDoneClick}>Done</button>
        </div>
      </div>

      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="glass-card" style={{ width: '90%', maxWidth: '500px', padding: '2rem' }}>
            <h3 style={{ color: 'var(--primary-navy)', marginBottom: '1rem' }}>Confirm Setup</h3>
            <p>You have set up <strong>{activities.length}</strong> activities with a total of <strong>{totalMarks}</strong> marks.</p>
            <ul style={{ margin: '1rem 0', paddingLeft: '1.5rem', color: 'var(--text-secondary)' }}>
              {activities.map((a, i) => (
                <li key={i}>{a.activityName}: {a.totalMarks} marks</li>
              ))}
            </ul>
            <p style={{ color: 'var(--text-primary)', marginBottom: '2rem', fontWeight: 'bold' }}>
              Are you sure? Once saved, this setup cannot be easily changed.
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleConfirmSubmit}>Yes, Confirm & Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Round1Setup;
