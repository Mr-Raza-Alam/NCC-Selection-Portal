const mongoose = require('mongoose');

const masterRecordSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  name: { type: String }, // Synced once at registration
  dob: { type: Date }, // Synced once at registration
  age: { type: Number }, // Strict integer calculated at registration
  r1: { type: Number, default: null }, // Synced from R1Result
  r2: { type: Number, default: null }, // Synced from R2Result
  r3: { type: Number, default: null }, // Synced from R3Result
  hs: { type: Number, default: 0 }, // 0.0 - 10.0 directly entered by Ass.2
  aCert: { type: Number, default: 0 }, // 5 or 0 directly entered by Ass.2
  other: { type: Number, default: 0 }, // 5 or 0 directly entered by Ass.2
  total: { type: Number, default: 0 }, // Auto-calculated sum
  status: { type: String, default: 'Pending' } // CTO checkmark -> Pending, Selected, Eliminated
});

module.exports = mongoose.model('MasterRecord', masterRecordSchema);
