const mongoose = require('mongoose');
const Portfolio = require('../models/Portfolio');
const marketSimulator = require('../services/marketSimulator');
const memoryStore = require('../utils/memoryStore');

// @desc    Get user portfolio with real-time mark-to-market valuation
// @route   GET /api/portfolio
const getPortfolio = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    let portfolio;

    if (mongoose.connection.readyState === 1) {
      portfolio = await Portfolio.findOne({ userId });
      if (!portfolio) {
        portfolio = await Portfolio.create({
          userId,
          cashBalance: 10000,
          initialBalance: 10000,
          totalValue: 10000,
        });
      }
    } else {
      portfolio = memoryStore.portfolios.get(userId.toString());
      if (!portfolio) {
        portfolio = {
          userId: userId.toString(),
          cashBalance: 10000,
          initialBalance: 10000,
          totalValue: 10000,
          investedValue: 0,
          realizedPnL: 0,
          unrealizedPnL: 0,
          totalPnL: 0,
          totalPnLPercent: 0,
          dailyPnL: 0,
          holdings: [],
        };
        memoryStore.portfolios.set(userId.toString(), portfolio);
      }
    }

    // Mark-to-market recalculation using live simulator prices
    let totalInvestedValue = 0;
    let totalUnrealizedPnL = 0;

    const holdingsWithLivePrices = (portfolio.holdings || []).map((h) => {
      const currentPrice = marketSimulator.getCurrentPrice(h.asset) || h.currentPrice || h.averageBuyPrice;
      const currentValue = Number((h.quantity * currentPrice).toFixed(2));
      const cost = h.totalCost || Number((h.quantity * h.averageBuyPrice).toFixed(2));
      const unrealizedPnL = Number((currentValue - cost).toFixed(2));
      const unrealizedPnLPercent = cost > 0 ? Number(((unrealizedPnL / cost) * 100).toFixed(2)) : 0;

      totalInvestedValue += currentValue;
      totalUnrealizedPnL += unrealizedPnL;

      return {
        asset: h.asset,
        quantity: h.quantity,
        averageBuyPrice: h.averageBuyPrice,
        currentPrice,
        totalCost: cost,
        currentValue,
        unrealizedPnL,
        unrealizedPnLPercent,
      };
    });

    const totalPortfolioValue = Number((portfolio.cashBalance + totalInvestedValue).toFixed(2));
    const totalPnL = Number((totalPortfolioValue - (portfolio.initialBalance || 10000)).toFixed(2));
    const totalPnLPercent = Number(((totalPnL / (portfolio.initialBalance || 10000)) * 100).toFixed(2));

    const responseData = {
      cashBalance: portfolio.cashBalance,
      initialBalance: portfolio.initialBalance || 10000,
      investedValue: Number(totalInvestedValue.toFixed(2)),
      totalValue: totalPortfolioValue,
      realizedPnL: portfolio.realizedPnL || 0,
      unrealizedPnL: Number(totalUnrealizedPnL.toFixed(2)),
      totalPnL,
      totalPnLPercent,
      dailyPnL: portfolio.dailyPnL || 0,
      holdings: holdingsWithLivePrices,
    };

    res.json({ success: true, data: responseData });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPortfolio };
