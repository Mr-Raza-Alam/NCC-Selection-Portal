const express = require('express');
const router = express.Router();
const { registerParticipant, loginParticipant, loginAdmin } = require('../controllers/authController');

router.post('/register', registerParticipant);
router.post('/login', loginParticipant);
router.post('/admin/login', loginAdmin);

module.exports = router;
