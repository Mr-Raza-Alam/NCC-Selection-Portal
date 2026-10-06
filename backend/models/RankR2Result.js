const mongoose = require('mongoose');

const rankR2ResultSchema = new mongoose.Schema({
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'RankCandidate', required: true },
  attendance: { type: String, enum: ['P', 'A', ''], default: '' },
  cadetAnswers: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    questionText: String,
    markedAnswer: String,
    correctAnswer: String,
    isCorrect: Boolean
  }],
  totalScore: { type: Number, default: 0 },
  testStartTime: { type: Date },
  testEndTime: { type: Date },
  draftAnswers: { type: Map, of: Number, default: {} },
  completed: { type: Boolean, default: false }
});

module.exports = mongoose.model('RankR2Result', rankR2ResultSchema);
