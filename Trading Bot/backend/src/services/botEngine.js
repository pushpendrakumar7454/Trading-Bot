const mongoose = require('mongoose');
const Bot = require('../models/Bot');
const Position = require('../models/Position');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');
const marketSimulator = require('./marketSimulator');
const orderEngine = require('./orderEngine');
const indicators = require('../utils/indicators');
const memoryStore = require('../utils/memoryStore');

class BotEngine {
  constructor() {
    this.isEvaluating = false;
    this.lastEvaluationTime = new Map();
  }

  async evaluateBots(ticks) {
    if (this.isEvaluating) return;
    this.isEvaluating = true;

    try {
      // Find all running bots
      let runningBots = [];
      if (mongoose.connection.readyState === 1) {
        runningBots = await Bot.find({ status: 'RUNNING' });
      } else {
        runningBots = Array.from(memoryStore.bots.values()).filter((b) => b.status === 'RUNNING');
      }

      for (const bot of runningBots) {
        await this.evaluateSingleBot(bot);
      }
    } catch (err) {
      console.error('[BotEngine] Evaluation cycle error:', err);
    } finally {
      this.isEvaluating = false;
    }
  }

  async evaluateSingleBot(bot) {
    const now = Date.now();
    const botIdStr = bot._id ? bot._id.toString() : bot.id;
    const lastRun = this.lastEvaluationTime.get(botIdStr) || 0;

    // Minimum 4 seconds between evaluations for a single bot to avoid over-trading
    if (now - lastRun < 4000) return;
    this.lastEvaluationTime.set(botIdStr, now);

    const asset = bot.asset;
    const candles = marketSimulator.getCandles(asset, 80);
    if (!candles || candles.length < 25) return;

    const closePrices = candles.map((c) => c.close);
    const currentPrice = closePrices[closePrices.length - 1];

    // Generate signal based on bot strategy
    const signal = this.calculateSignal(bot.strategy, closePrices, bot.strategyParameters);
    bot.lastSignal = signal;
    bot.lastRunAt = new Date();

    // Check existing open position for this bot and asset
    let openPosition = null;
    if (mongoose.connection.readyState === 1) {
      openPosition = await Position.findOne({ userId: bot.userId, asset, status: 'OPEN' });
    } else {
      openPosition = Array.from(memoryStore.positions.values()).find(
        (p) => p.userId.toString() === bot.userId.toString() && p.asset === asset && p.status === 'OPEN'
      );
    }

    if (signal === 'BUY' && !openPosition) {
      // Calculate position size based on bot's capital and risk settings
      const riskPercent = bot.riskSettings?.riskPerTrade || 2;
      const orderCapital = Math.min(bot.capital, (bot.capital * (riskPercent * 5)) / 100);
      const calculatedQty = Number((orderCapital / currentPrice).toFixed(4));

      if (calculatedQty > 0.0001) {
        const stopLossPrice = bot.riskSettings?.stopLoss
          ? Number((currentPrice * (1 - bot.riskSettings.stopLoss / 100)).toFixed(2))
          : null;
        const takeProfitPrice = bot.riskSettings?.takeProfit
          ? Number((currentPrice * (1 + bot.riskSettings.takeProfit / 100)).toFixed(2))
          : null;

        const orderResult = await orderEngine.createOrder(bot.userId, {
          asset,
          type: 'MARKET',
          side: 'BUY',
          quantity: calculatedQty,
          price: currentPrice,
          stopLoss: stopLossPrice,
          takeProfit: takeProfitPrice,
          botId: bot._id || bot.id,
          source: 'BOT',
        });

        if (orderResult.success) {
          bot.totalTrades = (bot.totalTrades || 0) + 1;
          await this.saveBot(bot);

          orderEngine.emitUser(bot.userId, 'bot_triggered', {
            botId: botIdStr,
            name: bot.name,
            action: 'BUY',
            price: currentPrice,
            quantity: calculatedQty,
          });
        }
      }
    } else if (signal === 'SELL' && openPosition) {
      // Execute exit
      const orderResult = await orderEngine.createOrder(bot.userId, {
        asset,
        type: 'MARKET',
        side: 'SELL',
        quantity: openPosition.quantity,
        price: currentPrice,
        botId: bot._id || bot.id,
        source: 'BOT',
      });

      if (orderResult.success && orderResult.trade) {
        const pnl = orderResult.trade.realizedPnL || 0;
        bot.totalProfit = Number(((bot.totalProfit || 0) + pnl).toFixed(2));
        bot.totalTrades = (bot.totalTrades || 0) + 1;
        if (pnl > 0) {
          bot.winningTrades = (bot.winningTrades || 0) + 1;
        } else {
          bot.losingTrades = (bot.losingTrades || 0) + 1;
        }
        bot.winRate =
          bot.totalTrades > 0 ? Number(((bot.winningTrades / bot.totalTrades) * 100).toFixed(1)) : 0;
        await this.saveBot(bot);

        orderEngine.emitUser(bot.userId, 'bot_triggered', {
          botId: botIdStr,
          name: bot.name,
          action: 'SELL',
          price: currentPrice,
          pnl,
        });
      }
    } else {
      await this.saveBot(bot);
    }
  }

