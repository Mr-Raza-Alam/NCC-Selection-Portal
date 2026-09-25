const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  r1Cutoff: { type: Number, default: null },
  r2Cutoff: { type: Number, default: null },
  currentRound: { type: Number, enum: [1, 2, 3], default: 1 },
  r1SetupComplete: { type: Boolean, default: false },
  r1Completed: { type: Boolean, default: false },
  r2Active: { type: Boolean, default: false },
  r2Completed: { type: Boolean, default: false },
  r3Active: { type: Boolean, default: false },
  r3Completed: { type: Boolean, default: false },
  docVerCompleted: { type: Boolean, default: false },
  // Rank Selection State Variables
  r_r1_entry: { type: Boolean, default: false },
  r_r1_result: { type: Boolean, default: false },
  r_r2_entry: { type: Boolean, default: false },
  r_r2_result: { type: Boolean, default: false },
  r_r3_entry: { type: Boolean, default: false },
  r_r3_result: { type: Boolean, default: false },
  rank_r1Cutoff: { type: Number, default: null },
  rank_r2Cutoff: { type: Number, default: null },
  rank_r3Cutoff: { type: Number, default: null },
  broadcastMessage: { type: String, default: '' },
  broadcastTarget: { type: String, enum: ['none', 'landing', 'dashboard', 'both'], default: 'none' }
});

module.exports = mongoose.model('Settings', settingsSchema);
