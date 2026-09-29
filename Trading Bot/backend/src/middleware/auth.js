const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const memoryStore = require('../utils/memoryStore');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_trading_bot_jwt_key_2026_demo_secure!';

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. Please log in.',
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    let user;

    if (mongoose.connection.readyState === 1) {
      user = await User.findById(decoded.id).select('-password');
    } else {
      user = memoryStore.users.get(decoded.id);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token. Please log in again.',
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role (${req.user?.role || 'NONE'}) is not authorized to access this resource.`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
