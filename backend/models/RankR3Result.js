const mongoose = require('mongoose');

const rankR3ResultSchema = new mongoose.Schema({
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'RankCandidate', required: true },
  attendance: { type: String, enum: ['P', 'A', ''], default: '' },
  r3Score: { type: Number, default: null } // Interview score out of 10
});

module.exports = mongoose.model('RankR3Result', rankR3ResultSchema);
