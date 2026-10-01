const mongoose = require('mongoose');
const User = require('../models/User');
const Bot = require('../models/Bot');
const Order = require('../models/Order');
const Trade = require('../models/Trade');
const ActivityLog = require('../models/ActivityLog');
const memoryStore = require('../utils/memoryStore');
const dbConfig = require('../config/db');

// @desc    Get Admin Overview Stats
// @route   GET /api/admin/stats
const getStats = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const [totalUsers, activeBots, totalOrders, totalTrades] = await Promise.all([
        User.countDocuments(),
        Bot.countDocuments({ status: 'RUNNING' }),
        Order.countDocuments(),
        Trade.countDocuments(),
      ]);

      return res.json({
        success: true,
        data: {
          totalUsers,
          activeUsers: totalUsers,
          activeBots,
          totalOrders,
          totalTrades,
          databaseStatus: dbConfig.getStatus(),
          serverUptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
        },
      });
    }

    const totalUsers = memoryStore.users.size;
    const activeBots = Array.from(memoryStore.bots.values()).filter((b) => b.status === 'RUNNING').length;
    const totalOrders = memoryStore.orders.size;
    const totalTrades = memoryStore.trades.size;

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers: totalUsers,
        activeBots,
        totalOrders,
        totalTrades,
        databaseStatus: { connected: false, mode: 'Resilient Memory Layer' },
        serverUptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users with search
// @route   GET /api/admin/users
const getUsers = async (req, res, next) => {
  try {
    const { search } = req.query;

    if (mongoose.connection.readyState === 1) {
      let query = {};
      if (search) {
        query = {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
          ],
        };
      }
      const users = await User.find(query).select('-password').sort({ createdAt: -1 });
      return res.json({ success: true, count: users.length, data: users });
    }

    let users = Array.from(memoryStore.users.values()).map((u) => ({
      id: u._id || u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      isDemo: u.isDemo,
      createdAt: u.createdAt,
    }));

    if (search) {
      const s = search.toLowerCase();
      users = users.filter((u) => u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s));
    }

    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle user demo status or role
// @route   PUT /api/admin/users/:id
const updateUserRole = async (req, res, next) => {
  try {
    const { role, isDemo } = req.body;
    const targetUserId = req.params.id;

    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(targetUserId);
      if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

      if (role) user.role = role;
      if (isDemo !== undefined) user.isDemo = isDemo;
      await user.save();
      return res.json({ success: true, message: 'User updated successfully.', data: user });
    }

    const user = memoryStore.users.get(targetUserId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    if (role) user.role = role;
    if (isDemo !== undefined) user.isDemo = isDemo;

    res.json({ success: true, message: 'User updated successfully.', data: user });
  } catch (error) {
    next(error);
  }
};

// @desc    Get system activity log
// @route   GET /api/admin/activity
const getActivity = async (req, res, next) => {
  try {
    const { limit = 50 } = req.query;

    if (mongoose.connection.readyState === 1) {
      const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(parseInt(limit, 10));
      return res.json({ success: true, count: logs.length, data: logs });
    }

    const logs = memoryStore.activityLogs.slice(0, parseInt(limit, 10));
    res.json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bots across the system for monitoring
// @route   GET /api/admin/bots
const getSystemBots = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const bots = await Bot.find().populate('userId', 'name email').sort({ updatedAt: -1 });
      return res.json({ success: true, count: bots.length, data: bots });
    }

    const bots = Array.from(memoryStore.bots.values());
    res.json({ success: true, count: bots.length, data: bots });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
  getUsers,
  updateUserRole,
  getActivity,
  getSystemBots,
};
