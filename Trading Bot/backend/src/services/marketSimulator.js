/**
 * Real-time Simulated Market Engine
 * Generates realistic Brownian motion + mean reversion crypto price movements.
 */

const INITIAL_ASSETS = [
  {
    symbol: 'BTC/USDT',
    name: 'Bitcoin',
    baseCurrency: 'BTC',
    quoteCurrency: 'USDT',
    basePrice: 64250.0,
    volatility: 0.0012, // 0.12% per tick standard dev
    precision: { price: 2, quantity: 4 },
  },
  {
    symbol: 'ETH/USDT',
    name: 'Ethereum',
    baseCurrency: 'ETH',
    quoteCurrency: 'USDT',
    basePrice: 3420.0,
    volatility: 0.0016,
    precision: { price: 2, quantity: 4 },
  },
  {
    symbol: 'SOL/USDT',
    name: 'Solana',
    baseCurrency: 'SOL',
    quoteCurrency: 'USDT',
    basePrice: 148.5,
    volatility: 0.0022,
    precision: { price: 2, quantity: 2 },
  },
  {
    symbol: 'BNB/USDT',
    name: 'BNB',
    baseCurrency: 'BNB',
    quoteCurrency: 'USDT',
    basePrice: 585.0,
    volatility: 0.0014,
    precision: { price: 2, quantity: 3 },
  },
  {
    symbol: 'XRP/USDT',
    name: 'Ripple',
    baseCurrency: 'XRP',
    quoteCurrency: 'USDT',
    basePrice: 0.584,
    volatility: 0.0025,
    precision: { price: 4, quantity: 1 },
  },
  {
    symbol: 'ADA/USDT',
    name: 'Cardano',
    baseCurrency: 'ADA',
    quoteCurrency: 'USDT',
    basePrice: 0.462,
    volatility: 0.0024,
    precision: { price: 4, quantity: 1 },
  },
  {
    symbol: 'DOGE/USDT',
    name: 'Dogecoin',
    baseCurrency: 'DOGE',
    quoteCurrency: 'USDT',
    basePrice: 0.125,
    volatility: 0.0035,
    precision: { price: 5, quantity: 0 },
  },
];

class MarketSimulator {
  constructor() {
    this.assets = new Map();
    this.tickListeners = [];
    this.candleInterval = 60 * 1000; // 1 minute candle
    this.intervalId = null;
    this.init();
  }

  // Generate initial historical candles for smooth charting
  generateHistoricalCandles(basePrice, volatility, count = 100) {
    const candles = [];
    let current = basePrice * 0.94; // slight uptrend historically
    const now = Date.now();
    const step = 60 * 1000; // 1m candles
    const startTime = now - count * step;

    for (let i = 0; i < count; i++) {
      const open = current;
      // random shock with slight mean drift
      const changePercent = (Math.random() - 0.49) * volatility * 8;
      const close = Number((open * (1 + changePercent)).toFixed(4));
      const high = Number((Math.max(open, close) * (1 + Math.random() * volatility * 4)).toFixed(4));
      const low = Number((Math.min(open, close) * (1 - Math.random() * volatility * 4)).toFixed(4));
      const volume = Number((Math.random() * 50 + 10).toFixed(2));

      candles.push({
        time: startTime + i * step,
        open,
        high,
        low,
        close,
        volume,
      });
      current = close;
    }
    return candles;
  }

  init() {
    INITIAL_ASSETS.forEach((cfg) => {
      const candles = this.generateHistoricalCandles(cfg.basePrice, cfg.volatility, 100);
      const lastCandle = candles[candles.length - 1];
      const open24h = candles[0].open;
      const currentPrice = lastCandle.close;
      const high24h = Math.max(...candles.map((c) => c.high));
      const low24h = Math.min(...candles.map((c) => c.low));
      const volume24h = Number(candles.reduce((sum, c) => sum + c.volume, 0).toFixed(2));
      const change24h = Number((currentPrice - open24h).toFixed(cfg.precision.price));
      const changePercent24h = Number((((currentPrice - open24h) / open24h) * 100).toFixed(2));

      this.assets.set(cfg.symbol, {
        symbol: cfg.symbol,
        name: cfg.name,
        baseCurrency: cfg.baseCurrency,
        quoteCurrency: cfg.quoteCurrency,
        price: currentPrice,
        open24h,
        high24h,
        low24h,
        volume24h,
        change24h,
        changePercent24h,
        marketStatus: changePercent24h > 1 ? 'TRENDING_UP' : changePercent24h < -1 ? 'TRENDING_DOWN' : 'OPEN',
        precision: cfg.precision,
        volatility: cfg.volatility,
        basePrice: cfg.basePrice,
        candles,
        currentCandle: { ...lastCandle },
        lastUpdated: Date.now(),
      });
    });
  }

