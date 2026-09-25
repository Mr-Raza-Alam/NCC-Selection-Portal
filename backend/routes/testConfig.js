const express = require('express');
const router = express.Router();
const TestConfig = require('../models/TestConfig');
const Student = require('../models/Student');
const Settings = require('../models/Settings');

// Middleware to ensure a config document exists
const ensureConfig = async (testType = 'new_enrollment') => {
  let config = await TestConfig.findOne({ testType });
  if (!config) {
    config = await TestConfig.create({ testType });
  }
  return config;
};

// GET /api/admin/test-config
router.get('/', async (req, res) => {
  try {
    const testType = req.query.type || 'new_enrollment';
    const config = await ensureConfig(testType);
    const settings = await Settings.findOne();
    
    // Calculate overview stats based on testType
    let totalStudents = 0;
    let attemptedStudents = 0;
    let r2Active = false;

    if (testType === 'rank_selection') {
      const RankCandidate = require('../models/RankCandidate');
      const RankR2Result = require('../models/RankR2Result');
      const RankSettings = require('../models/RankSettings');
      
      totalStudents = await RankCandidate.countDocuments();
      attemptedStudents = await RankR2Result.countDocuments();
      
      const rankSettings = await RankSettings.findOne();
      r2Active = rankSettings ? rankSettings.r_r2_entry : false;
    } else {
      totalStudents = await Student.countDocuments();
      attemptedStudents = await Student.countDocuments({ test_attempted: true });
      r2Active = settings ? settings.r2Active : false;
    }

    res.json({
      config,
      overview: {
        r2Active,
        totalStudents,
        attemptedStudents
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/admin/test-config
router.post('/', async (req, res) => {
  try {
    const testType = req.query.type || 'new_enrollment';
    const { timerMinutes, windowStart, windowEnd, resultsVisibility } = req.body;
    let config = await ensureConfig(testType);

    config.timerMinutes = timerMinutes;
    config.windowStart = windowStart || null;
    config.windowEnd = windowEnd || null;
    config.resultsVisibility = resultsVisibility;

    await config.save();
    res.json({ message: 'Test configuration updated successfully', config });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
