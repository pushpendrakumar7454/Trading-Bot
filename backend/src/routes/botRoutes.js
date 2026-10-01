const express = require('express');
const router = express.Router();
const {
  getBots,
  getBotById,
  createBot,
  updateBot,
  deleteBot,
  startBot,
  stopBot,
  pauseBot,
} = require('../controllers/botController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.route('/').get(getBots).post(createBot);
router.route('/:id').get(getBotById).put(updateBot).delete(deleteBot);
router.post('/:id/start', startBot);
router.post('/:id/stop', stopBot);
router.post('/:id/pause', pauseBot);

module.exports = router;
