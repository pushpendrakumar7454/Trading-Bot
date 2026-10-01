const mongoose = require('mongoose');
const Position = require('../models/Position');
const orderEngine = require('../services/orderEngine');
const marketSimulator = require('../services/marketSimulator');
const memoryStore = require('../utils/memoryStore');

// @desc    Get user positions (Open & Closed)
// @route   GET /api/positions
const getPositions = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { status = 'OPEN' } = req.query;

    let positions = [];
    if (mongoose.connection.readyState === 1) {
      const query = { userId };
      if (status) query.status = status.toUpperCase();
      positions = await Position.find(query).sort({ openedAt: -1 });
    } else {
      positions = Array.from(memoryStore.positions.values()).filter(
        (p) => p.userId.toString() === userId.toString()
      );
      if (status) positions = positions.filter((p) => p.status === status.toUpperCase());
      positions.sort((a, b) => new Date(b.openedAt) - new Date(a.openedAt));
    }

    // Attach real-time mark-to-market valuations
    const enriched = positions.map((p) => {
      const curPrice = marketSimulator.getCurrentPrice(p.asset) || p.currentPrice || p.entryPrice;
      const uPnL = p.status === 'OPEN'
        ? Number(((curPrice - p.entryPrice) * p.quantity).toFixed(2))
        : p.unrealizedPnL || 0;
      const cost = p.entryPrice * p.quantity;
      const uPnLPercent = cost > 0 ? Number(((uPnL / cost) * 100).toFixed(2)) : 0;

      return {
        id: p._id ? p._id.toString() : p.id,
        _id: p._id ? p._id.toString() : p.id,
        asset: p.asset,
        side: p.side,
        quantity: p.quantity,
        entryPrice: p.entryPrice,
        currentPrice: curPrice,
        stopLoss: p.stopLoss,
        takeProfit: p.takeProfit,
        unrealizedPnL: uPnL,
        unrealizedPnLPercent: uPnLPercent,
        status: p.status,
        botId: p.botId,
        openedAt: p.openedAt,
        closedAt: p.closedAt,
      };
    });

    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (error) {
    next(error);
  }
};

// @desc    Close a position manually
// @route   POST /api/positions/:id/close
const closePosition = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const posId = req.params.id;

    let position;
    if (mongoose.connection.readyState === 1) {
      position = await Position.findOne({ _id: posId, userId, status: 'OPEN' });
    } else {
      position = Array.from(memoryStore.positions.values()).find(
        (p) => (p._id?.toString() === posId || p.id === posId) && p.userId.toString() === userId.toString() && p.status === 'OPEN'
      );
    }

    if (!position) {
      return res.status(404).json({ success: false, message: 'Open position not found.' });
    }

    const currentPrice = marketSimulator.getCurrentPrice(position.asset) || position.entryPrice;

    // Execute Sell Order via orderEngine
    const result = await orderEngine.createOrder(userId, {
      asset: position.asset,
      type: 'MARKET',
      side: 'SELL',
      quantity: position.quantity,
      price: currentPrice,
      source: 'MANUAL',
    });

    res.json({
      success: true,
      message: `Position in ${position.asset} closed at ₹${currentPrice}.`,
      trade: result.trade,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPositions, closePosition };
