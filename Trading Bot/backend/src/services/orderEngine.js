const mongoose = require('mongoose');
const Order = require('../models/Order');
const Trade = require('../models/Trade');
const Position = require('../models/Position');
const Portfolio = require('../models/Portfolio');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');
const marketSimulator = require('./marketSimulator');
const riskService = require('./riskService');
const memoryStore = require('../utils/memoryStore');

class OrderEngine {
  constructor() {
    this.socketEmitter = null;
  }

  setSocketEmitter(emitter) {
    this.socketEmitter = emitter;
  }

  emitUser(userId, event, data) {
    if (this.socketEmitter) {
      this.socketEmitter(userId.toString(), event, data);
    }
  }

  async createOrder(userId, orderData) {
    const {
      asset,
      type = 'MARKET',
      side = 'BUY',
      quantity,
      price: reqPrice,
      stopPrice = null,
      stopLoss = null,
      takeProfit = null,
      botId = null,
      source = 'MANUAL',
    } = orderData;

    const currentPrice = marketSimulator.getCurrentPrice(asset) || reqPrice || 100;
    const executionPrice = type === 'MARKET' ? currentPrice : reqPrice;
    const totalValue = Number((quantity * executionPrice).toFixed(2));

    // 1. Risk Check
    const riskCheck = await riskService.validateOrder(userId, {
      asset,
      side,
      quantity,
      price: executionPrice,
      totalValue,
      isBot: source === 'BOT',
    });

    if (!riskCheck.allowed) {
      // Save rejected order for audit
      const rejectedOrder = await this.saveOrderRecord({
        userId,
        asset,
        type,
        side,
        quantity,
        price: executionPrice,
        totalValue,
        status: 'REJECTED',
        rejectionReason: riskCheck.reason,
        botId,
        source,
      });
      return { success: false, reason: riskCheck.reason, order: rejectedOrder };
    }

    // 2. Determine execution or open status
    let initialStatus = 'OPEN';
    let shouldFillNow = false;

    if (type === 'MARKET') {
      shouldFillNow = true;
    } else if (type === 'LIMIT') {
      if (side === 'BUY' && currentPrice <= reqPrice) shouldFillNow = true;
      if (side === 'SELL' && currentPrice >= reqPrice) shouldFillNow = true;
    } else if (type === 'STOP') {
      if (side === 'BUY' && currentPrice >= reqPrice) shouldFillNow = true;
      if (side === 'SELL' && currentPrice <= reqPrice) shouldFillNow = true;
    }

    const newOrder = await this.saveOrderRecord({
      userId,
      asset,
      type,
      side,
      quantity,
      price: executionPrice,
      stopPrice,
      stopLoss,
      takeProfit,
      totalValue,
      status: shouldFillNow ? 'PENDING' : 'OPEN',
      botId,
      source,
    });

    if (shouldFillNow) {
      const fillResult = await this.executeFill(newOrder, currentPrice);
      return { success: true, order: fillResult.order, trade: fillResult.trade };
    }

    this.emitUser(userId, 'order_created', newOrder);
    return { success: true, order: newOrder };
  }

  async saveOrderRecord(data) {
    if (mongoose.connection.readyState === 1) {
      return await Order.create(data);
    }
    const id = memoryStore.generateId();
    const order = { ...data, _id: id, id, createdAt: new Date(), updatedAt: new Date() };
    memoryStore.orders.set(id, order);
    return order;
  }

