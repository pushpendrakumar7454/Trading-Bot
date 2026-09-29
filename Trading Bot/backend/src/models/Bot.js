const mongoose = require('mongoose');

const botSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    asset: {
      type: String,
      required: true,
      uppercase: true,
    },
    strategy: {
      type: String,
      required: true,
      enum: [
        'MA_CROSSOVER',
        'RSI_STRATEGY',
        'MACD_STRATEGY',
        'BOLLINGER_BANDS',
        'MOMENTUM',
        'TREND_FOLLOWING',
      ],
    },
    status: {
      type: String,
      enum: ['RUNNING', 'STOPPED', 'PAUSED', 'ERROR'],
      default: 'STOPPED',
    },
    capital: {
      type: Number,
      required: true,
      min: 10,
    },
    allocatedCapital: {
      type: Number,
      default: 0,
    },
    riskSettings: {
      riskPerTrade: { type: Number, default: 2 }, // %
      stopLoss: { type: Number, default: 2.5 }, // %
      takeProfit: { type: Number, default: 5.0 }, // %
      maxDrawdown: { type: Number, default: 10 }, // %
      maxTradesPerDay: { type: Number, default: 10 },
    },
    strategyParameters: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    totalProfit: {
      type: Number,
      default: 0,
    },
    totalTrades: {
      type: Number,
      default: 0,
    },
    winningTrades: {
      type: Number,
      default: 0,
    },
    losingTrades: {
      type: Number,
      default: 0,
    },
    winRate: {
      type: Number,
      default: 0,
    },
    lastSignal: {
      type: String,
      default: 'HOLD',
    },
    lastRunAt: {
      type: Date,
      default: null,
    },
    errorMessage: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Bot', botSchema);
