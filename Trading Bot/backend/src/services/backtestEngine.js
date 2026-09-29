const indicators = require('../utils/indicators');
const marketSimulator = require('./marketSimulator');

class BacktestEngine {
  runBacktest(params) {
    const {
      asset = 'BTC/USDT',
      strategy = 'MA_CROSSOVER',
      startingCapital = 10000,
      riskPerTrade = 2, // %
      stopLoss = 3, // %
      takeProfit = 6, // %
      candlesCount = 200,
    } = params;

    // Get or generate realistic historical candles
    const assetCfg = marketSimulator.getAsset(asset) || {
      basePrice: 64000,
      volatility: 0.0015,
      precision: { price: 2 },
    };

    const historicalCandles = marketSimulator.generateHistoricalCandles(
      assetCfg.basePrice || 64000,
      assetCfg.volatility || 0.0015,
      Math.max(120, candlesCount)
    );

    const closePrices = historicalCandles.map((c) => c.close);
    let capital = startingCapital;
    let peakCapital = startingCapital;
    let maxDrawdown = 0;

    const equityCurve = [];
    const trades = [];
    let currentPosition = null;

    // Run simulation step by step through candle window
    for (let i = 30; i < historicalCandles.length; i++) {
      const currentCandle = historicalCandles[i];
      const currentPrice = currentCandle.close;
      const windowPrices = closePrices.slice(0, i + 1);

      // Check Stop Loss & Take Profit if in position
      if (currentPosition) {
        let shouldExit = false;
        let exitPrice = currentPrice;
        let exitReason = 'SIGNAL';

        if (currentPosition.stopLoss && currentPrice <= currentPosition.stopLoss) {
          shouldExit = true;
          exitPrice = currentPosition.stopLoss;
          exitReason = 'STOP_LOSS';
        } else if (currentPosition.takeProfit && currentPrice >= currentPosition.takeProfit) {
          shouldExit = true;
          exitPrice = currentPosition.takeProfit;
          exitReason = 'TAKE_PROFIT';
        }

        if (shouldExit) {
          const fee = Number((currentPosition.quantity * exitPrice * 0.001).toFixed(2));
          const grossPnl = (exitPrice - currentPosition.entryPrice) * currentPosition.quantity;
          const pnl = Number((grossPnl - fee).toFixed(2));
          const pnlPercent = Number(((pnl / currentPosition.invested) * 100).toFixed(2));

          capital = Number((capital + currentPosition.invested + pnl).toFixed(2));

          trades.push({
            id: `bt_${trades.length + 1}`,
            side: 'BUY',
            entryPrice: currentPosition.entryPrice,
            exitPrice,
            quantity: currentPosition.quantity,
            pnl,
            pnlPercent,
            reason: exitReason,
            entryTime: new Date(currentPosition.entryTime).toLocaleDateString(),
            exitTime: new Date(currentCandle.time).toLocaleDateString(),
          });

          currentPosition = null;
        }
      }

      // Generate strategy signal
      const signal = this.evaluateSignal(strategy, windowPrices);

      if (signal === 'BUY' && !currentPosition && capital > 100) {
        const tradeAmount = Number((capital * (riskPerTrade / 100) * 4).toFixed(2));
        const alloc = Math.min(capital * 0.85, Math.max(100, tradeAmount));
        const qty = Number((alloc / currentPrice).toFixed(4));
        const fee = Number((alloc * 0.001).toFixed(2));

        if (qty > 0.0001 && capital >= alloc + fee) {
          capital = Number((capital - alloc - fee).toFixed(2));
          currentPosition = {
            entryPrice: currentPrice,
            quantity: qty,
            invested: alloc,
            entryTime: currentCandle.time,
            stopLoss: stopLoss ? Number((currentPrice * (1 - stopLoss / 100)).toFixed(2)) : null,
            takeProfit: takeProfit ? Number((currentPrice * (1 + takeProfit / 100)).toFixed(2)) : null,
          };
        }
      } else if (signal === 'SELL' && currentPosition) {
        const exitPrice = currentPrice;
        const fee = Number((currentPosition.quantity * exitPrice * 0.001).toFixed(2));
        const grossPnl = (exitPrice - currentPosition.entryPrice) * currentPosition.quantity;
        const pnl = Number((grossPnl - fee).toFixed(2));
        const pnlPercent = Number(((pnl / currentPosition.invested) * 100).toFixed(2));

        capital = Number((capital + currentPosition.invested + pnl).toFixed(2));

        trades.push({
          id: `bt_${trades.length + 1}`,
          side: 'BUY',
          entryPrice: currentPosition.entryPrice,
          exitPrice,
          quantity: currentPosition.quantity,
          pnl,
          pnlPercent,
          reason: 'STRATEGY_SIGNAL',
          entryTime: new Date(currentPosition.entryTime).toLocaleDateString(),
          exitTime: new Date(currentCandle.time).toLocaleDateString(),
        });

        currentPosition = null;
      }

      // Calculate current equity
      const currentHoldingValue = currentPosition ? currentPosition.quantity * currentPrice : 0;
      const currentEquity = Number((capital + currentHoldingValue).toFixed(2));

      if (currentEquity > peakCapital) {
        peakCapital = currentEquity;
      }
      const currentDD = peakCapital > 0 ? Number((((peakCapital - currentEquity) / peakCapital) * 100).toFixed(2)) : 0;
      if (currentDD > maxDrawdown) {
        maxDrawdown = currentDD;
      }

      equityCurve.push({
        time: new Date(currentCandle.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        equity: currentEquity,
        drawdown: currentDD,
      });
    }

    // Close any leftover position at end of backtest
    if (currentPosition) {
      const lastCandle = historicalCandles[historicalCandles.length - 1];
      const exitPrice = lastCandle.close;
      const fee = Number((currentPosition.quantity * exitPrice * 0.001).toFixed(2));
      const pnl = Number(((exitPrice - currentPosition.entryPrice) * currentPosition.quantity - fee).toFixed(2));
      const pnlPercent = Number(((pnl / currentPosition.invested) * 100).toFixed(2));
      capital = Number((capital + currentPosition.invested + pnl).toFixed(2));

      trades.push({
        id: `bt_${trades.length + 1}`,
        side: 'BUY',
        entryPrice: currentPosition.entryPrice,
        exitPrice,
        quantity: currentPosition.quantity,
        pnl,
        pnlPercent,
        reason: 'BACKTEST_END',
        entryTime: new Date(currentPosition.entryTime).toLocaleDateString(),
        exitTime: new Date(lastCandle.time).toLocaleDateString(),
      });
      currentPosition = null;
    }

    const endingCapital = Number(capital.toFixed(2));
    const totalReturn = Number((endingCapital - startingCapital).toFixed(2));
    const totalReturnPercent = Number(((totalReturn / startingCapital) * 100).toFixed(2));
    const totalTrades = trades.length;
    const winningTrades = trades.filter((t) => t.pnl > 0).length;
    const losingTrades = trades.filter((t) => t.pnl <= 0).length;
    const winRate = totalTrades > 0 ? Number(((winningTrades / totalTrades) * 100).toFixed(1)) : 0;

    const winAmounts = trades.filter((t) => t.pnl > 0).map((t) => t.pnl);
    const lossAmounts = trades.filter((t) => t.pnl < 0).map((t) => Math.abs(t.pnl));

    const totalWins = winAmounts.reduce((a, b) => a + b, 0);
    const totalLosses = lossAmounts.reduce((a, b) => a + b, 0);

    const averageWin = winningTrades > 0 ? Number((totalWins / winningTrades).toFixed(2)) : 0;
    const averageLoss = losingTrades > 0 ? Number((totalLosses / losingTrades).toFixed(2)) : 0;
    const profitFactor = totalLosses > 0 ? Number((totalWins / totalLosses).toFixed(2)) : totalWins > 0 ? 9.99 : 1.0;

    return {
      asset,
      strategy,
      timeframe: '1m',
      startingCapital,
      endingCapital,
      totalReturn,
      totalReturnPercent,
      totalTrades,
      winningTrades,
      losingTrades,
      winRate,
      averageWin,
      averageLoss,
      maxDrawdown,
      profitFactor,
      equityCurve: equityCurve.slice(-60), // send smooth readable curve
      trades: trades.reverse(), // most recent first
      parameters: { riskPerTrade, stopLoss, takeProfit },
      createdAt: new Date(),
    };
  }

  evaluateSignal(strategy, prices) {
    const len = prices.length;
    if (len < 25) return 'HOLD';

    switch (strategy) {
      case 'MA_CROSSOVER': {
        const fast = indicators.calculateSMA(prices, 9);
        const slow = indicators.calculateSMA(prices, 21);
        if (fast[len - 2] <= slow[len - 2] && fast[len - 1] > slow[len - 1]) return 'BUY';
        if (fast[len - 2] >= slow[len - 2] && fast[len - 1] < slow[len - 1]) return 'SELL';
        return 'HOLD';
      }
      case 'RSI_STRATEGY': {
        const rsi = indicators.calculateRSI(prices, 14);
        if (rsi[len - 1] < 30) return 'BUY';
        if (rsi[len - 1] > 70) return 'SELL';
        return 'HOLD';
      }
      case 'MACD_STRATEGY': {
        const macd = indicators.calculateMACD(prices);
        if (macd.macd[len - 2] <= macd.signal[len - 2] && macd.macd[len - 1] > macd.signal[len - 1]) return 'BUY';
        if (macd.macd[len - 2] >= macd.signal[len - 2] && macd.macd[len - 1] < macd.signal[len - 1]) return 'SELL';
        return 'HOLD';
      }
      case 'BOLLINGER_BANDS': {
        const bb = indicators.calculateBollingerBands(prices, 20, 2);
        if (prices[len - 1] <= bb.lower[len - 1]) return 'BUY';
        if (prices[len - 1] >= bb.upper[len - 1]) return 'SELL';
        return 'HOLD';
      }
      case 'MOMENTUM': {
        const roc = indicators.calculateMomentum(prices, 10);
        if (roc[len - 1] > 2.0) return 'BUY';
        if (roc[len - 1] < -2.0) return 'SELL';
        return 'HOLD';
      }
      case 'TREND_FOLLOWING': {
        const ema20 = indicators.calculateEMA(prices, 20);
        const ema50 = indicators.calculateEMA(prices, 50);
        if (ema20[len - 1] > ema50[len - 1] && prices[len - 1] > ema20[len - 1]) return 'BUY';
        if (ema20[len - 1] < ema50[len - 1] && prices[len - 1] < ema20[len - 1]) return 'SELL';
        return 'HOLD';
      }
      default:
        return 'HOLD';
    }
  }
}

const backtestEngine = new BacktestEngine();
module.exports = backtestEngine;
