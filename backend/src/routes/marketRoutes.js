const express = require('express');
const router = express.Router();
const { getMarkets, getMarketBySymbol, getCandles } = require('../controllers/marketController');

router.get('/', getMarkets);
router.get('/:symbol', getMarketBySymbol);
router.get('/:symbol/candles', getCandles);

module.exports = router;
