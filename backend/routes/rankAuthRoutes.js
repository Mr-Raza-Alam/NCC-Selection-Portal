const express = require('express');
const router = express.Router();
const { registerRankCandidate, loginRankCandidate, getRankProfile } = require('../controllers/rankAuthController');
const { protectRankCandidate } = require('../middleware/authMiddleware');

// The rank auth routes
router.post('/register', registerRankCandidate);
router.post('/login', loginRankCandidate);
router.get('/profile', protectRankCandidate, getRankProfile);
router.post('/complete-profile', protectRankCandidate, require('../controllers/rankAuthController').completeRankProfile);

module.exports = router;
