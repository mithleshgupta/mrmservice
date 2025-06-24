const express = require('express');
const authController = require('../controllers/authController');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/verify-otp', authController.verifyOtp);
router.post('/set-password', authController.setPassword);
router.post('/login', authController.login);
router.put('/update', authenticateToken, authController.updateUserDetails);
router.post('/refresh-token', authController.refreshToken);

module.exports = router;