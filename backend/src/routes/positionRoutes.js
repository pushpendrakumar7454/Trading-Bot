const express = require('express');
const router = express.Router();
const { getPositions, closePosition } = require('../controllers/positionController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getPositions);
router.post('/:id/close', closePosition);

module.exports = router;
