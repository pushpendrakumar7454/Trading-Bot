const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
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
    condition: {
      type: String,
      enum: [
        'PRICE_ABOVE',
        'PRICE_BELOW',
        'PNL_ABOVE',
        'PNL_BELOW',
        'BOT_STARTED',
        'BOT_STOPPED',
        'RISK_LIMIT',
      ],
      required: true,
    },
    targetValue: {
      type: Number,
      required: true,
    },
    message: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'TRIGGERED', 'DISABLED'],
      default: 'ACTIVE',
    },
    triggeredAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Alert', alertSchema);
