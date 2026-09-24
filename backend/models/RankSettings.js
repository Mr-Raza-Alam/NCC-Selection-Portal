const mongoose = require('mongoose');

const rankSettingsSchema = new mongoose.Schema({
  r_r1_entry: { type: Boolean, default: false },
  r_r1_result: { type: Boolean, default: false },
  r_r2_entry: { type: Boolean, default: false },
  r_r2_result: { type: Boolean, default: false },
  r_r3_entry: { type: Boolean, default: false },
  r_r3_result: { type: Boolean, default: false },
  r_r1Cutoff: { type: Number, default: null },
  r_r2Cutoff: { type: Number, default: null },
  r_r3Cutoff: { type: Number, default: null }
});

module.exports = mongoose.model('RankSettings', rankSettingsSchema);
