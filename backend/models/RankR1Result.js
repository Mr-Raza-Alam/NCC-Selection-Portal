const mongoose = require('mongoose');

const rankR1ResultSchema = new mongoose.Schema({
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'RankCandidate', required: true },
  attendance: { type: String, enum: ['P', 'A', ''], default: '' },
  activityScores: [{
    activityId: { type: mongoose.Schema.Types.ObjectId },
    activityName: String,
    score: Number
  }],
  totalScore: { type: Number, default: 0 }
});

module.exports = mongoose.model('RankR1Result', rankR1ResultSchema);