  async executeFill(order, fillPrice) {
    const userId = order.userId;
    const fee = Number((order.quantity * fillPrice * 0.001).toFixed(2)); // 0.1% simulated fee
    const totalFilledValue = Number((order.quantity * fillPrice).toFixed(2));

    // Update order status
    order.status = 'FILLED';
    order.filledPrice = fillPrice;
    order.fee = fee;
    order.filledAt = new Date();

    if (mongoose.connection.readyState === 1) {
      await order.save();
    } else {
      memoryStore.orders.set(order._id ? order._id.toString() : order.id, order);
    }

    // 1. Update Portfolio & Holdings
    let portfolio;
    if (mongoose.connection.readyState === 1) {
      portfolio = await Portfolio.findOne({ userId });
    } else {
      portfolio = memoryStore.portfolios.get(userId.toString());
    }

    if (!portfolio) {
      portfolio = {
        userId,
        cashBalance: 10000,
        totalValue: 10000,
        investedValue: 0,
        realizedPnL: 0,
        unrealizedPnL: 0,
        totalPnL: 0,
        dailyPnL: 0,
        holdings: [],
      };
    }

    let tradePnL = 0;
    let tradePnLPercent = 0;

    if (order.side === 'BUY') {
      portfolio.cashBalance = Number((portfolio.cashBalance - totalFilledValue - fee).toFixed(2));

      // Update or create holding
      let holding = portfolio.holdings.find((h) => h.asset === order.asset);
      if (holding) {
        const newTotalCost = holding.totalCost + totalFilledValue;
        const newQty = holding.quantity + order.quantity;
        holding.averageBuyPrice = Number((newTotalCost / newQty).toFixed(4));
        holding.quantity = Number(newQty.toFixed(4));
        holding.totalCost = Number(newTotalCost.toFixed(2));
        holding.currentPrice = fillPrice;
        holding.currentValue = Number((newQty * fillPrice).toFixed(2));
      } else {
        portfolio.holdings.push({
          asset: order.asset,
          quantity: order.quantity,
          averageBuyPrice: fillPrice,
          currentPrice: fillPrice,
          totalCost: totalFilledValue,
          currentValue: totalFilledValue,
          unrealizedPnL: 0,
          unrealizedPnLPercent: 0,
        });
      }

      // Create Position
      await this.createOrUpdatePosition({
        userId,
        asset: order.asset,
        side: 'BUY',
        quantity: order.quantity,
        entryPrice: fillPrice,
        currentPrice: fillPrice,
        stopLoss: order.stopLoss,
        takeProfit: order.takeProfit,
        botId: order.botId,
      });

      // Create BUY Transaction
      await this.recordTransaction({
        userId,
        type: 'BUY',
        amount: totalFilledValue,
        balanceAfter: portfolio.cashBalance,
        asset: order.asset,
        description: `Bought ${order.quantity} ${order.asset} @ ₹${fillPrice}`,
        referenceId: order._id?.toString() || order.id,
      });
    } else {
      // SELL ORDER
      const holding = portfolio.holdings.find((h) => h.asset === order.asset);
      const avgCost = holding ? holding.averageBuyPrice : fillPrice;
      tradePnL = Number(((fillPrice - avgCost) * order.quantity - fee).toFixed(2));
      tradePnLPercent = avgCost > 0 ? Number(((tradePnL / (avgCost * order.quantity)) * 100).toFixed(2)) : 0;

      portfolio.cashBalance = Number((portfolio.cashBalance + totalFilledValue - fee).toFixed(2));
      portfolio.realizedPnL = Number((portfolio.realizedPnL + tradePnL).toFixed(2));
      portfolio.dailyPnL = Number((portfolio.dailyPnL + tradePnL).toFixed(2));

      if (holding) {
        holding.quantity = Math.max(0, Number((holding.quantity - order.quantity).toFixed(4)));
        holding.totalCost = Number((holding.quantity * holding.averageBuyPrice).toFixed(2));
        holding.currentValue = Number((holding.quantity * fillPrice).toFixed(2));
        if (holding.quantity <= 0.00001) {
          portfolio.holdings = portfolio.holdings.filter((h) => h.asset !== order.asset);
        }
      }

      // Close Position
      await this.closePosition(userId, order.asset, order.quantity, fillPrice, tradePnL);

      // Create SELL Transaction
      await this.recordTransaction({
        userId,
        type: 'SELL',
        amount: totalFilledValue,
        balanceAfter: portfolio.cashBalance,
        asset: order.asset,
        description: `Sold ${order.quantity} ${order.asset} @ ₹${fillPrice}. P&L: ₹${tradePnL}`,
        referenceId: order._id?.toString() || order.id,
      });
    }

    // Recompute total portfolio value
    const holdingsVal = portfolio.holdings.reduce(
      (sum, h) => sum + h.quantity * (marketSimulator.getCurrentPrice(h.asset) || h.currentPrice),
      0
    );
    portfolio.investedValue = Number(holdingsVal.toFixed(2));
    portfolio.totalValue = Number((portfolio.cashBalance + portfolio.investedValue).toFixed(2));
    portfolio.totalPnL = Number((portfolio.totalValue - (portfolio.initialBalance || 10000)).toFixed(2));
    portfolio.totalPnLPercent = Number(((portfolio.totalPnL / (portfolio.initialBalance || 10000)) * 100).toFixed(2));

    if (mongoose.connection.readyState === 1) {
      await portfolio.save();
    } else {
      memoryStore.portfolios.set(userId.toString(), portfolio);
    }

    // 2. Create Trade Record
    const tradeData = {
      userId,
      orderId: order._id || order.id,
      botId: order.botId,
      asset: order.asset,
      side: order.side,
      quantity: order.quantity,
      price: fillPrice,
      fee,
      totalValue: totalFilledValue,
      realizedPnL: tradePnL,
      realizedPnLPercent: tradePnLPercent,
      strategy: order.source === 'BOT' ? 'BOT_AUTOMATED' : 'MANUAL',
      source: order.source,
    };

    let trade;
    if (mongoose.connection.readyState === 1) {
      trade = await Trade.create(tradeData);
    } else {
      const tradeId = memoryStore.generateId();
      trade = { ...tradeData, _id: tradeId, id: tradeId, createdAt: new Date() };
      memoryStore.trades.set(tradeId, trade);
    }

    // 3. Notification
    const notif = await this.sendNotification(userId, {
      type: 'ORDER_FILLED',
      title: `${order.side} Order Executed`,
      message: `${order.side} ${order.quantity} ${order.asset} filled at ₹${fillPrice}`,
      metadata: { orderId: order._id || order.id, tradeId: trade._id || trade.id },
    });

    // 4. Activity Log
    await this.logActivity(userId, {
      action: 'ORDER_FILLED',
      entityType: 'ORDER',
      entityId: order._id?.toString() || order.id,
      details: { asset: order.asset, side: order.side, quantity: order.quantity, fillPrice, fee },
    });

    // 5. Emit socket events to user
    this.emitUser(userId, 'order_filled', { order, trade, portfolio });
    this.emitUser(userId, 'portfolio_updated', portfolio);
    this.emitUser(userId, 'notification', notif);

    return { order, trade, portfolio };
  }

