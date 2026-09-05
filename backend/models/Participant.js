const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  department: { type: String, required: true },
  dob: { type: Date, required: true },
  admissionNo: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  contactNo: { type: String, required: true },
  password: { type: String, required: true },
  code: { type: Number, unique: true, min: 10, max: 99 },

  r1Score: { type: Number, default: null },
  r2Score: { type: Number, default: null },
  r2Answers: { type: [Number], default: [] },
  r3Score: { type: Number, default: null },

  hsScore: { type: Number, default: null },
  aCert: { type: Number, enum: [0, 5], default: 0 },
  other: { type: Number, enum: [0, 10], default: 0 },

  totalScore: { type: Number, default: null },

  status: {
    type: String,
    enum: ['active', 'r1_qualified', 'r2_qualified', 'r3_qualified', 'selected', 'eliminated'],
    default: 'active'
  },

  testStartTime: { type: Date, default: null },
  testEndTime: { type: Date, default: null },
  r2Completed: { type: Boolean, default: false },
  r1Attendance: { type: Boolean, default: false },
  r3Attendance: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Participant', participantSchema);
