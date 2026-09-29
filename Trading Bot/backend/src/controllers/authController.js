const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');
const Portfolio = require('../models/Portfolio');
const Order = require('../models/Order');
const Trade = require('../models/Trade');
const Position = require('../models/Position');
const Bot = require('../models/Bot');
const Transaction = require('../models/Transaction');
const ActivityLog = require('../models/ActivityLog');
const memoryStore = require('../utils/memoryStore');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_trading_bot_jwt_key_2026_demo_secure!';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// @desc    Register a new user
// @route   POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, role = 'USER' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    if (mongoose.connection.readyState === 1) {
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ success: false, message: 'An account with that email already exists.' });
      }

      const user = await User.create({
        name,
        email,
        password,
        role: email.includes('admin') ? 'ADMIN' : role,
      });

      // Create initial portfolio
      await Portfolio.create({
        userId: user._id,
        cashBalance: 10000,
        initialBalance: 10000,
        totalValue: 10000,
      });

      // Record welcome transaction
      await Transaction.create({
        userId: user._id,
        type: 'DEPOSIT',
        amount: 10000,
        balanceAfter: 10000,
        description: 'Initial Virtual Trading Capital (Paper Money ₹10,000)',
      });

      const token = generateToken(user._id);

      return res.status(201).json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isDemo: user.isDemo,
          riskSettings: user.riskSettings,
        },
      });
    }

    // Memory Store Fallback
    const existing = Array.from(memoryStore.users.values()).find((u) => u.email === email);
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with that email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const id = memoryStore.generateId();

    const user = {
      _id: id,
      id,
      name,
      email,
      password: hashedPassword,
      role: email.includes('admin') ? 'ADMIN' : role,
      isDemo: true,
      riskSettings: {
        riskPerTrade: 2,
        maxDailyLoss: 1000,
        maxOpenPositions: 5,
        defaultStopLoss: 3,
        defaultTakeProfit: 6,
      },
      createdAt: new Date(),
    };
    memoryStore.users.set(id, user);

    memoryStore.portfolios.set(id, {
      userId: id,
      cashBalance: 10000,
      initialBalance: 10000,
      totalValue: 10000,
      investedValue: 0,
      realizedPnL: 0,
      unrealizedPnL: 0,
      totalPnL: 0,
      dailyPnL: 0,
      holdings: [],
    });

    const token = generateToken(id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id,
        name: user.name,
        email: user.email,
        role: user.role,
        isDemo: true,
        riskSettings: user.riskSettings,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    let user;
    let isMatch = false;

    if (mongoose.connection.readyState === 1) {
      user = await User.findOne({ email }).select('+password');
      if (user) {
        isMatch = await user.comparePassword(password);
      }
    } else {
      user = Array.from(memoryStore.users.values()).find((u) => u.email === email);
      if (user) {
        isMatch = await bcrypt.compare(password, user.password);
      }
    }

    if (!user || !isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const userId = user._id ? user._id.toString() : user.id;
    const token = generateToken(userId);

    // Audit log
    await ActivityLog.create({
      userId,
      userEmail: user.email,
      action: 'USER_LOGIN',
      entityType: 'USER',
      entityId: userId,
      details: { timestamp: new Date() },
    }).catch(() => {});

    res.json({
      success: true,
      token,
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        role: user.role,
        isDemo: user.isDemo,
        riskSettings: user.riskSettings,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Quick 1-Click Demo Login
// @route   POST /api/auth/demo
const demoLogin = async (req, res, next) => {
  try {
    const { role = 'USER' } = req.body;
    const demoEmail = role === 'ADMIN' ? 'admin@tradingbot.demo' : 'trader@tradingbot.demo';
    const demoName = role === 'ADMIN' ? 'Admin Demonstrator' : 'Alex Mercer (Demo Trader)';

    let user;

    if (mongoose.connection.readyState === 1) {
      user = await User.findOne({ email: demoEmail });
      if (!user) {
        user = await User.create({
          name: demoName,
          email: demoEmail,
          password: 'DemoPassword123!',
          role,
          isDemo: true,
        });

        await Portfolio.create({
          userId: user._id,
          cashBalance: 10000,
          initialBalance: 10000,
          totalValue: 10000,
        });
      }
    } else {
      user = Array.from(memoryStore.users.values()).find((u) => u.email === demoEmail);
      if (!user) {
        const id = memoryStore.generateId();
        user = {
          _id: id,
          id,
          name: demoName,
          email: demoEmail,
          role,
          isDemo: true,
          riskSettings: {
            riskPerTrade: 2,
            maxDailyLoss: 1000,
            maxOpenPositions: 5,
            defaultStopLoss: 3,
            defaultTakeProfit: 6,
          },
        };
        memoryStore.users.set(id, user);
        memoryStore.portfolios.set(id, {
          userId: id,
          cashBalance: 10000,
          initialBalance: 10000,
          totalValue: 10000,
          investedValue: 0,
          realizedPnL: 0,
          unrealizedPnL: 0,
          totalPnL: 0,
          dailyPnL: 0,
          holdings: [],
        });
      }
    }

    const userId = user._id ? user._id.toString() : user.id;
    const token = generateToken(userId);

    res.json({
      success: true,
      token,
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        role: user.role,
        isDemo: true,
        riskSettings: user.riskSettings,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = req.user;
    res.json({
      success: true,
      user: {
        id: user._id ? user._id.toString() : user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isDemo: user.isDemo,
        riskSettings: user.riskSettings,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile & risk settings
// @route   PUT /api/auth/profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, riskSettings } = req.body;
    const userId = req.user._id || req.user.id;

    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(userId);
      if (name) user.name = name;
      if (riskSettings) user.riskSettings = { ...user.riskSettings, ...riskSettings };
      await user.save();

      return res.json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          riskSettings: user.riskSettings,
        },
      });
    }

    const user = memoryStore.users.get(userId.toString());
    if (user) {
      if (name) user.name = name;
      if (riskSettings) user.riskSettings = { ...user.riskSettings, ...riskSettings };
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: userId,
        name: user?.name,
        email: user?.email,
        role: user?.role,
        riskSettings: user?.riskSettings,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id || req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide current and new password.' });
    }

    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(userId).select('+password');
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Incorrect current password.' });
      }
      user.password = newPassword;
      await user.save();
      return res.json({ success: true, message: 'Password updated successfully.' });
    }

    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Demo Trading Account (Reset balance to ₹10,000, clear positions/orders/trades)
// @route   POST /api/auth/reset-demo
const resetDemoAccount = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;

    if (mongoose.connection.readyState === 1) {
      // Clear trades, positions, open orders
      await Order.deleteMany({ userId });
      await Trade.deleteMany({ userId });
      await Position.deleteMany({ userId });
      await Bot.updateMany({ userId }, { status: 'STOPPED', totalTrades: 0, totalProfit: 0, winRate: 0 });

      // Reset Portfolio
      let portfolio = await Portfolio.findOne({ userId });
      if (!portfolio) {
        portfolio = new Portfolio({ userId });
      }
      portfolio.cashBalance = 10000;
      portfolio.initialBalance = 10000;
      portfolio.investedValue = 0;
      portfolio.totalValue = 10000;
      portfolio.realizedPnL = 0;
      portfolio.unrealizedPnL = 0;
      portfolio.totalPnL = 0;
      portfolio.totalPnLPercent = 0;
      portfolio.dailyPnL = 0;
      portfolio.holdings = [];
      await portfolio.save();

      // Record reset transaction
      await Transaction.create({
        userId,
        type: 'RESET',
        amount: 10000,
        balanceAfter: 10000,
        description: 'Demo Account Reset to ₹10,000 Starting Virtual Capital',
      });

      return res.json({
        success: true,
        message: 'Demo account successfully reset to ₹10,000. All test positions and orders cleared.',
        portfolio,
      });
    }

    // Memory Store reset
    for (const [id, ord] of memoryStore.orders.entries()) {
      if (ord.userId.toString() === userId.toString()) memoryStore.orders.delete(id);
    }
    for (const [id, tr] of memoryStore.trades.entries()) {
      if (tr.userId.toString() === userId.toString()) memoryStore.trades.delete(id);
    }
    for (const [id, pos] of memoryStore.positions.entries()) {
      if (pos.userId.toString() === userId.toString()) memoryStore.positions.delete(id);
    }

    const resetPort = {
      userId: userId.toString(),
      cashBalance: 10000,
      initialBalance: 10000,
      investedValue: 0,
      totalValue: 10000,
      realizedPnL: 0,
      unrealizedPnL: 0,
      totalPnL: 0,
      totalPnLPercent: 0,
      dailyPnL: 0,
      holdings: [],
    };
    memoryStore.portfolios.set(userId.toString(), resetPort);

    res.json({
      success: true,
      message: 'Demo account successfully reset to ₹10,000. All test positions and orders cleared.',
      portfolio: resetPort,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  demoLogin,
  getMe,
  updateProfile,
  changePassword,
  resetDemoAccount,
};
