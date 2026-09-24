const express = require('express');
const router = express.Router();
const { protectRankCandidate } = require('../middleware/authMiddleware');
const { getQuestions, startTest, saveProgress, submitTest } = require('../controllers/rankTestController');

router.use(protectRankCandidate);

router.get('/questions', getQuestions);
router.post('/start', startTest);
router.post('/save', saveProgress);
router.post('/submit', submitTest);

module.exports = router;
