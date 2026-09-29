const express = require('express');
const router = express.Router();
const { createOrder, getOrders, cancelOrder } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.route('/').post(createOrder).get(getOrders);
router.route('/:id').delete(cancelOrder);

module.exports = router;
