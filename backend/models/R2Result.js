const mongoose = require('mongoose');

const r2ResultSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  attendance: { type: String, enum: ['P', 'A', ''], default: '' }, // Marked by Ass.1 before R2 starts
  answers: { type: [Number], default: [] }, // Option indexes, -1 for skipped
  totalScore: { type: Number, default: 0 },
  testStartTime: { type: Date },
  testEndTime: { type: Date },
  completed: { type: Boolean, default: false }
});

module.exports = mongoose.model('R2Result', r2ResultSchema);
