const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const memoryStore = require('../utils/memoryStore');

// @desc    Get user financial ledger transactions
// @route   GET /api/transactions
const getTransactions = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { type, limit = 100 } = req.query;

    if (mongoose.connection.readyState === 1) {
      const query = { userId };
      if (type) query.type = type.toUpperCase();
      const transactions = await Transaction.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit, 10));
      return res.json({ success: true, count: transactions.length, data: transactions });
    }

    let txs = Array.from(memoryStore.transactions.values()).filter(
      (t) => t.userId.toString() === userId.toString()
    );
    if (type) txs = txs.filter((t) => t.type === type.toUpperCase());
    txs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ success: true, count: txs.length, data: txs.slice(0, parseInt(limit, 10)) });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTransactions };
