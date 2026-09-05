const Student = require('../models/Student');
const R1Result = require('../models/R1Result');
const R2Result = require('../models/R2Result');
const R3Result = require('../models/R3Result');

exports.getProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id).select('-password');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const r1 = await R1Result.findOne({ studentId: req.user.id });
    const r2 = await R2Result.findOne({ studentId: req.user.id });
    const r3 = await R3Result.findOne({ studentId: req.user.id });
    
    res.json({
      ...student.toObject(),
      r1Completed: !!r1,
      r1Score: r1 ? r1.totalScore : null,
      r2Completed: r2 ? r2.completed : false,
      r2Score: (r2 && r2.completed) ? r2.totalScore : null,
      r3Completed: !!r3,
      r3Score: r3 ? r3.r3Score : null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
