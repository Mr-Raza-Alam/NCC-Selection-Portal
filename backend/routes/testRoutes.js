const express = require('express');
const router = express.Router();
const { protectParticipant } = require('../middleware/authMiddleware');
const { getQuestions, startTest, saveProgress, submitTest } = require('../controllers/testController');

router.use(protectParticipant);

router.get('/questions', getQuestions);
router.post('/start', startTest);
router.post('/save', saveProgress);
router.post('/submit', submitTest);

module.exports = router;
