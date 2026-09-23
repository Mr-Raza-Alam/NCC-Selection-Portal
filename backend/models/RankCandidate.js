const mongoose = require('mongoose');

const rankCandidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  regimentalNo: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  semester: { type: String, default: '' },
  buddyNo: { type: String, required: true },
  mobileNo: { type: String, default: '' },
  email: { type: String, default: '' },
  parentContactNo: { type: String, default: '' },
  password: { type: String, default: null }, // Null until they register
  isRegistered: { type: Boolean, default: false }, // True once they set password
  // Status matches the enrollment logic, but tailored for Rank
  status: { 
    type: String, 
    enum: ['active', 'r1_qualified', 'r2_qualified', 'r3_qualified', 'promoted_cpl', 'promoted_lcpl', 'cadet', 'absent'],
    default: 'active'
  }
});

module.exports = mongoose.model('RankCandidate', rankCandidateSchema);
