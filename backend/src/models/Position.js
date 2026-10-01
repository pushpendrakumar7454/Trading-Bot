const mongoose = require('mongoose');

const positionSchema = new mongoose.Schema(
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
    side: {
      type: String,
      enum: ['BUY', 'SELL'],
      default: 'BUY',
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
    },
    entryPrice: {
      type: Number,
      required: true,
    },
    currentPrice: {
      type: Number,
      required: true,
    },
    stopLoss: {
      type: Number,
      default: null,
    },
    takeProfit: {
      type: Number,
      default: null,
    },
    unrealizedPnL: {
      type: Number,
      default: 0,
    },
    unrealizedPnLPercent: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['OPEN', 'CLOSED'],
      default: 'OPEN',
    },
    botId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bot',
      default: null,
    },
    openedAt: {
      type: Date,
      default: Date.now,
    },
    closedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Position', positionSchema);
