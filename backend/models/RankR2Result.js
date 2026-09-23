const mongoose = require('mongoose');

const rankR2ResultSchema = new mongoose.Schema({
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'RankCandidate', required: true },
  attendance: { type: String, enum: ['P', 'A', ''], default: '' },
  answers: { type: [Number], default: [] }, // Option indexes, -1 for skipped
  totalScore: { type: Number, default: 0 },
  testStartTime: { type: Date },
  testEndTime: { type: Date },
  completed: { type: Boolean, default: false }
});

module.exports = mongoose.model('RankR2Result', rankR2ResultSchema);
