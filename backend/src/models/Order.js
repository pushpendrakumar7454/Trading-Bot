const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
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
    type: {
      type: String,
      enum: ['MARKET', 'LIMIT', 'STOP'],
      default: 'MARKET',
      required: true,
    },
    side: {
      type: String,
      enum: ['BUY', 'SELL'],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0.000001,
    },
    price: {
      type: Number,
      required: true,
    },
    stopPrice: {
      type: Number,
      default: null,
    },
    stopLoss: {
      type: Number,
      default: null,
    },
    takeProfit: {
      type: Number,
      default: null,
    },
    status: {
      type: String,
      enum: ['PENDING', 'OPEN', 'FILLED', 'CANCELLED', 'REJECTED'],
      default: 'PENDING',
    },
    filledPrice: {
      type: Number,
      default: null,
    },
    fee: {
      type: Number,
      default: 0,
    },
    totalValue: {
      type: Number,
      required: true,
    },
    botId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bot',
      default: null,
    },
    source: {
      type: String,
      enum: ['MANUAL', 'BOT'],
      default: 'MANUAL',
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    filledAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
