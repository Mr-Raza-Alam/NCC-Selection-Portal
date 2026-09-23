const mongoose = require('mongoose');

const rankSettingsSchema = new mongoose.Schema({
  r1Cutoff: { type: Number, default: null },
  r2Cutoff: { type: Number, default: null },
  currentRound: { type: Number, enum: [1, 2, 3], default: 1 },
  r1SetupComplete: { type: Boolean, default: false },
  r1Completed: { type: Boolean, default: false },
  r2Active: { type: Boolean, default: false },
  r2Completed: { type: Boolean, default: false },
  r3Active: { type: Boolean, default: false },
  r3Completed: { type: Boolean, default: false }
});

module.exports = mongoose.model('RankSettings', rankSettingsSchema);
