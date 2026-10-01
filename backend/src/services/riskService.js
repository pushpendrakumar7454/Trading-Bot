const mongoose = require('mongoose');
const User = require('../models/User');
const Portfolio = require('../models/Portfolio');
const Position = require('../models/Position');
const Bot = require('../models/Bot');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');
const memoryStore = require('../utils/memoryStore');

class RiskService {
  async getUserRiskSettings(userId) {
    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(userId).select('riskSettings');
      return user?.riskSettings || {
        riskPerTrade: 2,
        maxDailyLoss: 1000,
        maxOpenPositions: 5,
        defaultStopLoss: 3,
        defaultTakeProfit: 6,
      };
    }
    const memUser = memoryStore.users.get(userId.toString());
    return memUser?.riskSettings || {
      riskPerTrade: 2,
      maxDailyLoss: 1000,
      maxOpenPositions: 5,
      defaultStopLoss: 3,
      defaultTakeProfit: 6,
    };
  }

  async validateOrder(userId, { asset, side, quantity, price, totalValue, isBot = false }) {
    const risk = await this.getUserRiskSettings(userId);

    // 1. Get Portfolio
    let portfolio;
    if (mongoose.connection.readyState === 1) {
      portfolio = await Portfolio.findOne({ userId });
    } else {
      portfolio = memoryStore.portfolios.get(userId.toString());
    }

    if (!portfolio) {
      return { allowed: false, reason: 'Portfolio record not found.' };
    }

    // 2. Daily Loss Limit Check
    if (portfolio.dailyPnL <= -Math.abs(risk.maxDailyLoss)) {
      if (isBot) {
        await this.handleDailyLossBreach(userId, portfolio.dailyPnL, risk.maxDailyLoss);
      }
      return {
        allowed: false,
        reason: `Maximum daily loss limit of ₹${risk.maxDailyLoss} reached. Trading halted.`,
      };
    }

    // 3. Balance Check for BUY
    if (side === 'BUY') {
      const fee = totalValue * 0.001; // 0.1% simulated trading fee
      if (portfolio.cashBalance < totalValue + fee) {
        return {
          allowed: false,
          reason: `Insufficient cash balance. Required: ₹${(totalValue + fee).toFixed(2)}, Available: ₹${portfolio.cashBalance.toFixed(2)}`,
        };
      }
    }

    // 4. Maximum Open Positions Check
    let openPositionsCount = 0;
    if (mongoose.connection.readyState === 1) {
      openPositionsCount = await Position.countDocuments({ userId, status: 'OPEN' });
    } else {
      openPositionsCount = Array.from(memoryStore.positions.values()).filter(
        (p) => p.userId.toString() === userId.toString() && p.status === 'OPEN'
      ).length;
    }

    if (side === 'BUY' && openPositionsCount >= risk.maxOpenPositions) {
      return {
        allowed: false,
        reason: `Maximum allowed open positions (${risk.maxOpenPositions}) reached. Close an existing position first.`,
      };
    }

    // 5. Max Position Size (e.g., maximum 35% of total portfolio value in a single position)
    const maxAllowedPositionValue = portfolio.totalValue * 0.40;
    if (totalValue > maxAllowedPositionValue) {
      return {
        allowed: false,
        reason: `Order value (₹${totalValue.toFixed(2)}) exceeds maximum single position allocation limit (40% of portfolio = ₹${maxAllowedPositionValue.toFixed(2)}).`,
      };
    }

    return { allowed: true };
  }

  async handleDailyLossBreach(userId, dailyPnL, maxDailyLoss) {
    console.warn(`[Risk Engine] User ${userId} breached daily loss limit: ${dailyPnL} vs -${maxDailyLoss}`);

    // STOP ALL BOTS
    if (mongoose.connection.readyState === 1) {
      await Bot.updateMany(
        { userId, status: 'RUNNING' },
        { status: 'STOPPED', errorMessage: 'Stopped automatically by Risk Engine: Daily loss limit breached.' }
      );

      await Notification.create({
        userId,
        type: 'RISK_LIMIT',
        title: 'Emergency Risk Rule Triggered',
        message: 'Bot stopped because maximum daily loss limit was reached.',
        metadata: { dailyPnL, maxDailyLoss },
      });

      await ActivityLog.create({
        userId,
        action: 'RISK_LIMIT_BREACHED',
        entityType: 'RISK',
        details: { dailyPnL, maxDailyLoss, action: 'STOP_ALL_BOTS' },
      });
    } else {
      for (const bot of memoryStore.bots.values()) {
        if (bot.userId.toString() === userId.toString() && bot.status === 'RUNNING') {
          bot.status = 'STOPPED';
          bot.errorMessage = 'Stopped automatically by Risk Engine: Daily loss limit breached.';
        }
      }
      const notifId = memoryStore.generateId();
      memoryStore.notifications.set(notifId, {
        id: notifId,
        userId: userId.toString(),
        type: 'RISK_LIMIT',
        title: 'Emergency Risk Rule Triggered',
        message: 'Bot stopped because maximum daily loss limit was reached.',
        metadata: { dailyPnL, maxDailyLoss },
        read: false,
        createdAt: new Date(),
      });
    }
  }
}

const riskService = new RiskService();
module.exports = riskService;
