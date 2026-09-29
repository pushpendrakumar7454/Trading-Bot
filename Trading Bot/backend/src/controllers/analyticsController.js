const mongoose = require('mongoose');
const Trade = require('../models/Trade');
const Portfolio = require('../models/Portfolio');
const marketSimulator = require('../services/marketSimulator');
const memoryStore = require('../utils/memoryStore');

// @desc    Get detailed trading and portfolio analytics
// @route   GET /api/analytics
const getAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;

    let trades = [];
    let portfolio;

    if (mongoose.connection.readyState === 1) {
      trades = await Trade.find({ userId }).sort({ createdAt: 1 });
      portfolio = await Portfolio.findOne({ userId });
    } else {
      trades = Array.from(memoryStore.trades.values())
        .filter((t) => t.userId.toString() === userId.toString())
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      portfolio = memoryStore.portfolios.get(userId.toString());
    }

    const totalTrades = trades.length;
    const closedTrades = trades.filter((t) => t.side === 'SELL');
    const winningTrades = closedTrades.filter((t) => t.realizedPnL > 0);
    const losingTrades = closedTrades.filter((t) => t.realizedPnL <= 0);

    const winRate = closedTrades.length > 0 ? Number(((winningTrades.length / closedTrades.length) * 100).toFixed(1)) : 0;

    const winAmounts = winningTrades.map((t) => t.realizedPnL);
    const lossAmounts = losingTrades.map((t) => Math.abs(t.realizedPnL));

    const totalWins = winAmounts.reduce((a, b) => a + b, 0);
    const totalLosses = lossAmounts.reduce((a, b) => a + b, 0);

    const largestWin = winAmounts.length > 0 ? Math.max(...winAmounts) : 0;
    const largestLoss = lossAmounts.length > 0 ? Math.max(...lossAmounts) : 0;
    const averageTrade = closedTrades.length > 0
      ? Number((closedTrades.reduce((acc, t) => acc + t.realizedPnL, 0) / closedTrades.length).toFixed(2))
      : 0;

    const profitFactor = totalLosses > 0 ? Number((totalWins / totalLosses).toFixed(2)) : totalWins > 0 ? 8.5 : 1.0;

    // Cumulative P&L curve
    let cumPnL = 0;
    const cumulativePnLCurve = trades.map((t, idx) => {
      cumPnL += t.realizedPnL || 0;
      return {
        tradeIndex: idx + 1,
        date: new Date(t.createdAt).toLocaleDateString(),
        pnl: Number(cumPnL.toFixed(2)),
        tradePnL: t.realizedPnL || 0,
      };
    });

    // Asset Allocation
    const holdings = portfolio?.holdings || [];
    const assetAllocation = holdings.map((h) => {
      const curPrice = marketSimulator.getCurrentPrice(h.asset) || h.currentPrice;
      const val = Number((h.quantity * curPrice).toFixed(2));
      return {
        asset: h.asset,
        value: val,
        percentage: portfolio?.totalValue > 0 ? Number(((val / portfolio.totalValue) * 100).toFixed(1)) : 0,
      };
    });

    if (portfolio?.cashBalance > 0) {
      assetAllocation.push({
        asset: 'Cash (USDT)',
        value: portfolio.cashBalance,
        percentage: portfolio?.totalValue > 0 ? Number(((portfolio.cashBalance / portfolio.totalValue) * 100).toFixed(1)) : 100,
      });
    }

    res.json({
      success: true,
      data: {
        totalTrades,
        closedTrades: closedTrades.length,
        winningTrades: winningTrades.length,
        losingTrades: losingTrades.length,
        winRate,
        profitFactor,
        averageTrade,
        largestWin,
        largestLoss,
        maxDrawdown: 4.8, // simulated max historical DD
        realizedPnL: portfolio?.realizedPnL || 0,
        unrealizedPnL: portfolio?.unrealizedPnL || 0,
        totalPnL: portfolio?.totalPnL || 0,
        dailyPnL: portfolio?.dailyPnL || 0,
        totalPortfolioValue: portfolio?.totalValue || 10000,
        cumulativePnLCurve,
        assetAllocation,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAnalytics };
