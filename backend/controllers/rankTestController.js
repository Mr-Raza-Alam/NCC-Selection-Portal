const Question = require('../models/Question');
const RankCandidate = require('../models/RankCandidate');
const RankR2Result = require('../models/RankR2Result');
const RankSettings = require('../models/RankSettings');

exports.getTestStatus = async (req, res) => {
  try {
    const settings = await RankSettings.findOne();
    const r2Result = await RankR2Result.findOne({ candidateId: req.user.id });
    
    res.json({
      settings: {
        r_r2_testDate: settings?.r_r2_testDate,
        r_r2_testTime: settings?.r_r2_testTime,
        r_r2_active: settings?.r_r2_active,
        r_r2_result: settings?.r_r2_result
      },
      result: r2Result ? { completed: r2Result.completed } : null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getQuestions = async (req, res) => {
  try {
    const settings = await RankSettings.findOne();
    if (!settings || !settings.r_r2_active) {
      return res.status(403).json({ message: 'Test is not currently active' });
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
    const settings = await RankSettings.findOne();
    if (!settings || !settings.r_r2_active) {
      return res.status(403).json({ message: 'Test is not active' });
    }

    let r2Result = await RankR2Result.findOne({ candidateId: req.user.id });
    
    if (!r2Result) {
      r2Result = await RankR2Result.create({ candidateId: req.user.id, attendance: 'P' });
    }

    if (!r2Result.testStartTime) {
      const duration = settings.r_r2_testDuration || 30;

      r2Result.testStartTime = new Date();
      r2Result.testEndTime = new Date(r2Result.testStartTime.getTime() + duration * 60 * 1000);
      r2Result.attendance = 'P';
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

exports.submitTest = async (req, res) => {
  try {
    const { answersMap } = req.body; 
    let r2Result = await RankR2Result.findOne({ candidateId: req.user.id });
    
    if (r2Result && r2Result.completed) {
      return res.status(400).json({ message: 'Test already submitted' });
    }

    const allQuestions = await Question.find({ testType: 'rank_selection' });
    const settings = await RankSettings.findOne();
    const markPerQuestion = settings.r_r2_markPerQuestion || 1;
    let score = 0;
    
    const cadetAnswersArray = [];

    for (const q of allQuestions) {
      const selectedIndex = answersMap[q._id.toString()];
      const isAnswered = selectedIndex !== undefined && selectedIndex !== -1;
      const isCorrect = isAnswered && selectedIndex === q.correctAnswer;
      
      cadetAnswersArray.push({
        questionId: q._id,
        questionText: q.questionText,
        markedAnswer: isAnswered ? q.options[selectedIndex] : 'Skipped',
        correctAnswer: q.options[q.correctAnswer],
        isCorrect: isCorrect
      });

      if (isCorrect) {
        score += markPerQuestion;
      }
    }
    
    if (!r2Result) {
       r2Result = await RankR2Result.create({ candidateId: req.user.id, attendance: 'P' });
    }

    r2Result.cadetAnswers = cadetAnswersArray;
    r2Result.totalScore = score;
    r2Result.completed = true;
    await r2Result.save();
    
    res.json({ message: 'Test submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getResult = async (req, res) => {
  try {
    const settings = await RankSettings.findOne();
    if (!settings || !settings.r_r2_result) {
      return res.status(403).json({ message: 'Results are not published yet' });
    }

    const r2Result = await RankR2Result.findOne({ candidateId: req.user.id });
    if (!r2Result) {
      return res.status(404).json({ message: 'Result not found' });
    }

    res.json(r2Result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
