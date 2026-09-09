const express = require('express');
const router = express.Router();
const { registerParticipant, loginParticipant, loginAdmin, verifyDetails, resetPassword } = require('../controllers/authController');

router.post('/register', registerParticipant);
router.post('/login', loginParticipant);
router.post('/admin/login', loginAdmin);
router.post('/verify-details', verifyDetails);
router.post('/reset-password', resetPassword);

module.exports = router;
