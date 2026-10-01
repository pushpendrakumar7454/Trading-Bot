const express = require('express');
const router = express.Router();
const { runBacktest, getBacktestHistory } = require('../controllers/backtestController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.route('/').post(runBacktest).get(getBacktestHistory);

module.exports = router;
