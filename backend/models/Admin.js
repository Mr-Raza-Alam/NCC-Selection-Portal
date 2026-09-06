const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed
  role: { type: String, enum: ['cto', 'lead_admin', 'assistant', 'assistant1', 'assistant2'], required: true },
  // Dynamic features assigned by Raza (Lead Admin)
  features: {
    type: [String],
    default: [] 
    // Examples: 'R1_SETUP', 'R1_SCORE', 'R2_START', 'R2_ATTENDANCE', 'R3_SCORE', 'R3_VERIFY', 'MASTER_TABLE'
  }
});

module.exports = mongoose.model('Admin', adminSchema);
