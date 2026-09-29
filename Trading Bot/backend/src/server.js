require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { connectDB } = require('./config/db');
const marketSimulator = require('./services/marketSimulator');
const orderEngine = require('./services/orderEngine');
const botEngine = require('./services/botEngine');
const mongoose = require('mongoose');
const Alert = require('./models/Alert');
const Notification = require('./models/Notification');
const memoryStore = require('./utils/memoryStore');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Socket.IO configuration
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Configure order engine socket emitter
orderEngine.setSocketEmitter((userId, event, data) => {
  io.to(`user_${userId}`).emit(event, data);
});

// Socket connection lifecycle
io.on('connection', (socket) => {
  // Automatically subscribe to market ticks
  socket.join('market_feed');

  // Send immediate initial assets snapshot
  socket.emit('initial_market_data', marketSimulator.getAllAssets());

  socket.on('join_user', (userId) => {
    if (userId) {
      socket.join(`user_${userId}`);
    }
  });

  socket.on('leave_user', (userId) => {
    if (userId) {
      socket.leave(`user_${userId}`);
    }
  });

  socket.on('disconnect', () => {});
});

// Helper for checking price alerts on market ticks
async function checkAlerts(ticks) {
  for (const tick of ticks) {
    const { symbol, price } = tick;

    let activeAlerts = [];
    if (mongoose.connection.readyState === 1) {
      activeAlerts = await Alert.find({ asset: symbol, status: 'ACTIVE' });
    } else {
      activeAlerts = Array.from(memoryStore.alerts.values()).filter(
        (a) => a.asset === symbol && a.status === 'ACTIVE'
      );
    }

    for (const alert of activeAlerts) {
      let triggered = false;
      if (alert.condition === 'PRICE_ABOVE' && price >= alert.targetValue) {
        triggered = true;
      } else if (alert.condition === 'PRICE_BELOW' && price <= alert.targetValue) {
        triggered = true;
      }

      if (triggered) {
        alert.status = 'TRIGGERED';
        alert.triggeredAt = new Date();

        if (mongoose.connection.readyState === 1) {
          await alert.save();
          await Notification.create({
            userId: alert.userId,
            type: 'PRICE_ALERT',
            title: `Price Alert: ${symbol}`,
            message: `${symbol} reached target of ₹${alert.targetValue} (Current: ₹${price})`,
            metadata: { symbol, price, target: alert.targetValue },
          });
        } else {
          const notifId = memoryStore.generateId();
          memoryStore.notifications.set(notifId, {
            id: notifId,
            userId: alert.userId.toString(),
            type: 'PRICE_ALERT',
            title: `Price Alert: ${symbol}`,
            message: `${symbol} reached target of ₹${alert.targetValue} (Current: ₹${price})`,
            read: false,
            createdAt: new Date(),
          });
        }

        io.to(`user_${alert.userId}`).emit('alert_triggered', {
          alertId: alert._id || alert.id,
          symbol,
          price,
          targetValue: alert.targetValue,
        });
      }
    }
  }
}

// Connect Database & Launch Market Simulation
async function startServer() {
  await connectDB();

  // Listen to simulator ticks
  marketSimulator.onTick(async (ticks) => {
    // 1. Broadcast real-time prices to frontend
    io.to('market_feed').emit('market_ticks', ticks);

    // 2. Check and fill open limit/stop orders and position stops
    await orderEngine.checkOpenOrdersAndStops(ticks);

    // 3. Evaluate running bot strategies
    await botEngine.evaluateBots(ticks);

    // 4. Check price alerts
    await checkAlerts(ticks);
  });

  // Start market simulation engine
  marketSimulator.start();

  server.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 Trading Bot Engine Backend Running on port ${PORT}`);
    console.log(`📡 WebSocket / Socket.IO Live at ws://localhost:${PORT}`);
    console.log(`📈 Simulated Crypto Market Generator: ACTIVE`);
    console.log(`=======================================================`);
  });
}

startServer().catch((err) => {
  console.error('Fatal Server Boot Error:', err);
});
