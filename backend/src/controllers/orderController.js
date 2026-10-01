const mongoose = require('mongoose');
const Order = require('../models/Order');
const orderEngine = require('../services/orderEngine');
const memoryStore = require('../utils/memoryStore');

// @desc    Create new order (Market, Limit, Stop)
// @route   POST /api/orders
const createOrder = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { asset, type, side, quantity, price, stopLoss, takeProfit } = req.body;

    if (!asset || !side || !quantity) {
      return res.status(400).json({ success: false, message: 'Please provide asset, side, and quantity.' });
    }

    const result = await orderEngine.createOrder(userId, {
      asset: asset.toUpperCase(),
      type: type || 'MARKET',
      side: side.toUpperCase(),
      quantity: Number(quantity),
      price: price ? Number(price) : undefined,
      stopLoss: stopLoss ? Number(stopLoss) : undefined,
      takeProfit: takeProfit ? Number(takeProfit) : undefined,
      source: 'MANUAL',
    });

    if (!result.success) {
      return res.status(400).json({ success: false, message: result.reason, order: result.order });
    }

    res.status(201).json({
      success: true,
      message: result.order.status === 'FILLED' ? 'Order executed successfully!' : 'Order placed successfully!',
      order: result.order,
      trade: result.trade,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user orders with filtering & pagination
// @route   GET /api/orders
const getOrders = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { status, asset, side, type, limit = 50 } = req.query;

    if (mongoose.connection.readyState === 1) {
      const query = { userId };
      if (status) query.status = status.toUpperCase();
      if (asset) query.asset = asset.toUpperCase();
      if (side) query.side = side.toUpperCase();
      if (type) query.type = type.toUpperCase();

      const orders = await Order.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit, 10));

      return res.json({ success: true, count: orders.length, data: orders });
    }

    let orders = Array.from(memoryStore.orders.values()).filter(
      (o) => o.userId.toString() === userId.toString()
    );

    if (status) orders = orders.filter((o) => o.status === status.toUpperCase());
    if (asset) orders = orders.filter((o) => o.asset === asset.toUpperCase());
    if (side) orders = orders.filter((o) => o.side === side.toUpperCase());
    if (type) orders = orders.filter((o) => o.type === type.toUpperCase());

    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ success: true, count: orders.length, data: orders.slice(0, parseInt(limit, 10)) });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel an open order
// @route   DELETE /api/orders/:id
const cancelOrder = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const orderId = req.params.id;

    if (mongoose.connection.readyState === 1) {
      const order = await Order.findOne({ _id: orderId, userId });
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found.' });
      }
      if (order.status !== 'OPEN' && order.status !== 'PENDING') {
        return res.status(400).json({ success: false, message: `Cannot cancel order with status "${order.status}".` });
      }
      order.status = 'CANCELLED';
      await order.save();
      return res.json({ success: true, message: 'Order cancelled successfully.', order });
    }

    const order = memoryStore.orders.get(orderId);
    if (!order || order.userId.toString() !== userId.toString()) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }
    if (order.status !== 'OPEN' && order.status !== 'PENDING') {
      return res.status(400).json({ success: false, message: `Cannot cancel order with status "${order.status}".` });
    }
    order.status = 'CANCELLED';
    res.json({ success: true, message: 'Order cancelled successfully.', order });
  } catch (error) {
    next(error);
  }
};

module.exports = { createOrder, getOrders, cancelOrder };
