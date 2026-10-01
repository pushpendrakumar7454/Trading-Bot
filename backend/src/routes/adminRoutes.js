const express = require('express');
const router = express.Router();
const {
  getStats,
  getUsers,
  updateUserRole,
  getActivity,
  getSystemBots,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('ADMIN'));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.put('/users/:id', updateUserRole);
router.get('/activity', getActivity);
router.get('/bots', getSystemBots);

module.exports = router;
