const express = require('express');
const router = express.Router();
const { getStrategies } = require('../controllers/strategyController');

router.get('/', getStrategies);

module.exports = router;
