const mongoose = require('mongoose');

const r1ResultSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  attendance: { type: String, enum: ['P', 'A', ''], default: '' },
  activityScores: [{
    activityId: { type: mongoose.Schema.Types.ObjectId },
    activityName: String,
    score: Number
  }],
  totalScore: { type: Number, default: 0 }
});

module.exports = mongoose.model('R1Result', r1ResultSchema);
