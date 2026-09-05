const express = require('express');
const router = express.Router();
const { protectParticipant } = require('../middleware/authMiddleware');
const { getProfile } = require('../controllers/participantController');

router.use(protectParticipant);

router.get('/profile', getProfile);

module.exports = router;
