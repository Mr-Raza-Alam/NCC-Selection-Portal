const express = require('express');
const router = express.Router();
const { registerRankCandidate, loginRankCandidate, getRankProfile } = require('../controllers/rankAuthController');
const { auth } = require('../middleware/authMiddleware');

// The rank auth routes
router.post('/register', registerRankCandidate);
router.post('/login', loginRankCandidate);
router.get('/profile', auth, getRankProfile);

module.exports = router;
