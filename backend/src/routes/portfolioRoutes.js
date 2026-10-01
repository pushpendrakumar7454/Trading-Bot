const express = require('express');
const router = express.Router();
const { getPortfolio } = require('../controllers/portfolioController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getPortfolio);

module.exports = router;
