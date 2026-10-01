const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/trading_bot';
  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.warn(`[MongoDB] Connection failed: ${error.message}. Enabling resilient fallback layer.`);
    isConnected = false;
  }
};

const getStatus = () => ({
  connected: mongoose.connection.readyState === 1,
  host: mongoose.connection.host || 'local',
  dbName: mongoose.connection.name || 'trading_bot',
});

module.exports = { connectDB, getStatus };
