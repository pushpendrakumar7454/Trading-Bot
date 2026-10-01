const mongoose = require('mongoose');
const Trade = require('../models/Trade');
const memoryStore = require('../utils/memoryStore');

// @desc    Get user trade history
// @route   GET /api/trades
const getTrades = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { asset, side, limit = 100 } = req.query;

    if (mongoose.connection.readyState === 1) {
      const query = { userId };
      if (asset) query.asset = asset.toUpperCase();
      if (side) query.side = side.toUpperCase();

      const trades = await Trade.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit, 10));

      return res.json({ success: true, count: trades.length, data: trades });
    }

    let trades = Array.from(memoryStore.trades.values()).filter(
      (t) => t.userId.toString() === userId.toString()
    );

    if (asset) trades = trades.filter((t) => t.asset === asset.toUpperCase());
    if (side) trades = trades.filter((t) => t.side === side.toUpperCase());

    trades.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ success: true, count: trades.length, data: trades.slice(0, parseInt(limit, 10)) });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTrades };
