const mongoose = require('mongoose');

const testConfigSchema = new mongoose.Schema({
  timerMinutes: { type: Number, default: 30 },
  windowStart: { type: Date, default: null },
  windowEnd: { type: Date, default: null },
  resultsVisibility: { type: Boolean, default: false },
  testType: { type: String, enum: ['new_enrollment', 'rank_selection'], default: 'new_enrollment' }
});

module.exports = mongoose.model('TestConfig', testConfigSchema);
