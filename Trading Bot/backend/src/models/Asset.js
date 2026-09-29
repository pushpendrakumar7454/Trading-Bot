const mongoose = require('mongoose');

const candleSchema = new mongoose.Schema({
  time: { type: Number, required: true },
  open: { type: Number, required: true },
  high: { type: Number, required: true },
  low: { type: Number, required: true },
  close: { type: Number, required: true },
  volume: { type: Number, required: true },
});

const assetSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
    },
    baseCurrency: {
      type: String,
      required: true,
    },
    quoteCurrency: {
      type: String,
      default: 'USDT',
    },
    price: {
      type: Number,
      required: true,
    },
    open24h: {
      type: Number,
      required: true,
    },
    high24h: {
      type: Number,
      required: true,
    },
    low24h: {
      type: Number,
      required: true,
    },
    volume24h: {
      type: Number,
      default: 0,
    },
    change24h: {
      type: Number,
      default: 0,
    },
    changePercent24h: {
      type: Number,
      default: 0,
    },
    marketStatus: {
      type: String,
      enum: ['OPEN', 'VOLATILE', 'TRENDING_UP', 'TRENDING_DOWN', 'CONSOLIDATING'],
      default: 'OPEN',
    },
    candles: [candleSchema],
    precision: {
      price: { type: Number, default: 2 },
      quantity: { type: Number, default: 4 },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Asset', assetSchema);
