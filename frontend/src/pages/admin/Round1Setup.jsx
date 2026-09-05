import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const Round1Setup = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([{ activityName: '', totalMarks: 10 }]);

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

  const handleSubmit = async () => {
    try {
      await api.post('/admin/r1/setup', { activities });
      alert('R1 Setup Complete');
      navigate('/admin/r1/entry');
    } catch (err) {
      alert('Failed to setup R1');
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
          <button className="btn btn-primary" onClick={handleSubmit}>Done</button>
        </div>
      </div>
    </div>
  );
};

export default Round1Setup;
