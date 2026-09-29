const mongoose = require('mongoose');

const strategySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['Trend', 'Momentum', 'Mean Reversion', 'Breakout', 'Volatility'],
      default: 'Trend',
    },
    indicators: [{ type: String }],
    entryConditions: {
      type: String,
      required: true,
    },
    exitConditions: {
      type: String,
      required: true,
    },
    defaultParameters: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    riskParameters: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isBuiltIn: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Strategy', strategySchema);
