const express = require('express');
const router = express.Router();
const {
  register,
  login,
  demoLogin,
  getMe,
  updateProfile,
  changePassword,
  resetDemoAccount,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/demo', demoLogin);

router.use(protect);
router.get('/me', getMe);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);
router.post('/reset-demo', resetDemoAccount);

module.exports = router;
