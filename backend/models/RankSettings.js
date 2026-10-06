const mongoose = require('mongoose');

const rankSettingsSchema = new mongoose.Schema({
  r_r1_entry: { type: Boolean, default: false },
  r_r1_result: { type: Boolean, default: false },
  r_r2_entry: { type: Boolean, default: false },
  r_r2_result: { type: Boolean, default: false },
  r_r3_entry: { type: Boolean, default: false },
  r_r3_result: { type: Boolean, default: false },
  r_r1Cutoff: { type: Number, default: null },
  r_r3Cutoff: { type: Number, default: null },
  r_r2_testDuration: { type: Number, default: 30 },
  r_r2_markPerQuestion: { type: Number, default: 1 },
  r_r2_testDate: { type: Date, default: null },
  r_r2_testTime: { type: String, default: '' },
  r_r2_active: { type: Boolean, default: false }
});

module.exports = mongoose.model('RankSettings', rankSettingsSchema);
