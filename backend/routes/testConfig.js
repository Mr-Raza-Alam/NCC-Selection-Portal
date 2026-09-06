const express = require('express');
const router = express.Router();
const TestConfig = require('../models/TestConfig');
const Student = require('../models/Student');
const Settings = require('../models/Settings');

// Middleware to ensure a config document exists
const ensureConfig = async () => {
  let config = await TestConfig.findOne();
  if (!config) {
    config = await TestConfig.create({});
  }
  return config;
};

// GET /api/admin/test-config
router.get('/', async (req, res) => {
  try {
    const config = await ensureConfig();
    const settings = await Settings.findOne();
    
    // Calculate overview stats
    const totalStudents = await Student.countDocuments();
    const attemptedStudents = await Student.countDocuments({ test_attempted: true });

    res.json({
      config,
      overview: {
        r2Active: settings ? settings.r2Active : false,
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
    const { timerMinutes, windowStart, windowEnd, resultsVisibility } = req.body;
    let config = await ensureConfig();

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
