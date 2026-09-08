const express = require('express');
const router = express.Router();
const { protectAdmin } = require('../middleware/authMiddleware');
const {
  setupR1, getR1Table, enterR1Score, finalizeR1, setR1Cutoff,
  startR2, markR2Attendance, enterR2Score, getR2Table, finalizeR2, setR2Cutoff,
  startR3, getR3Table, enterR3Score, verifyDocs, finalizeR3,
  getMasterTable, getStudentsTable, updateStudentProfile, finalizeSelection, deleteEliminated, publishFinalResults, wipeAllStudents, deleteStudent,
  getAdmins, updateAdminFeatures, getSettingsData
} = require('../controllers/adminController');

router.use(protectAdmin);

router.post('/r1/setup', setupR1);
router.get('/r1/table', getR1Table);
router.post('/r1/score', enterR1Score);
router.post('/r1/done', finalizeR1);
router.post('/r1/cutoff', setR1Cutoff);

router.post('/r2/start', startR2);
router.post('/r2/attendance', markR2Attendance);
router.post('/r2/score', enterR2Score);
router.get('/r2/table', getR2Table);
router.post('/r2/done', finalizeR2);
router.post('/r2/cutoff', setR2Cutoff);

router.post('/r3/start', startR3);
router.get('/r3/table', getR3Table);
router.post('/r3/score', enterR3Score);
router.post('/r3/verify', verifyDocs);
router.post('/r3/done', finalizeR3);

router.get('/master', getMasterTable);
router.get('/students', getStudentsTable);
router.put('/students/:id', updateStudentProfile);
router.delete('/students/all', wipeAllStudents);
router.delete('/students/:id', deleteStudent);
router.delete('/students/eliminated', deleteEliminated);
router.post('/finalize', finalizeSelection);
router.post('/publish-results', publishFinalResults);

// Role Management
router.get('/roles', getAdmins);
router.post('/roles/update', updateAdminFeatures);

router.get('/settings', getSettingsData);

module.exports = router;