  async createOrUpdatePosition(data) {
    if (mongoose.connection.readyState === 1) {
      let pos = await Position.findOne({ userId: data.userId, asset: data.asset, status: 'OPEN' });
      if (pos) {
        const totalQty = pos.quantity + data.quantity;
        pos.entryPrice = Number(((pos.entryPrice * pos.quantity + data.entryPrice * data.quantity) / totalQty).toFixed(4));
        pos.quantity = totalQty;
        pos.currentPrice = data.currentPrice;
        if (data.stopLoss) pos.stopLoss = data.stopLoss;
        if (data.takeProfit) pos.takeProfit = data.takeProfit;
        await pos.save();
        return pos;
      }
      return await Position.create({ ...data, status: 'OPEN' });
    }

    const existing = Array.from(memoryStore.positions.values()).find(
      (p) => p.userId.toString() === data.userId.toString() && p.asset === data.asset && p.status === 'OPEN'
    );
    if (existing) {
      const totalQty = existing.quantity + data.quantity;
      existing.entryPrice = Number(((existing.entryPrice * existing.quantity + data.entryPrice * data.quantity) / totalQty).toFixed(4));
      existing.quantity = totalQty;
      existing.currentPrice = data.currentPrice;
      return existing;
    }
    const id = memoryStore.generateId();
    const pos = { ...data, _id: id, id, status: 'OPEN', openedAt: new Date() };
    memoryStore.positions.set(id, pos);
    return pos;
  }

