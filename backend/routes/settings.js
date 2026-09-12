const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { Parser } = require('json2csv');

const Admin = require('../models/Admin');
const Student = require('../models/Student');
const R1Result = require('../models/R1Result');
const R2Result = require('../models/R2Result');
const R3Result = require('../models/R3Result');
const MasterRecord = require('../models/MasterRecord');
const Settings = require('../models/Settings');
const TestConfig = require('../models/TestConfig');
const AuditLog = require('../models/AuditLog');
const Question = require('../models/Question');

// POST /api/admin/settings/password
router.post('/password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const admin = await Admin.findById(req.admin.id);
    
    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters' });
    }

    admin.password = await bcrypt.hash(newPassword, 10);
    await admin.save();
    
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating password' });
  }
});

router.post('/reset-batch', async (req, res) => {
  try {
    const { adminPassword, confirmText, resetType } = req.body;
    
    if (confirmText !== 'RESET') {
      return res.status(400).json({ message: 'Confirmation text must be RESET' });
    }

    const admin = await Admin.findById(req.admin.id);
    const isMatch = await bcrypt.compare(adminPassword, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid admin password. Reset aborted.' });
    }

    let auditDetails = '';
    let settings = await Settings.findOne();

    if (resetType === 'nuclear') {
      // 1. Generate Backups
      const backupDir = path.join(__dirname, '../backups');
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupSubdir = path.join(backupDir, timestamp);
      fs.mkdirSync(backupSubdir);

      const students = await Student.find().lean();
      const r1Results = await R1Result.find().lean();
      const r2Results = await R2Result.find().lean();
      const r3Results = await R3Result.find().lean();
      const masterRecords = await MasterRecord.find().populate('studentId', 'code').lean();

      const writeCsv = (data, filename) => {
        if (data.length > 0) {
          const parser = new Parser();
          const csv = parser.parse(data);
          fs.writeFileSync(path.join(backupSubdir, filename), csv);
        }
      };

      writeCsv(students, 'students.csv');
      writeCsv(r1Results, 'r1_results.csv');
      writeCsv(r2Results, 'r2_results.csv');
      writeCsv(r3Results, 'r3_results.csv');
      writeCsv(masterRecords, 'master_records.csv');

      // 2. Wipe Data
      await Student.deleteMany({});
      await R1Result.deleteMany({});
      await R2Result.deleteMany({});
      await R3Result.deleteMany({});
      await MasterRecord.deleteMany({});
      await Question.deleteMany({});
      
      // 3. Reset Global App Settings
      if (settings) {
        settings.r1Cutoff = null;
        settings.r2Cutoff = null;
        settings.currentRound = 1;
        settings.r1SetupComplete = false;
        settings.r2Active = false;
        settings.r3Active = false;
        settings.r3Completed = false;
        await settings.save();
      }

      // 4. Reset Test Config
      let testConfig = await TestConfig.findOne();
      if (testConfig) {
        testConfig.timerMinutes = 30;
        testConfig.windowStart = null;
        testConfig.windowEnd = null;
        testConfig.resultsVisibility = false;
        await testConfig.save();
      }

      auditDetails = `Nuclear Reset. Backup dir: ${timestamp}. Students cleared: ${students.length}. Questions wiped.`;
    } else if (resetType === 'r1') {
      await R1Result.deleteMany({});
      await MasterRecord.updateMany({}, { $unset: { r1: "" }, $set: { total: 0 } });
      if (settings) {
        settings.r1Cutoff = null;
        settings.r1SetupComplete = false;
        await settings.save();
      }
      auditDetails = `R1 Data Reset. Physical test scores and setup cleared.`;
    } else if (resetType === 'r2') {
      await R2Result.deleteMany({});
      await MasterRecord.updateMany({}, { $unset: { r2: "" }, $set: { total: 0 } });
      if (settings) {
        settings.r2Cutoff = null;
        settings.r2Active = false;
        await settings.save();
      }
      auditDetails = `R2 Data Reset. Written test scores cleared.`;
    } else if (resetType === 'r3') {
      await R3Result.deleteMany({});
      await MasterRecord.updateMany({}, { $unset: { r3: "" }, $set: { total: 0 } });
      if (settings) {
        settings.r3Active = false;
        settings.r3Completed = false;
        await settings.save();
      }
      auditDetails = `R3 Data Reset. Interview scores cleared.`;
    } else if (resetType === 'questions') {
      await Question.deleteMany({});
      auditDetails = `Questions Bank Reset. All written test questions wiped.`;
    }

    // 5. Log Audit
    const audit = new AuditLog({
      adminId: admin._id,
      adminUsername: admin.username,
      action: `RESET_${resetType.toUpperCase()}`,
      details: auditDetails
    });
    await audit.save();

    res.json({ 
      message: 'Reset complete. Your app is ready for the new batch.',
      backupFolder: timestamp
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during batch reset' });
  }
});

// GET /api/admin/settings/audit
router.get('/audit', async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ timestamp: -1 });
    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching audit log' });
  }
});

// POST /api/admin/settings/broadcast
router.post('/broadcast', async (req, res) => {
  try {
    const { broadcastMessage, broadcastTarget } = req.body;
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }
    settings.broadcastMessage = broadcastMessage || '';
    settings.broadcastTarget = broadcastTarget || 'none';
    await settings.save();

    res.json({ message: 'Broadcast message updated successfully', settings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating broadcast settings' });
  }
});

module.exports = router;
