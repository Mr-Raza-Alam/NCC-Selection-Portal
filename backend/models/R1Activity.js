const mongoose = require('mongoose');

const r1ActivitySchema = new mongoose.Schema({
  activityName: { type: String, required: true },
  totalMarks: { type: Number, required: true },
  order: { type: Number, default: 0 }
});

module.exports = mongoose.model('R1Activity', r1ActivitySchema);
