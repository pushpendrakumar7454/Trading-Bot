const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    botId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bot',
      default: null,
    },
    asset: {
      type: String,
      required: true,
      uppercase: true,
    },
    side: {
      type: String,
      enum: ['BUY', 'SELL'],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    fee: {
      type: Number,
      default: 0,
    },
    totalValue: {
      type: Number,
      required: true,
    },
    realizedPnL: {
      type: Number,
      default: 0,
    },
    realizedPnLPercent: {
      type: Number,
      default: 0,
    },
    strategy: {
      type: String,
      default: 'MANUAL',
    },
    source: {
      type: String,
      enum: ['MANUAL', 'BOT'],
      default: 'MANUAL',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Trade', tradeSchema);
