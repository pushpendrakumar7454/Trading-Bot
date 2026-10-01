const express = require('express');
const router = express.Router();
const { getTrades } = require('../controllers/tradeController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getTrades);

module.exports = router;
