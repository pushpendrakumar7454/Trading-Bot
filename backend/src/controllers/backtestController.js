const mongoose = require('mongoose');
const Backtest = require('../models/Backtest');
const backtestEngine = require('../services/backtestEngine');
const memoryStore = require('../utils/memoryStore');

// @desc    Run dynamic algorithmic backtest
// @route   POST /api/backtests
const runBacktest = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const {
      asset = 'BTC/USDT',
      strategy = 'MA_CROSSOVER',
      startingCapital = 10000,
      riskPerTrade = 2,
      stopLoss = 3,
      takeProfit = 6,
      candlesCount = 200,
    } = req.body;

    const result = backtestEngine.runBacktest({
      asset,
      strategy,
      startingCapital: Number(startingCapital),
      riskPerTrade: Number(riskPerTrade),
      stopLoss: Number(stopLoss),
      takeProfit: Number(takeProfit),
      candlesCount: Number(candlesCount),
    });

    // Save record to DB or memory
    if (mongoose.connection.readyState === 1) {
      await Backtest.create({
        userId,
        ...result,
      });
    } else {
      const id = memoryStore.generateId();
      memoryStore.backtests.set(id, { id, userId: userId.toString(), ...result });
    }

    res.json({
      success: true,
      message: 'Backtest executed successfully with dynamic quantitative analysis.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user backtest history
// @route   GET /api/backtests
const getBacktestHistory = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;

    if (mongoose.connection.readyState === 1) {
      const history = await Backtest.find({ userId }).sort({ createdAt: -1 }).limit(10);
      return res.json({ success: true, count: history.length, data: history });
    }

    const history = Array.from(memoryStore.backtests.values())
      .filter((b) => b.userId.toString() === userId.toString())
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

    res.json({ success: true, count: history.length, data: history });
  } catch (error) {
    next(error);
  }
};

module.exports = { runBacktest, getBacktestHistory };
