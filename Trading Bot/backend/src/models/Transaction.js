const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['DEPOSIT', 'WITHDRAWAL', 'BUY', 'SELL', 'FEE', 'PROFIT', 'LOSS', 'RESET'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
    asset: {
      type: String,
      default: 'USDT',
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['COMPLETED', 'PENDING', 'FAILED'],
      default: 'COMPLETED',
    },
    referenceId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);