  async closePosition(userId, asset, quantity, exitPrice, realizedPnL) {
    if (mongoose.connection.readyState === 1) {
      const pos = await Position.findOne({ userId, asset, status: 'OPEN' });
      if (pos) {
        if (pos.quantity <= quantity) {
          pos.status = 'CLOSED';
          pos.closedAt = new Date();
          pos.currentPrice = exitPrice;
          pos.unrealizedPnL = 0;
          await pos.save();
        } else {
          pos.quantity = Number((pos.quantity - quantity).toFixed(4));
          pos.currentPrice = exitPrice;
          await pos.save();
        }
      }
      return;
    }

    const pos = Array.from(memoryStore.positions.values()).find(
      (p) => p.userId.toString() === userId.toString() && p.asset === asset && p.status === 'OPEN'
    );
    if (pos) {
      if (pos.quantity <= quantity) {
        pos.status = 'CLOSED';
        pos.closedAt = new Date();
      } else {
        pos.quantity = Number((pos.quantity - quantity).toFixed(4));
      }
    }
  }

  async recordTransaction(data) {
    if (mongoose.connection.readyState === 1) {
      return await Transaction.create(data);
    }
    const id = memoryStore.generateId();
    const tx = { ...data, _id: id, id, createdAt: new Date() };
    memoryStore.transactions.set(id, tx);
    return tx;
  }

  async sendNotification(userId, data) {
    if (mongoose.connection.readyState === 1) {
      return await Notification.create({ userId, ...data });
    }
    const id = memoryStore.generateId();
    const notif = { ...data, userId: userId.toString(), _id: id, id, read: false, createdAt: new Date() };
    memoryStore.notifications.set(id, notif);
    return notif;
  }

  async logActivity(userId, data) {
    if (mongoose.connection.readyState === 1) {
      return await ActivityLog.create({ userId, ...data });
    }
    const id = memoryStore.generateId();
    const log = { ...data, userId: userId?.toString(), _id: id, id, createdAt: new Date() };
    memoryStore.activityLogs.unshift(log);
    if (memoryStore.activityLogs.length > 500) memoryStore.activityLogs.pop();
    return log;
  }

  // Called on each market tick to check open orders, stop loss & take profit
  async checkOpenOrdersAndStops(ticks) {
    for (const tick of ticks) {
      const { symbol, price } = tick;

      // 1. Check Open Orders for this symbol
      let openOrders = [];
      if (mongoose.connection.readyState === 1) {
        openOrders = await Order.find({ asset: symbol, status: 'OPEN' });
      } else {
        openOrders = Array.from(memoryStore.orders.values()).filter(
          (o) => o.asset === symbol && o.status === 'OPEN'
        );
      }

      for (const order of openOrders) {
        let shouldTrigger = false;
        if (order.type === 'LIMIT') {
          if (order.side === 'BUY' && price <= order.price) shouldTrigger = true;
          if (order.side === 'SELL' && price >= order.price) shouldTrigger = true;
        } else if (order.type === 'STOP') {
          if (order.side === 'BUY' && price >= order.price) shouldTrigger = true;
          if (order.side === 'SELL' && price <= order.price) shouldTrigger = true;
        }

        if (shouldTrigger) {
          await this.executeFill(order, price);
        }
      }

      // 2. Check Open Positions for Stop-Loss & Take-Profit triggers
      let openPositions = [];
      if (mongoose.connection.readyState === 1) {
        openPositions = await Position.find({ asset: symbol, status: 'OPEN' });
      } else {
        openPositions = Array.from(memoryStore.positions.values()).filter(
          (p) => p.asset === symbol && p.status === 'OPEN'
        );
      }

      for (const pos of openPositions) {
        let triggered = false;
        let reason = '';

        if (pos.stopLoss && price <= pos.stopLoss) {
          triggered = true;
          reason = 'STOP_LOSS';
        } else if (pos.takeProfit && price >= pos.takeProfit) {
          triggered = true;
          reason = 'TAKE_PROFIT';
        }

        if (triggered) {
          // Auto close position via Market SELL
          await this.createOrder(pos.userId, {
            asset: pos.asset,
            type: 'MARKET',
            side: 'SELL',
            quantity: pos.quantity,
            price,
            source: 'BOT',
            botId: pos.botId,
          });

          await this.sendNotification(pos.userId, {
            type: reason,
            title: reason === 'STOP_LOSS' ? 'Stop Loss Triggered' : 'Take Profit Triggered',
            message: `${pos.asset} position closed at ₹${price} (${reason})`,
          });
        }
      }
    }
  }
}

const orderEngine = new OrderEngine();
module.exports = orderEngine;
