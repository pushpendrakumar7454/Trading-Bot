const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    userEmail: {
      type: String,
      default: 'system',
    },
    action: {
      type: String,
      required: true,
    },
    entityType: {
      type: String,
      enum: ['USER', 'ORDER', 'TRADE', 'POSITION', 'BOT', 'STRATEGY', 'RISK', 'ALERT', 'SYSTEM'],
      required: true,
    },
    entityId: {
      type: String,
      default: null,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ActivityLog', activityLogSchema);
