const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const memoryStore = require('../utils/memoryStore');

// @desc    Get all notifications for user
// @route   GET /api/notifications
const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;

    if (mongoose.connection.readyState === 1) {
      const notifications = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(50);
      const unreadCount = await Notification.countDocuments({ userId, read: false });
      return res.json({ success: true, count: notifications.length, unreadCount, data: notifications });
    }

    const notifications = Array.from(memoryStore.notifications.values())
      .filter((n) => n.userId.toString() === userId.toString())
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 50);

    const unreadCount = notifications.filter((n) => !n.read).length;
    res.json({ success: true, count: notifications.length, unreadCount, data: notifications });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark single notification as read
// @route   PUT /api/notifications/:id/read
const markAsRead = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const notifId = req.params.id;

    if (mongoose.connection.readyState === 1) {
      const notif = await Notification.findOneAndUpdate(
        { _id: notifId, userId },
        { read: true },
        { new: true }
      );
      if (!notif) return res.status(404).json({ success: false, message: 'Notification not found.' });
      return res.json({ success: true, data: notif });
    }

    const notif = memoryStore.notifications.get(notifId);
    if (!notif || notif.userId.toString() !== userId.toString()) {
      return res.status(404).json({ success: false, message: 'Notification not found.' });
    }
    notif.read = true;
    res.json({ success: true, data: notif });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;

    if (mongoose.connection.readyState === 1) {
      await Notification.updateMany({ userId, read: false }, { read: true });
      return res.json({ success: true, message: 'All notifications marked as read.' });
    }

    for (const notif of memoryStore.notifications.values()) {
      if (notif.userId.toString() === userId.toString()) notif.read = true;
    }
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getNotifications, markAsRead, markAllAsRead };
