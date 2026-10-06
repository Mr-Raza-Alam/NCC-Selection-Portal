const express = require('express');
const router = express.Router();
const { protectRankCandidate } = require('../middleware/authMiddleware');
const { getTestStatus, getQuestions, startTest, submitTest, getResult } = require('../controllers/rankTestController');

router.use(protectRankCandidate);

router.get('/status', getTestStatus);
router.get('/questions', getQuestions);
router.post('/start', startTest);
router.post('/submit', submitTest);
router.get('/result', getResult);

module.exports = router;
