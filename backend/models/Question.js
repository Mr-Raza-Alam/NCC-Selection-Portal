const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: { type: [String], required: true },
  correctAnswer: { type: Number, required: true, min: 0, max: 3 } // Index of the correct option
});

module.exports = mongoose.model('Question', questionSchema);
