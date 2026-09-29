/**
 * In-memory resilient data layer fallback
 * Automatically active if MongoDB is unavailable or disconnected.
 */
const crypto = require('crypto');

class MemoryStore {
  constructor() {
    this.users = new Map();
    this.portfolios = new Map();
    this.orders = new Map();
    this.trades = new Map();
    this.positions = new Map();
    this.bots = new Map();
    this.strategies = new Map();
    this.alerts = new Map();
    this.notifications = new Map();
    this.backtests = new Map();
    this.watchlists = new Map();
    this.transactions = new Map();
    this.activityLogs = [];

    this.initDefaultStrategies();
  }

  generateId() {
    return crypto.randomBytes(12).toString('hex');
  }

  initDefaultStrategies() {
    const defaultStrats = [
      {
        id: 'strat_ma_cross',
        name: 'Moving Average Crossover',
        slug: 'MA_CROSSOVER',
        category: 'Trend',
        description: 'Golden Cross & Death Cross strategy using Fast SMA (9) and Slow SMA (21).',
        indicators: ['SMA(9)', 'SMA(21)'],
        entryConditions: 'Fast SMA crosses above Slow SMA (Bullish Signal)',
        exitConditions: 'Fast SMA crosses below Slow SMA (Bearish Signal)',
        defaultParameters: { fastPeriod: 9, slowPeriod: 21 },
        riskParameters: { stopLossPercent: 2.5, takeProfitPercent: 5.0 },
      },
      {
        id: 'strat_rsi',
        name: 'RSI Mean Reversion',
        slug: 'RSI_STRATEGY',
        category: 'Mean Reversion',
        description: 'Captures oversold bounce (< 30) and overbought reversal (> 70) with 14-period RSI.',
        indicators: ['RSI(14)'],
        entryConditions: 'RSI drops below 30 and crosses back above (Oversold condition)',
        exitConditions: 'RSI climbs above 70 or hits take profit (Overbought condition)',
        defaultParameters: { period: 14, oversold: 30, overbought: 70 },
        riskParameters: { stopLossPercent: 2.0, takeProfitPercent: 4.5 },
      },
      {
        id: 'strat_macd',
        name: 'MACD Momentum Divergence',
        slug: 'MACD_STRATEGY',
        category: 'Momentum',
        description: 'Detects trend shifts when MACD line crosses the 9-period Signal line with histogram confirmation.',
        indicators: ['MACD(12,26,9)'],
        entryConditions: 'MACD line crosses above Signal line and Histogram is positive',
        exitConditions: 'MACD line crosses below Signal line',
        defaultParameters: { fast: 12, slow: 26, signal: 9 },
        riskParameters: { stopLossPercent: 3.0, takeProfitPercent: 6.0 },
      },
      {
        id: 'strat_bb',
        name: 'Bollinger Bands Volatility Breakout',
        slug: 'BOLLINGER_BANDS',
        category: 'Volatility',
        description: 'Trades dynamic price envelope deviations: buys at lower band touch, exits at upper band.',
        indicators: ['BB(20,2)'],
        entryConditions: 'Price touches lower band and closes higher',
        exitConditions: 'Price reaches upper band or 20-period moving average',
        defaultParameters: { period: 20, stdDev: 2 },
        riskParameters: { stopLossPercent: 2.5, takeProfitPercent: 5.0 },
      },
      {
        id: 'strat_momentum',
        name: 'Price Rate of Change Momentum',
        slug: 'MOMENTUM',
        category: 'Momentum',
        description: 'Enters on sudden velocity spikes in price rate-of-change with high 24h volume expansion.',
        indicators: ['Momentum(10)', 'Volume(20)'],
        entryConditions: '10-period ROC > 2.5% and volume > 1.5x average',
        exitConditions: 'Momentum drops below 0 or trailing stop triggered',
        defaultParameters: { period: 10, threshold: 2.5 },
        riskParameters: { stopLossPercent: 3.0, takeProfitPercent: 7.0 },
      },
      {
        id: 'strat_trend',
        name: 'Exponential Trend Following',
        slug: 'TREND_FOLLOWING',
        category: 'Trend',
        description: 'Follows established structural trends using EMA 20, EMA 50, and EMA 200 alignment.',
        indicators: ['EMA(20)', 'EMA(50)', 'EMA(200)'],
        entryConditions: 'EMA(20) > EMA(50) > EMA(200) and price pulls back to EMA(20)',
        exitConditions: 'Price closes below EMA(50)',
        defaultParameters: { shortPeriod: 20, medPeriod: 50, longPeriod: 200 },
        riskParameters: { stopLossPercent: 3.5, takeProfitPercent: 8.0 },
      },
    ];

    defaultStrats.forEach((s) => this.strategies.set(s.slug, s));
  }
}

const memoryStore = new MemoryStore();
module.exports = memoryStore;