  calculateSignal(strategySlug, closePrices, params = {}) {
    const len = closePrices.length;
    const currentPrice = closePrices[len - 1];

    switch (strategySlug) {
      case 'MA_CROSSOVER': {
        const fast = indicators.calculateSMA(closePrices, params.fastPeriod || 9);
        const slow = indicators.calculateSMA(closePrices, params.slowPeriod || 21);
        const curFast = fast[len - 1];
        const curSlow = slow[len - 1];
        const prevFast = fast[len - 2];
        const prevSlow = slow[len - 2];

        if (prevFast <= prevSlow && curFast > curSlow) return 'BUY'; // Golden Cross
        if (prevFast >= prevSlow && curFast < curSlow) return 'SELL'; // Death Cross
        return 'HOLD';
      }

      case 'RSI_STRATEGY': {
        const rsiSeries = indicators.calculateRSI(closePrices, params.period || 14);
        const curRsi = rsiSeries[len - 1];
        const prevRsi = rsiSeries[len - 2];

        if (curRsi < (params.oversold || 32) || (prevRsi < 30 && curRsi >= 30)) return 'BUY';
        if (curRsi > (params.overbought || 68) || (prevRsi > 70 && curRsi <= 70)) return 'SELL';
        return 'HOLD';
      }

      case 'MACD_STRATEGY': {
        const macdData = indicators.calculateMACD(closePrices);
        const macd = macdData.macd;
        const sig = macdData.signal;
        const curM = macd[len - 1];
        const curS = sig[len - 1];
        const prevM = macd[len - 2];
        const prevS = sig[len - 2];

        if (prevM <= prevS && curM > curS) return 'BUY';
        if (prevM >= prevS && curM < curS) return 'SELL';
        return 'HOLD';
      }

      case 'BOLLINGER_BANDS': {
        const bb = indicators.calculateBollingerBands(closePrices, 20, 2);
        const lower = bb.lower[len - 1];
        const upper = bb.upper[len - 1];

        if (currentPrice <= lower * 1.002) return 'BUY';
        if (currentPrice >= upper * 0.998) return 'SELL';
        return 'HOLD';
      }

      case 'MOMENTUM': {
        const roc = indicators.calculateMomentum(closePrices, 10);
        const curRoc = roc[len - 1];
        if (curRoc > 1.8) return 'BUY';
        if (curRoc < -1.8) return 'SELL';
        return 'HOLD';
      }

      case 'TREND_FOLLOWING': {
        const ema20 = indicators.calculateEMA(closePrices, 20);
        const ema50 = indicators.calculateEMA(closePrices, 50);
        const cur20 = ema20[len - 1];
        const cur50 = ema50[len - 1];

        if (cur20 > cur50 && currentPrice > cur20) return 'BUY';
        if (cur20 < cur50 && currentPrice < cur20) return 'SELL';
        return 'HOLD';
      }

      default:
        return 'HOLD';
    }
  }

  async saveBot(bot) {
    if (mongoose.connection.readyState === 1 && typeof bot.save === 'function') {
      await bot.save();
    } else {
      const id = bot._id ? bot._id.toString() : bot.id;
      memoryStore.bots.set(id, bot);
    }
  }

  async startBot(botId, userId) {
    return await this.updateBotStatus(botId, userId, 'RUNNING');
  }

  async stopBot(botId, userId) {
    return await this.updateBotStatus(botId, userId, 'STOPPED');
  }

  async pauseBot(botId, userId) {
    return await this.updateBotStatus(botId, userId, 'PAUSED');
  }

  async updateBotStatus(botId, userId, status) {
    if (mongoose.connection.readyState === 1) {
      const bot = await Bot.findOne({ _id: botId, userId });
      if (!bot) return null;
      bot.status = status;
      if (status === 'RUNNING') bot.errorMessage = null;
      await bot.save();

      await Notification.create({
        userId,
        type: status === 'RUNNING' ? 'BOT_STARTED' : 'BOT_STOPPED',
        title: `Bot ${status.toLowerCase()}`,
        message: `Trading Bot "${bot.name}" is now ${status.toLowerCase()}.`,
        metadata: { botId: bot._id },
      });

      return bot;
    }

    const bot = memoryStore.bots.get(botId.toString());
    if (!bot || bot.userId.toString() !== userId.toString()) return null;
    bot.status = status;
    if (status === 'RUNNING') bot.errorMessage = null;

    const notifId = memoryStore.generateId();
    memoryStore.notifications.set(notifId, {
      id: notifId,
      userId: userId.toString(),
      type: status === 'RUNNING' ? 'BOT_STARTED' : 'BOT_STOPPED',
      title: `Bot ${status.toLowerCase()}`,
      message: `Trading Bot "${bot.name}" is now ${status.toLowerCase()}.`,
      read: false,
      createdAt: new Date(),
    });

    return bot;
  }
}

const botEngine = new BotEngine();
module.exports = botEngine;
