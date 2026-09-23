const mongoose = require('mongoose');

const rankR1ActivitySchema = new mongoose.Schema({
  activityName: { type: String, required: true },
  totalMarks: { type: Number, required: true },
  order: { type: Number, default: 0 }
});

module.exports = mongoose.model('RankR1Activity', rankR1ActivitySchema);
