const Question = require('../models/Question');
const Student = require('../models/Student');
const R2Result = require('../models/R2Result');
const Settings = require('../models/Settings');
const TestConfig = require('../models/TestConfig');
const MasterRecord = require('../models/MasterRecord');

exports.getQuestions = async (req, res) => {
  try {
    const settings = await Settings.findOne();
    if (!settings || !settings.r2Active) {
      return res.status(403).json({ message: 'Round 2 is not active' });
    }

    const config = await TestConfig.findOne();
    if (config && config.windowStart && config.windowEnd) {
      const now = new Date();
      const start = new Date(config.windowStart);
      const end = new Date(config.windowEnd);
      if (now < start || now > end) {
        return res.status(403).json({ 
          message: `Test will be available from ${start.toLocaleString()} to ${end.toLocaleString()}` 
        });
      }
    }

    const student = await Student.findById(req.user.id);
    if (student.status !== 'r1_qualified') {
      return res.status(403).json({ message: 'Not qualified for Round 2' });
    }
    
    let r2Result = await R2Result.findOne({ studentId: student._id });
    if (r2Result && r2Result.completed) {
      return res.status(403).json({ message: 'Test already completed' });
    }

    const questions = await Question.find().select('-correctAnswer');
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.startTest = async (req, res) => {
  try {
    let r2Result = await R2Result.findOne({ studentId: req.user.id });
    
    if (!r2Result) {
      r2Result = await R2Result.create({ studentId: req.user.id });
    }

    if (!r2Result.testStartTime) {
      const config = await TestConfig.findOne();
      const duration = config && config.timerMinutes ? config.timerMinutes : 30;

      r2Result.testStartTime = new Date();
      r2Result.testEndTime = new Date(r2Result.testStartTime.getTime() + duration * 60 * 1000);
      await r2Result.save();
    }
    
    res.json({ 
      startTime: r2Result.testStartTime,
      endTime: r2Result.testEndTime
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.saveProgress = async (req, res) => {
  try {
    const { answers } = req.body; 
    await R2Result.findOneAndUpdate(
      { studentId: req.user.id },
      { answers }
    );
    res.json({ message: 'Progress saved' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.submitTest = async (req, res) => {
  try {
    const { answersMap } = req.body; 
    let r2Result = await R2Result.findOne({ studentId: req.user.id });
    
    if (r2Result && r2Result.completed) {
      return res.status(400).json({ message: 'Test already submitted' });
    }

    const allQuestions = await Question.find();
    let score = 0;
    
    const answersArray = [];

    for (const q of allQuestions) {
      const selected = answersMap[q._id.toString()];
      answersArray.push(selected !== undefined ? selected : -1);
      
      if (selected !== undefined && selected === q.correctAnswer) {
        score += 1;
      }
    }
    
    if (!r2Result) {
       r2Result = await R2Result.create({ studentId: req.user.id });
    }

    r2Result.answers = answersArray;
    r2Result.totalScore = score;
    r2Result.completed = true;
    await r2Result.save();
    
    const record = await MasterRecord.findOne({ studentId: req.user.id });
    if (record) {
      record.r2 = score;
      record.total = (record.r1 || 0) + (record.r2 || 0) + (record.r3 || 0) + (record.hs || 0) + (record.aCert || 0) + (record.other || 0);
      await record.save();
    }
    
    res.json({ message: 'Test submitted successfully', score });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
