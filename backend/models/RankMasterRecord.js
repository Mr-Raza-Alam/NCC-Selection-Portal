const mongoose = require('mongoose');

const rankMasterRecordSchema = new mongoose.Schema({
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'RankCandidate', required: true },
  name: { type: String }, 
  department: { type: String }, 
  r1: { type: Number, default: null }, // Synced from RankR1Result
  r2: { type: Number, default: null }, // Synced from RankR2Result
  r3: { type: Number, default: null }, // Synced from RankR3Result
  // Rank selection omits Document Verification (HS, aCert, other) based on our plan!
  total: { type: Number, default: 0 }, // Auto-calculated sum of r1 + r2 + r3
  status: { type: String, enum: ['Pending', 'Cadet', 'CPL', 'LCPL'], default: 'Pending' } // CTO Dropdown
});

module.exports = mongoose.model('RankMasterRecord', rankMasterRecordSchema);
