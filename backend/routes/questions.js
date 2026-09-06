const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const fs = require('fs');
const path = require('path');

// GET /api/admin/questions - Fetch all questions
router.get('/', async (req, res) => {
  try {
    const questions = await Question.find().sort({ questionNumber: 1 });
    res.json(questions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching questions' });
  }
});

// POST /api/admin/questions - Add new question
router.post('/', async (req, res) => {
  try {
    const { questionNumber, questionText, options, correctAnswer, section } = req.body;
    const newQ = new Question({
      questionNumber,
      questionText,
      options,
      correctAnswer,
      section
    });
    await newQ.save();
    res.json({ message: 'Question added successfully', question: newQ });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error adding question' });
  }
});

// PUT /api/admin/questions/:id - Edit question
router.put('/:id', async (req, res) => {
  try {
    const updatedQ = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: 'Question updated successfully', question: updatedQ });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating question' });
  }
});

// DELETE /api/admin/questions/:id - Delete question
router.delete('/:id', async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.params.id);
    res.json({ message: 'Question deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error deleting question' });
  }
});

// POST /api/admin/questions/reset - Reset to original JSON
router.post('/reset', async (req, res) => {
  try {
    const originalDataPath = path.join(__dirname, '../data/originalQuestions.json');
    if (!fs.existsSync(originalDataPath)) {
      return res.status(404).json({ message: 'Original questions backup not found.' });
    }

    const fileData = fs.readFileSync(originalDataPath, 'utf-8');
    const parsedData = JSON.parse(fileData);

    await Question.deleteMany({}); // Clear existing

    const optionMap = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
    const formattedQuestions = parsedData.questions.map(q => ({
      questionNumber: q.question_number,
      questionText: q.question,
      options: [q.options.A, q.options.B, q.options.C, q.options.D],
      correctAnswer: optionMap[q.correct_answer] !== undefined ? optionMap[q.correct_answer] : 0,
      section: q.section
    }));

    await Question.insertMany(formattedQuestions);
    res.json({ message: 'Questions reset to original successfully', count: formattedQuestions.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error resetting questions' });
  }
});

module.exports = router;
