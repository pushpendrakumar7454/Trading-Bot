const mongoose = require('mongoose');
const Bot = require('../models/Bot');
const botEngine = require('../services/botEngine');
const memoryStore = require('../utils/memoryStore');

// @desc    Get all bots for current user
// @route   GET /api/bots
const getBots = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;

    if (mongoose.connection.readyState === 1) {
      const bots = await Bot.find({ userId }).sort({ createdAt: -1 });
      return res.json({ success: true, count: bots.length, data: bots });
    }

    const bots = Array.from(memoryStore.bots.values())
      .filter((b) => b.userId.toString() === userId.toString())
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ success: true, count: bots.length, data: bots });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single bot details
// @route   GET /api/bots/:id
const getBotById = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const botId = req.params.id;

    if (mongoose.connection.readyState === 1) {
      const bot = await Bot.findOne({ _id: botId, userId });
      if (!bot) return res.status(404).json({ success: false, message: 'Bot not found.' });
      return res.json({ success: true, data: bot });
    }

    const bot = memoryStore.bots.get(botId);
    if (!bot || bot.userId.toString() !== userId.toString()) {
      return res.status(404).json({ success: false, message: 'Bot not found.' });
    }

    res.json({ success: true, data: bot });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new trading bot
// @route   POST /api/bots
const createBot = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { name, asset, strategy, capital, riskSettings = {}, strategyParameters = {} } = req.body;

    if (!name || !asset || !strategy || !capital) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, asset, strategy, and allocated capital.',
      });
    }

    const botData = {
      userId,
      name,
      asset: asset.toUpperCase(),
      strategy,
      capital: Number(capital),
      status: 'STOPPED',
      riskSettings: {
        riskPerTrade: riskSettings.riskPerTrade || 2,
        stopLoss: riskSettings.stopLoss || 2.5,
        takeProfit: riskSettings.takeProfit || 5.0,
        maxDrawdown: riskSettings.maxDrawdown || 10,
      },
      strategyParameters,
      totalProfit: 0,
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      winRate: 0,
      lastSignal: 'HOLD',
    };

    if (mongoose.connection.readyState === 1) {
      const bot = await Bot.create(botData);
      return res.status(201).json({ success: true, message: 'Trading bot created successfully.', data: bot });
    }

    const id = memoryStore.generateId();
    const bot = { ...botData, _id: id, id, createdAt: new Date(), updatedAt: new Date() };
    memoryStore.bots.set(id, bot);

    res.status(201).json({ success: true, message: 'Trading bot created successfully.', data: bot });
  } catch (error) {
    next(error);
  }
};

// @desc    Update bot configuration
// @route   PUT /api/bots/:id
const updateBot = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const botId = req.params.id;
    const { name, capital, riskSettings, strategyParameters } = req.body;

    if (mongoose.connection.readyState === 1) {
      const bot = await Bot.findOne({ _id: botId, userId });
      if (!bot) return res.status(404).json({ success: false, message: 'Bot not found.' });

      if (name) bot.name = name;
      if (capital) bot.capital = Number(capital);
      if (riskSettings) bot.riskSettings = { ...bot.riskSettings, ...riskSettings };
      if (strategyParameters) bot.strategyParameters = { ...bot.strategyParameters, ...strategyParameters };

      await bot.save();
      return res.json({ success: true, message: 'Bot configuration updated.', data: bot });
    }

    const bot = memoryStore.bots.get(botId);
    if (!bot || bot.userId.toString() !== userId.toString()) {
      return res.status(404).json({ success: false, message: 'Bot not found.' });
    }

    if (name) bot.name = name;
    if (capital) bot.capital = Number(capital);
    if (riskSettings) bot.riskSettings = { ...bot.riskSettings, ...riskSettings };
    if (strategyParameters) bot.strategyParameters = { ...bot.strategyParameters, ...strategyParameters };
    bot.updatedAt = new Date();

    res.json({ success: true, message: 'Bot configuration updated.', data: bot });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a bot
// @route   DELETE /api/bots/:id
const deleteBot = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const botId = req.params.id;

    if (mongoose.connection.readyState === 1) {
      const bot = await Bot.findOneAndDelete({ _id: botId, userId });
      if (!bot) return res.status(404).json({ success: false, message: 'Bot not found.' });
      return res.json({ success: true, message: 'Bot removed successfully.' });
    }

    const bot = memoryStore.bots.get(botId);
    if (!bot || bot.userId.toString() !== userId.toString()) {
      return res.status(404).json({ success: false, message: 'Bot not found.' });
    }

    memoryStore.bots.delete(botId);
    res.json({ success: true, message: 'Bot removed successfully.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Start bot
// @route   POST /api/bots/:id/start
const startBot = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const bot = await botEngine.startBot(req.params.id, userId);
    if (!bot) return res.status(404).json({ success: false, message: 'Bot not found.' });
    res.json({ success: true, message: `Bot "${bot.name}" is now running.`, data: bot });
  } catch (error) {
    next(error);
  }
};

// @desc    Stop bot
// @route   POST /api/bots/:id/stop
const stopBot = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const bot = await botEngine.stopBot(req.params.id, userId);
    if (!bot) return res.status(404).json({ success: false, message: 'Bot not found.' });
    res.json({ success: true, message: `Bot "${bot.name}" has been stopped.`, data: bot });
  } catch (error) {
    next(error);
  }
};

// @desc    Pause bot
// @route   POST /api/bots/:id/pause
const pauseBot = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const bot = await botEngine.pauseBot(req.params.id, userId);
    if (!bot) return res.status(404).json({ success: false, message: 'Bot not found.' });
    res.json({ success: true, message: `Bot "${bot.name}" is paused.`, data: bot });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBots,
  getBotById,
  createBot,
  updateBot,
  deleteBot,
  startBot,
  stopBot,
  pauseBot,
};
