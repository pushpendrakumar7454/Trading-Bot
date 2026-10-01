const marketSimulator = require('../services/marketSimulator');
const indicators = require('../utils/indicators');

// @desc    Get all markets / assets with 24h stats
// @route   GET /api/markets
const getMarkets = async (req, res, next) => {
  try {
    const assets = marketSimulator.getAllAssets();
    res.json({ success: true, count: assets.length, data: assets });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single market detail with calculated indicators
// @route   GET /api/markets/:symbol
const getMarketBySymbol = async (req, res, next) => {
  try {
    const symbol = decodeURIComponent(req.params.symbol).toUpperCase();
    const asset = marketSimulator.getAsset(symbol);

    if (!asset) {
      return res.status(404).json({ success: false, message: `Market asset "${symbol}" not found.` });
    }

    const candles = marketSimulator.getCandles(symbol, 100);
    const closePrices = candles.map((c) => c.close);

    // Dynamic indicators computed live
    const sma20 = indicators.calculateSMA(closePrices, 20);
    const ema50 = indicators.calculateEMA(closePrices, 50);
    const rsi = indicators.calculateRSI(closePrices, 14);
    const macd = indicators.calculateMACD(closePrices);
    const bb = indicators.calculateBollingerBands(closePrices, 20, 2);

    res.json({
      success: true,
      data: {
        symbol: asset.symbol,
        name: asset.name,
        baseCurrency: asset.baseCurrency,
        quoteCurrency: asset.quoteCurrency,
        price: asset.price,
        open24h: asset.open24h,
        high24h: asset.high24h,
        low24h: asset.low24h,
        volume24h: asset.volume24h,
        change24h: asset.change24h,
        changePercent24h: asset.changePercent24h,
        marketStatus: asset.marketStatus,
        precision: asset.precision,
        candles,
        indicators: {
          sma20: sma20[sma20.length - 1],
          ema50: ema50[ema50.length - 1],
          rsi: rsi[rsi.length - 1],
          macd: {
            macd: macd.macd[macd.macd.length - 1],
            signal: macd.signal[macd.signal.length - 1],
            histogram: macd.histogram[macd.histogram.length - 1],
          },
          bollinger: {
            upper: bb.upper[bb.upper.length - 1],
            middle: bb.middle[bb.middle.length - 1],
            lower: bb.lower[bb.lower.length - 1],
          },
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get historical candles for charting
// @route   GET /api/markets/:symbol/candles
const getCandles = async (req, res, next) => {
  try {
    const symbol = decodeURIComponent(req.params.symbol).toUpperCase();
    const limit = parseInt(req.query.limit, 10) || 100;
    const candles = marketSimulator.getCandles(symbol, limit);
    res.json({ success: true, count: candles.length, data: candles });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMarkets, getMarketBySymbol, getCandles };
