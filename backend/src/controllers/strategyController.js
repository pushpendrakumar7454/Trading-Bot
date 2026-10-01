const memoryStore = require('../utils/memoryStore');

// @desc    Get all available trading strategies
// @route   GET /api/strategies
const getStrategies = async (req, res, next) => {
  try {
    const list = Array.from(memoryStore.strategies.values());
    res.json({ success: true, count: list.length, data: list });
  } catch (error) {
    next(error);
  }
};

module.exports = { getStrategies };