  start() {
    if (this.intervalId) return;
    console.log('[Market Engine] Simulated Market Engine started. Emitting ticks every 1.5s.');
    this.intervalId = setInterval(() => {
      this.step();
    }, 1500);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  onTick(listener) {
    this.tickListeners.push(listener);
  }

  step() {
    const updates = [];
    const now = Date.now();

    for (const [symbol, asset] of this.assets.entries()) {
      // Mean-reversion Brownian Motion
      const mean = asset.basePrice;
      const current = asset.price;
      const reversionDrift = (mean - current) * 0.001; // subtle pull to mean
      const randomShock = (Math.random() - 0.498) * asset.volatility * current;
      let newPrice = current + reversionDrift + randomShock;

      // Ensure price never collapses to 0
      if (newPrice < 0.0001) newPrice = 0.0001;
      newPrice = Number(newPrice.toFixed(asset.precision.price));

      // Update 24h stats
      if (newPrice > asset.high24h) asset.high24h = newPrice;
      if (newPrice < asset.low24h) asset.low24h = newPrice;
      const tickVolume = Number((Math.random() * 2 + 0.2).toFixed(2));
      asset.volume24h = Number((asset.volume24h + tickVolume).toFixed(2));
      asset.price = newPrice;
      asset.change24h = Number((newPrice - asset.open24h).toFixed(asset.precision.price));
      asset.changePercent24h = Number((((newPrice - asset.open24h) / asset.open24h) * 100).toFixed(2));
      asset.lastUpdated = now;

      // Candle building
      let curCandle = asset.currentCandle;
      if (!curCandle || now - curCandle.time >= this.candleInterval) {
        // Roll to new candle
        curCandle = {
          time: Math.floor(now / this.candleInterval) * this.candleInterval,
          open: newPrice,
          high: newPrice,
          low: newPrice,
          close: newPrice,
          volume: tickVolume,
        };
        asset.candles.push(curCandle);
        if (asset.candles.length > 250) {
          asset.candles.shift(); // retain last 250 candles
        }
      } else {
        curCandle.close = newPrice;
        if (newPrice > curCandle.high) curCandle.high = newPrice;
        if (newPrice < curCandle.low) curCandle.low = newPrice;
        curCandle.volume = Number((curCandle.volume + tickVolume).toFixed(2));
      }
      asset.currentCandle = curCandle;

      const payload = {
        symbol: asset.symbol,
        name: asset.name,
        price: asset.price,
        open24h: asset.open24h,
        high24h: asset.high24h,
        low24h: asset.low24h,
        volume24h: asset.volume24h,
        change24h: asset.change24h,
        changePercent24h: asset.changePercent24h,
        marketStatus: asset.marketStatus,
        candle: curCandle,
        timestamp: now,
      };
      updates.push(payload);
    }

    // Notify all listeners (socket, orders, bots, alerts)
    this.tickListeners.forEach((listener) => {
      try {
        listener(updates);
      } catch (err) {
        console.error('[MarketSimulator] Listener error:', err);
      }
    });
  }

  getAllAssets() {
    return Array.from(this.assets.values()).map((a) => ({
      symbol: a.symbol,
      name: a.name,
      baseCurrency: a.baseCurrency,
      quoteCurrency: a.quoteCurrency,
      price: a.price,
      open24h: a.open24h,
      high24h: a.high24h,
      low24h: a.low24h,
      volume24h: a.volume24h,
      change24h: a.change24h,
      changePercent24h: a.changePercent24h,
      marketStatus: a.marketStatus,
      precision: a.precision,
      lastUpdated: a.lastUpdated,
    }));
  }

  getAsset(symbol) {
    const clean = symbol.toUpperCase().replace('-', '/');
    return this.assets.get(clean) || null;
  }

  getCandles(symbol, limit = 100) {
    const asset = this.getAsset(symbol);
    if (!asset) return [];
    return asset.candles.slice(-limit);
  }

  getCurrentPrice(symbol) {
    const asset = this.getAsset(symbol);
    return asset ? asset.price : null;
  }
}

const marketSimulator = new MarketSimulator();
module.exports = marketSimulator;
