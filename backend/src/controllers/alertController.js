const mongoose = require('mongoose');
const Alert = require('../models/Alert');
const memoryStore = require('../utils/memoryStore');

// @desc    Get user alerts
// @route   GET /api/alerts
const getAlerts = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;

    if (mongoose.connection.readyState === 1) {
      const alerts = await Alert.find({ userId }).sort({ createdAt: -1 });
      return res.json({ success: true, count: alerts.length, data: alerts });
    }

    const alerts = Array.from(memoryStore.alerts.values())
      .filter((a) => a.userId.toString() === userId.toString())
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ success: true, count: alerts.length, data: alerts });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new alert
// @route   POST /api/alerts
const createAlert = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { asset, condition, targetValue, message } = req.body;

    if (!asset || !condition || targetValue === undefined) {
      return res.status(400).json({ success: false, message: 'Please provide asset, condition, and targetValue.' });
    }

    const alertData = {
      userId,
      asset: asset.toUpperCase(),
      condition,
      targetValue: Number(targetValue),
      message: message || `${condition} reached on ${asset.toUpperCase()}`,
      status: 'ACTIVE',
    };

    if (mongoose.connection.readyState === 1) {
      const alert = await Alert.create(alertData);
      return res.status(201).json({ success: true, message: 'Alert created successfully.', data: alert });
    }

    const id = memoryStore.generateId();
    const alert = { ...alertData, _id: id, id, createdAt: new Date() };
    memoryStore.alerts.set(id, alert);

    res.status(201).json({ success: true, message: 'Alert created successfully.', data: alert });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an alert
// @route   DELETE /api/alerts/:id
const deleteAlert = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const alertId = req.params.id;

    if (mongoose.connection.readyState === 1) {
      const alert = await Alert.findOneAndDelete({ _id: alertId, userId });
      if (!alert) return res.status(404).json({ success: false, message: 'Alert not found.' });
      return res.json({ success: true, message: 'Alert deleted successfully.' });
    }

    const alert = memoryStore.alerts.get(alertId);
    if (!alert || alert.userId.toString() !== userId.toString()) {
      return res.status(404).json({ success: false, message: 'Alert not found.' });
    }

    memoryStore.alerts.delete(alertId);
    res.json({ success: true, message: 'Alert deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAlerts, createAlert, deleteAlert };
