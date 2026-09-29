const mongoose = require('mongoose');

const backtestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    asset: {
      type: String,
      required: true,
      uppercase: true,
    },
    strategy: {
      type: String,
      required: true,
    },
    timeframe: {
      type: String,
      default: '1h',
    },
    startingCapital: {
      type: Number,
      required: true,
      default: 10000,
    },
    endingCapital: {
      type: Number,
      required: true,
    },
    totalReturn: {
      type: Number,
      required: true,
    },
    totalReturnPercent: {
      type: Number,
      required: true,
    },
    totalTrades: {
      type: Number,
      required: true,
    },
    winningTrades: {
      type: Number,
      required: true,
    },
    losingTrades: {
      type: Number,
      required: true,
    },
    winRate: {
      type: Number,
      required: true,
    },
    averageWin: {
      type: Number,
      default: 0,
    },
    averageLoss: {
      type: Number,
      default: 0,
    },
    maxDrawdown: {
      type: Number,
      default: 0,
    },
    profitFactor: {
      type: Number,
      default: 0,
    },
    equityCurve: [
      {
        time: { type: String },
        equity: { type: Number },
        drawdown: { type: Number },
      },
    ],
    trades: [
      {
        id: { type: String },
        side: { type: String },
        entryPrice: { type: Number },
        exitPrice: { type: Number },
        quantity: { type: Number },
        pnl: { type: Number },
        pnlPercent: { type: Number },
        entryTime: { type: String },
        exitTime: { type: String },
      },
    ],
    parameters: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Backtest', backtestSchema);
