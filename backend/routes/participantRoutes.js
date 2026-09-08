const express = require('express');
const router = express.Router();
const { protectParticipant } = require('../middleware/authMiddleware');
const { getProfile, completeProfile } = require('../controllers/participantController');

router.use(protectParticipant);

router.get('/profile', getProfile);
router.post('/complete-profile', completeProfile);

module.exports = router;
