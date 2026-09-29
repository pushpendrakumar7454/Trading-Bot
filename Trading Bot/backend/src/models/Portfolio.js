const mongoose = require('mongoose');

const holdingSchema = new mongoose.Schema({
  asset: { type: String, required: true },
  quantity: { type: Number, required: true, default: 0 },
  averageBuyPrice: { type: Number, required: true, default: 0 },
  currentPrice: { type: Number, default: 0 },
  totalCost: { type: Number, default: 0 },
  currentValue: { type: Number, default: 0 },
  unrealizedPnL: { type: Number, default: 0 },
  unrealizedPnLPercent: { type: Number, default: 0 },
});

const portfolioSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    cashBalance: {
      type: Number,
      default: 10000,
    },
    initialBalance: {
      type: Number,
      default: 10000,
    },
    investedValue: {
      type: Number,
      default: 0,
    },
    totalValue: {
      type: Number,
      default: 10000,
    },
    realizedPnL: {
      type: Number,
      default: 0,
    },
    unrealizedPnL: {
      type: Number,
      default: 0,
    },
    totalPnL: {
      type: Number,
      default: 0,
    },
    totalPnLPercent: {
      type: Number,
      default: 0,
    },
    dailyPnL: {
      type: Number,
      default: 0,
    },
    holdings: [holdingSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Portfolio', portfolioSchema);
