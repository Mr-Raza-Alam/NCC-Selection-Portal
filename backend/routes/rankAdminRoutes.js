
const { 
  setupR1, getR1Table, enterR1Score, finalizeR1, setR1Cutoff,
  startR2, markR2Attendance, enterR2Score, finalizeR2, getR2Table, setR2Cutoff,
  startR3, markR3Attendance, enterR3Score, finalizeR3, getR3Table,
  getMasterTable, deleteEliminated, finalizeSelection, publishFinalResults,
  getAdmins, updateAdminFeatures, getRankSettingsData, wipeAllRankCandidates,
  deleteRankCandidate, updateRankCandidateProfile, verifyDocs
} = require('../controllers/rankAdminController');
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { parse } = require('csv-parse');
const RankCandidate = require('../models/RankCandidate');
const { protectAdmin } = require('../middleware/authMiddleware');

const upload = multer({ storage: multer.memoryStorage() });

// Temporary inline middleware if restrictTo is needed
const restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.admin.role)) {
    return res.status(403).json({ message: 'You do not have permission to perform this action' });
  }
  next();
};

// Upload Pre-Registered Cadets
router.post('/upload-cadets', protectAdmin, restrictTo('lead_admin'), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const csvData = req.file.buffer.toString('utf-8');
    
    parse(csvData, { columns: true, skip_empty_lines: true, trim: true }, async (err, records) => {
      if (err) {
        return res.status(400).json({ message: 'Failed to parse CSV file' });
      }

      try {
        const formattedCadets = records.map((record) => {
          return {
            name: record['Cadet Name'] || record['Name'],
            regimentalNo: record['Regimental No.'],
            department: record['Department'],
            buddyNo: record['Buddy No.'],
            // email and mobileNo will be provided by user later
            password: null,
            isRegistered: false
          };
        });

        // Optional: clear existing if we want a fresh start, or just insert new
        // For safety, maybe delete those that haven't registered yet?
        // Let's just drop all RankCandidates for now during the upload phase (assuming they upload once)
        // await RankCandidate.deleteMany({}); 

        // Let's iterate and upsert based on regimentalNo to avoid duplicates
        for(let cadet of formattedCadets) {
             if(cadet.regimentalNo) {
                await RankCandidate.findOneAndUpdate(
                    { regimentalNo: cadet.regimentalNo }, 
                    { $set: cadet }, 
                    { upsert: true, new: true }
                );
             }
        }

        res.json({ message: 'Pre-registered cadets uploaded successfully', count: formattedCadets.length });
      } catch (dbErr) {
        console.error(dbErr);
        res.status(500).json({ message: 'Database error while saving cadets' });
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error uploading cadets' });
  }
});



// --- Cloned Routes from Admin --- 
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
router.put('/students/:id', updateRankCandidateProfile);
router.delete('/students/all', wipeAllRankCandidates);
router.delete('/students/:id', deleteRankCandidate);
router.delete('/students/eliminated', deleteEliminated);

router.post('/finalize', finalizeSelection);
router.post('/publish-results', publishFinalResults);

router.get('/roles', getAdmins);
router.post('/roles/update', updateAdminFeatures);
router.get('/settings', getRankSettingsData);

module.exports = router;
