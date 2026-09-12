import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';

const StudentTable = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: '', targetId: null, confirmText: '' });
  const [inputVal, setInputVal] = useState('');
  const [editModal, setEditModal] = useState({ isOpen: false, student: null });

  const handleEditChange = (e) => {
    setEditModal({ ...editModal, student: { ...editModal.student, [e.target.name]: e.target.value } });
  };

  const saveEdit = async () => {
    try {
      await api.put(`/admin/students/${editModal.student._id}`, editModal.student);
      toast.success('Student updated successfully');
      setEditModal({ isOpen: false, student: null });
      fetchStudents();
    } catch (err) {
      toast.error('Failed to update student');
    }
  };

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

  const executeDelete = async () => {
    try {
      if (modalConfig.type === 'wipe_all') {
        if (inputVal !== 'WIPE ALL') {
          toast.error('You must type WIPE ALL to confirm.');
          return;
        }
        await api.delete('/admin/students/all');
        toast.success('All records wiped successfully.');
      } else if (modalConfig.type === 'single') {
        await api.delete(`/admin/students/${modalConfig.targetId}`);
        toast.success('Student deleted successfully.');
      }
      setModalConfig({ isOpen: false, type: '', targetId: null, confirmText: '' });
      setInputVal('');
      fetchStudents();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete records.');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Reg Code', 'Name', 'Department', 'DOB', 'Admission No', 'Contact No', 'Parent Contact', 'Email', 'Status'];
    const rows = students.map(s => [
      s.code || '',
      s.name || '',
      s.department || '',
      new Date(s.dob).toLocaleDateString() || '',
      s.admissionNo || '',
      s.contactNo || '',
      s.parentContactNo || '',
      s.email || '',
      s.status || ''
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "student_records.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="action-bar" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Student Record (Registration Data)</h2>
        <div className="action-bar" style={{ margin: 0 }}>
          <button className="btn btn-outline" onClick={handleExportCSV}>
            Export CSV
          </button>
          <button 
            className="btn btn-danger" 
            onClick={() => setModalConfig({ isOpen: true, type: 'wipe_all', confirmText: 'WARNING: This will permanently delete ALL student records and their test scores. Type "WIPE ALL" below to confirm.' })}
          >
            Wipe All Records
          </button>
        </div>
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
              <th>Actions</th>
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
                <td>
                  <button 
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--primary-navy)', marginRight: '0.5rem' }}
                    title="Edit Student"
                    onClick={() => setEditModal({ isOpen: true, student: s })}
                  >
                    ✏️
                  </button>
                  <button 
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--danger-red)' }}
                    title="Delete Student"
                    onClick={() => setModalConfig({ isOpen: true, type: 'single', targetId: s._id, confirmText: `Are you sure you want to permanently delete ${s.name}?` })}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Custom Modal / Flashbox */}
      {modalConfig.isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: 'var(--bg-white)', padding: '2rem', borderRadius: '8px', width: '400px', maxWidth: '90%', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
            <h3 style={{ color: 'var(--danger-red)', marginTop: 0 }}>Confirm Deletion</h3>
            <p style={{ color: 'var(--text-secondary)' }}>{modalConfig.confirmText}</p>
            
            {modalConfig.type === 'wipe_all' && (
              <input 
                type="text" 
                placeholder="Type WIPE ALL" 
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}
              />
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => { setModalConfig({ isOpen: false, type: '', targetId: null, confirmText: '' }); setInputVal(''); }}
              >
                Cancel
              </button>
              <button className="btn btn-danger" onClick={executeDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editModal.isOpen && editModal.student && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: 'var(--bg-white)', padding: '2rem', borderRadius: '8px', width: '400px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginTop: 0, color: 'var(--primary-navy)' }}>Edit Student</h3>
            <div className="input-group">
              <label>Name</label>
              <input type="text" name="name" value={editModal.student.name} onChange={handleEditChange} />
            </div>
            <div className="input-group">
              <label>Department</label>
              <input type="text" name="department" value={editModal.student.department} onChange={handleEditChange} />
            </div>
            <div className="input-group">
              <label>Admission No.</label>
              <input type="text" name="admissionNo" value={editModal.student.admissionNo} onChange={handleEditChange} />
            </div>
            <div className="input-group">
              <label>DOB</label>
              <input type="date" name="dob" value={new Date(editModal.student.dob).toISOString().split('T')[0]} onChange={handleEditChange} />
            </div>
            <div className="input-group">
              <label>Email</label>
              <input type="email" name="email" value={editModal.student.email} onChange={handleEditChange} />
            </div>
            <div className="input-group">
              <label>Student Contact</label>
              <input type="text" name="contactNo" value={editModal.student.contactNo} onChange={handleEditChange} />
            </div>
            <div className="input-group">
              <label>Parent Contact</label>
              <input type="text" name="parentContactNo" value={editModal.student.parentContactNo || ''} onChange={handleEditChange} placeholder="+91 xxxxxxxxxx" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
              <button className="btn btn-secondary" onClick={() => setEditModal({ isOpen: false, student: null })}>Cancel</button>
              <button className="btn btn-primary" onClick={saveEdit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentTable;
