const express = require('express');
const router = express.Router();

const {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  verifyEmail
} = require('../controllers/authController');

console.log({
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  verifyEmail
});

const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/verify-email/:token', verifyEmail);

module.exports = router;