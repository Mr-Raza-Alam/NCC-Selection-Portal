const Question = require('../models/Question');
const RankCandidate = require('../models/RankCandidate');
const RankR2Result = require('../models/RankR2Result');
const RankSettings = require('../models/RankSettings');
const TestConfig = require('../models/TestConfig');
const RankMasterRecord = require('../models/RankMasterRecord');

exports.getQuestions = async (req, res) => {
  try {
    const settings = await RankSettings.findOne();
    if (!settings || !settings.r_r2_entry) {
      return res.status(403).json({ message: 'Written Test is not active' });
    }

    const config = await TestConfig.findOne({ testType: 'rank_selection' });
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

    const student = await RankCandidate.findById(req.user.id);
    if (student.status !== 'r_r1_qualified') {
      return res.status(403).json({ message: 'Not qualified for Written Test' });
    }
    
    let r2Result = await RankR2Result.findOne({ candidateId: student._id });
    if (r2Result && r2Result.completed) {
      return res.status(403).json({ message: 'Test already completed' });
    }

    const questions = await Question.find({ testType: 'rank_selection' }).select('-correctAnswer');
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.startTest = async (req, res) => {
  try {
    let r2Result = await RankR2Result.findOne({ candidateId: req.user.id });
    
    if (!r2Result) {
      r2Result = await RankR2Result.create({ candidateId: req.user.id });
    }

    if (!r2Result.testStartTime) {
      const config = await TestConfig.findOne({ testType: 'rank_selection' });
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
    await RankR2Result.findOneAndUpdate(
      { candidateId: req.user.id },
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
    let r2Result = await RankR2Result.findOne({ candidateId: req.user.id });
    
    if (r2Result && r2Result.completed) {
      return res.status(400).json({ message: 'Test already submitted' });
    }

    const allQuestions = await Question.find({ testType: 'rank_selection' });
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
       r2Result = await RankR2Result.create({ candidateId: req.user.id });
    }

    r2Result.answers = answersArray;
    r2Result.totalScore = score;
    r2Result.completed = true;
    await r2Result.save();
    
    const record = await RankMasterRecord.findOne({ candidateId: req.user.id });
    if (record) {
      record.r2Score = score;
      record.totalScore = (record.r1Score || 0) + (record.r2Score || 0) + (record.r3Score || 0) + (record.aCertScore || 0) + (record.bCertScore || 0);
      await record.save();
    }
    
    res.json({ message: 'Test submitted successfully', score });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
