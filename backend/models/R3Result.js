const mongoose = require('mongoose');

const r3ResultSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  attendance: { type: String, enum: ['P', 'A', ''], default: '' },
  r3Score: { type: Number, default: null } // Interview score out of 10
});

module.exports = mongoose.model('R3Result', r3ResultSchema);
