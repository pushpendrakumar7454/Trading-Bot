/**
 * Quantitative Technical Indicators calculation library
 */

// Simple Moving Average
const calculateSMA = (prices, period = 14) => {
  const result = [];
  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else {
      const slice = prices.slice(i - period + 1, i + 1);
      const sum = slice.reduce((acc, val) => acc + val, 0);
      result.push(Number((sum / period).toFixed(2)));
    }
  }
  return result;
};

// Exponential Moving Average
const calculateEMA = (prices, period = 14) => {
  const result = [];
  const multiplier = 2 / (period + 1);
  let previousEMA = null;

  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else if (i === period - 1) {
      const slice = prices.slice(0, period);
      previousEMA = slice.reduce((acc, val) => acc + val, 0) / period;
      result.push(Number(previousEMA.toFixed(2)));
    } else {
      const currentEMA = (prices[i] - previousEMA) * multiplier + previousEMA;
      previousEMA = currentEMA;
      result.push(Number(currentEMA.toFixed(2)));
    }
  }
  return result;
};

// Relative Strength Index (RSI - Wilder's Smoothing)
const calculateRSI = (prices, period = 14) => {
  if (prices.length <= period) return prices.map(() => 50);

  const result = [];
  const gains = [];
  const losses = [];

  for (let i = 1; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    gains.push(diff > 0 ? diff : 0);
    losses.push(diff < 0 ? Math.abs(diff) : 0);
  }

  // Initial padding
  for (let i = 0; i < period; i++) {
    result.push(50);
  }

  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  let rsi = avgLoss === 0 ? 100 : 100 - (100 / (1 + rs));
  result.push(Number(rsi.toFixed(2)));

  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
    rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsi = avgLoss === 0 ? 100 : 100 - (100 / (1 + rs));
    result.push(Number(rsi.toFixed(2)));
  }

  return result;
};

// Moving Average Convergence Divergence (MACD)
const calculateMACD = (prices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) => {
  const fastEMA = calculateEMA(prices, fastPeriod);
  const slowEMA = calculateEMA(prices, slowPeriod);

  const macdLine = [];
  for (let i = 0; i < prices.length; i++) {
    if (fastEMA[i] === null || slowEMA[i] === null) {
      macdLine.push(null);
    } else {
      macdLine.push(fastEMA[i] - slowEMA[i]);
    }
  }

  const validMacdValues = macdLine.filter((v) => v !== null);
  const validSignal = calculateEMA(validMacdValues, signalPeriod);

  const signalLine = [];
  const histogram = [];
  let sigIdx = 0;

  for (let i = 0; i < prices.length; i++) {
    if (macdLine[i] === null) {
      signalLine.push(null);
      histogram.push(null);
    } else {
      const sig = validSignal[sigIdx] !== undefined ? validSignal[sigIdx] : null;
      signalLine.push(sig);
      histogram.push(sig !== null ? Number((macdLine[i] - sig).toFixed(2)) : null);
      sigIdx++;
    }
  }

  return {
    macd: macdLine.map((v) => (v !== null ? Number(v.toFixed(2)) : null)),
    signal: signalLine,
    histogram: histogram,
  };
};

// Bollinger Bands (SMA, Upper, Lower)
const calculateBollingerBands = (prices, period = 20, multiplier = 2) => {
  const sma = calculateSMA(prices, period);
  const upper = [];
  const lower = [];

  for (let i = 0; i < prices.length; i++) {
    if (sma[i] === null) {
      upper.push(null);
      lower.push(null);
    } else {
      const slice = prices.slice(i - period + 1, i + 1);
      const mean = sma[i];
      const variance = slice.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / period;
      const stdDev = Math.sqrt(variance);
      upper.push(Number((mean + multiplier * stdDev).toFixed(2)));
      lower.push(Number((mean - multiplier * stdDev).toFixed(2)));
    }
  }

  return { middle: sma, upper, lower };
};

// Momentum (ROC - Rate of Change)
const calculateMomentum = (prices, period = 10) => {
  const result = [];
  for (let i = 0; i < prices.length; i++) {
    if (i < period) {
      result.push(0);
    } else {
      const prev = prices[i - period];
      const roc = prev > 0 ? ((prices[i] - prev) / prev) * 100 : 0;
      result.push(Number(roc.toFixed(2)));
    }
  }
  return result;
};

module.exports = {
  calculateSMA,
  calculateEMA,
  calculateRSI,
  calculateMACD,
  calculateBollingerBands,
  calculateMomentum,
};
