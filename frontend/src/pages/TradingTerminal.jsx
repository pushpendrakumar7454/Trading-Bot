import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Layers,
  ArrowRight,
  ShieldAlert,
  Sliders,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import api from '../services/api';
import { useMarket } from '../context/MarketContext';
import { useNotification } from '../context/NotificationContext';

export default function TradingTerminal() {
  const { symbol: routeSymbol } = useParams();
  const { assets, selectedSymbol, setSelectedSymbol, currentAsset } = useMarket();
  const { addToast } = useNotification();

  const activeSymbol = routeSymbol ? routeSymbol.replace('-', '/') : selectedSymbol;

  // Terminal state
  const [candles, setCandles] = useState([]);
  const [portfolio, setPortfolio] = useState(null);
  const [openPositions, setOpenPositions] = useState([]);
  const [openOrders, setOpenOrders] = useState([]);
  const [tradeHistory, setTradeHistory] = useState([]);
  const [bottomTab, setBottomTab] = useState('POSITIONS'); // POSITIONS | ORDERS | TRADES

  // Order panel state
  const [side, setSide] = useState('BUY'); // BUY | SELL
  const [orderType, setOrderType] = useState('MARKET'); // MARKET | LIMIT | STOP
  const [quantity, setQuantity] = useState('0.05');
  const [limitPrice, setLimitPrice] = useState('');
  const [stopPrice, setStopPrice] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Indicator toggles
  const [showSMA, setShowSMA] = useState(true);
  const [showEMA, setShowEMA] = useState(false);
  const [showBB, setShowBB] = useState(false);

  const curPrice = currentAsset?.price || 64000;

  // Initialize limit price if blank
  useEffect(() => {
    if (!limitPrice && curPrice) {
      setLimitPrice(curPrice.toString());
    }
  }, [curPrice]);

  // Fetch candle data and user account state
  const fetchTerminalData = async () => {
    try {
      const [candleRes, portRes, posRes, ordRes, trRes] = await Promise.all([
        api.get(`/markets/${encodeURIComponent(activeSymbol)}/candles?limit=60`),
        api.get('/portfolio'),
        api.get('/positions?status=OPEN'),
        api.get('/orders?status=OPEN'),
        api.get('/trades?limit=10'),
      ]);

      if (candleRes.data.success) {
        // Enriched with indicator simulations for display
        const enriched = candleRes.data.data.map((c, i, arr) => {
          const slice = arr.slice(Math.max(0, i - 14), i + 1);
          const sma = slice.reduce((acc, val) => acc + val.close, 0) / slice.length;
          return {
            time: new Date(c.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            open: c.open,
            high: c.high,
            low: c.low,
            close: c.close,
            price: c.close,
            sma: Number(sma.toFixed(2)),
            ema: Number((sma * 0.998).toFixed(2)),
            bbUpper: Number((sma * 1.015).toFixed(2)),
            bbLower: Number((sma * 0.985).toFixed(2)),
          };
        });
        setCandles(enriched);
      }

      if (portRes.data.success) setPortfolio(portRes.data.data);
      if (posRes.data.success) setOpenPositions(posRes.data.data);
      if (ordRes.data.success) setOpenOrders(ordRes.data.data);
      if (trRes.data.success) setTradeHistory(trRes.data.data);
    } catch (err) {
      console.error('Terminal load error:', err);
    }
  };

  useEffect(() => {
    fetchTerminalData();
    const interval = setInterval(fetchTerminalData, 3000);
    return () => clearInterval(interval);
  }, [activeSymbol]);

  // Calculations
  const executionPrice =
    orderType === 'MARKET' ? curPrice : parseFloat(limitPrice) || curPrice;
  const numQty = parseFloat(quantity) || 0;
  const orderValue = Number((numQty * executionPrice).toFixed(2));
  const estimatedFee = Number((orderValue * 0.001).toFixed(2)); // 0.1% simulated fee
  const cashBalance = portfolio?.cashBalance || 10000;
  const remainingBalance =
    side === 'BUY'
      ? Number((cashBalance - orderValue - estimatedFee).toFixed(2))
      : Number((cashBalance + orderValue - estimatedFee).toFixed(2));

  // Quick percent buttons
  const handleQuickPercent = (pct) => {
    if (side === 'BUY') {
      const budget = (cashBalance * pct) / 100;
      const qty = Number((budget / executionPrice).toFixed(4));
      setQuantity(qty.toString());
    } else {
      const holding = portfolio?.holdings?.find((h) => h.asset === activeSymbol);
      if (holding) {
        const qty = Number(((holding.quantity * pct) / 100).toFixed(4));
        setQuantity(qty.toString());
      } else {
        setQuantity('0');
      }
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (numQty <= 0) {
      addToast({ type: 'error', title: 'Invalid Quantity', message: 'Enter a valid trade quantity.' });
      return;
    }
    if (side === 'BUY' && remainingBalance < 0) {
      addToast({ type: 'error', title: 'Insufficient Capital', message: 'Virtual cash balance is insufficient.' });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        asset: activeSymbol,
        type: orderType,
        side,
        quantity: numQty,
        price: executionPrice,
        stopLoss: stopLoss ? parseFloat(stopLoss) : undefined,
        takeProfit: takeProfit ? parseFloat(takeProfit) : undefined,
      };

      const res = await api.post('/orders', payload);
      if (res.data.success) {
        addToast({
          type: 'success',
          title: `${side} Order Submitted`,
          message: `${side} ${numQty} ${activeSymbol} @ ₹${executionPrice} (${orderType})`,
        });
        fetchTerminalData();
      }
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Order Rejected',
        message: err.response?.data?.message || 'Could not place order.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      const res = await api.delete(`/orders/${orderId}`);
      if (res.data.success) {
        addToast({ type: 'success', title: 'Order Cancelled', message: 'Open order was removed.' });
        fetchTerminalData();
      }
    } catch (err) {
      addToast({ type: 'error', title: 'Cancellation Failed', message: err.message });
    }
  };

  const handleClosePosition = async (posId) => {
    try {
      const res = await api.post(`/positions/${posId}/close`);
      if (res.data.success) {
        addToast({
          type: 'success',
          title: 'Position Closed',
          message: res.data.message || 'Market exit executed.',
        });
        fetchTerminalData();
      }
    } catch (err) {
      addToast({ type: 'error', title: 'Close Failed', message: err.message });
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Asset Header Bar */}
      <div className="flex flex-wrap items-center justify-between p-3.5 rounded-2xl bg-dark-900 border border-slate-800 gap-3">
        <div className="flex items-center space-x-3">
          <select
            value={activeSymbol}
            onChange={(e) => setSelectedSymbol(e.target.value)}
            className="bg-dark-850 border border-slate-700 rounded-xl px-3 py-1.5 text-sm font-bold text-white focus:outline-none focus:border-brand"
          >
            {assets.map((a) => (
              <option key={a.symbol} value={a.symbol}>
                {a.symbol} ({a.name})
              </option>
            ))}
          </select>

          <div className="flex items-center space-x-2 font-mono">
            <span className="text-xl font-extrabold text-white">
              ₹{curPrice?.toLocaleString()}
            </span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                (currentAsset?.change24h || 0) >= 0
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-rose-500/10 text-rose-400'
              }`}
            >
              {(currentAsset?.changePercent24h || 0) >= 0 ? '+' : ''}
              {currentAsset?.changePercent24h || 0}%
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-6 text-xs font-mono text-slate-400">
          <div>
            <span className="text-slate-500 block text-[10px]">24h High</span>
            <span className="text-slate-200">₹{currentAsset?.high24h?.toLocaleString() || '-'}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">24h Low</span>
            <span className="text-slate-200">₹{currentAsset?.low24h?.toLocaleString() || '-'}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">24h Volume</span>
            <span className="text-slate-200">
              {currentAsset?.volume24h?.toLocaleString() || '-'} USDT
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Center Chart + Right Order Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* CENTER / LEFT: Chart & Indicators */}
        <div className="lg:col-span-2 p-4 rounded-2xl bg-dark-900 border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300">
              <span>Technical Indicators:</span>
              <button
                onClick={() => setShowSMA(!showSMA)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition ${
                  showSMA ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-dark-800 text-slate-500'
                }`}
              >
                SMA(14)
              </button>
              <button
                onClick={() => setShowEMA(!showEMA)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition ${
                  showEMA ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-dark-800 text-slate-500'
                }`}
              >
                EMA(50)
              </button>
              <button
                onClick={() => setShowBB(!showBB)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition ${
                  showBB ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'bg-dark-800 text-slate-500'
                }`}
              >
                BB(20,2)
              </button>
            </div>
            <div className="text-[11px] font-mono text-emerald-400 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>1m Candles</span>
            </div>
          </div>

          {/* Interactive Chart */}
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={candles}>
                <defs>
                  <linearGradient id="tradePriceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d2ff" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#00d2ff" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} />
                <YAxis
                  stroke="#475569"
                  fontSize={10}
                  tickLine={false}
                  domain={['dataMin - 15', 'dataMax + 15']}
                  orientation="right"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0b0f19',
                    borderColor: '#1e293b',
                    borderRadius: '0.75rem',
                    fontSize: '11px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke="#00d2ff"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#tradePriceGrad)"
                />
                {showSMA && (
                  <Line type="monotone" dataKey="sma" stroke="#38bdf8" dot={false} strokeWidth={1.5} />
                )}
                {showEMA && (
                  <Line type="monotone" dataKey="ema" stroke="#fbbf24" dot={false} strokeWidth={1.5} />
                )}
                {showBB && (
                  <>
                    <Line type="monotone" dataKey="bbUpper" stroke="#c084fc" dot={false} strokeDasharray="3 3" />
                    <Line type="monotone" dataKey="bbLower" stroke="#c084fc" dot={false} strokeDasharray="3 3" />
                  </>
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RIGHT: Order Submission Panel */}
        <div className="p-5 rounded-2xl bg-dark-900 border border-slate-800 flex flex-col justify-between">
          <div>
            {/* BUY / SELL Switch */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-dark-850 rounded-xl mb-4">
              <button
                type="button"
                onClick={() => setSide('BUY')}
                className={`py-2 rounded-lg text-xs font-bold transition ${
                  side === 'BUY'
                    ? 'bg-emerald-500 text-dark-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                BUY / LONG
              </button>
              <button
                type="button"
                onClick={() => setSide('SELL')}
                className={`py-2 rounded-lg text-xs font-bold transition ${
                  side === 'SELL'
                    ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                SELL / SHORT
              </button>
            </div>

            {/* Order Type Selector */}
            <div className="flex items-center space-x-1 border-b border-slate-800 pb-3 mb-4 text-xs font-semibold">
              {['MARKET', 'LIMIT', 'STOP'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setOrderType(t)}
                  className={`flex-1 py-1 rounded-lg transition ${
                    orderType === t
                      ? 'bg-brand/10 text-brand border border-brand/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Form Fields */}
            <form onSubmit={handlePlaceOrder} className="space-y-3 font-mono text-xs">
              {orderType !== 'MARKET' && (
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    {orderType === 'LIMIT' ? 'Limit Price (₹)' : 'Stop Price (₹)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={limitPrice}
                    onChange={(e) => setLimitPrice(e.target.value)}
                    className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand"
                  />
                </div>
              )}

              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>Quantity ({activeSymbol.split('/')[0]})</span>
                  <span className="text-slate-500">
                    Avail: ₹{cashBalance.toLocaleString()}
                  </span>
                </div>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand"
                />
              </div>

              {/* Quick Percent Buttons */}
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {[25, 50, 75, 100].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handleQuickPercent(pct)}
                    className="py-1 rounded bg-dark-850 border border-slate-800 text-[10px] text-slate-400 hover:text-white hover:border-slate-700 transition"
                  >
                    {pct}%
                  </button>
                ))}
              </div>

              {/* Stop Loss & Take Profit */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Stop Loss (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Optional"
                    value={stopLoss}
                    onChange={(e) => setStopLoss(e.target.value)}
                    className="w-full bg-dark-850 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white focus:outline-none focus:border-brand text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Take Profit (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Optional"
                    value={takeProfit}
                    onChange={(e) => setTakeProfit(e.target.value)}
                    className="w-full bg-dark-850 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white focus:outline-none focus:border-brand text-xs"
                  />
                </div>
              </div>

              {/* Calculation Preview Table */}
              <div className="pt-3 pb-1 border-t border-slate-800/80 text-[11px] space-y-1 text-slate-400 font-sans">
                <div className="flex justify-between">
                  <span>Order Value:</span>
                  <span className="font-mono text-white">₹{orderValue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Fee (0.1%):</span>
                  <span className="font-mono text-slate-300">₹{estimatedFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Remaining Virtual Cash:</span>
                  <span
                    className={`font-mono font-semibold ${
                      remainingBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    ₹{remainingBalance.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className={`w-full py-3 rounded-xl font-bold text-xs tracking-wider shadow-lg transition mt-3 ${
                  side === 'BUY'
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-dark-950 shadow-emerald-500/20'
                    : 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/20'
                }`}
              >
                {submitting
                  ? 'PROCESSING ORDER...'
                  : `${side} ${activeSymbol.split('/')[0]} (${orderType})`}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: Tabs for Positions, Orders, Trade History */}
      <div className="p-5 rounded-2xl bg-dark-900 border border-slate-800">
        <div className="flex items-center space-x-6 border-b border-slate-800 pb-3 mb-4 text-xs font-bold">
          <button
            onClick={() => setBottomTab('POSITIONS')}
            className={`transition pb-1 ${
              bottomTab === 'POSITIONS' ? 'text-brand border-b-2 border-brand' : 'text-slate-400 hover:text-white'
            }`}
          >
            Open Positions ({openPositions.length})
          </button>
          <button
            onClick={() => setBottomTab('ORDERS')}
            className={`transition pb-1 ${
              bottomTab === 'ORDERS' ? 'text-brand border-b-2 border-brand' : 'text-slate-400 hover:text-white'
            }`}
          >
            Open Orders ({openOrders.length})
          </button>
          <button
            onClick={() => setBottomTab('TRADES')}
            className={`transition pb-1 ${
              bottomTab === 'TRADES' ? 'text-brand border-b-2 border-brand' : 'text-slate-400 hover:text-white'
            }`}
          >
            Recent Trade Fills
          </button>
        </div>

        {/* Tab 1: Positions */}
        {bottomTab === 'POSITIONS' && (
          <div className="overflow-x-auto">
            {openPositions.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No active positions. Execute a buy order above.
              </div>
            ) : (
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase font-sans">
                    <th className="py-2 px-3">Asset</th>
                    <th className="py-2 px-3">Quantity</th>
                    <th className="py-2 px-3">Entry Price</th>
                    <th className="py-2 px-3">Current Mark</th>
                    <th className="py-2 px-3">Stop Loss</th>
                    <th className="py-2 px-3">Take Profit</th>
                    <th className="py-2 px-3">Unrealized P&L</th>
                    <th className="py-2 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {openPositions.map((pos) => (
                    <tr key={pos.id || pos._id} className="hover:bg-dark-850/60">
                      <td className="py-2.5 px-3 font-bold text-white font-sans">{pos.asset}</td>
                      <td className="py-2.5 px-3 text-slate-300">{pos.quantity}</td>
                      <td className="py-2.5 px-3 text-slate-400">₹{pos.entryPrice?.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-white">₹{pos.currentPrice?.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-rose-400">{pos.stopLoss ? `₹${pos.stopLoss}` : '-'}</td>
                      <td className="py-2.5 px-3 text-emerald-400">{pos.takeProfit ? `₹${pos.takeProfit}` : '-'}</td>
                      <td
                        className={`py-2.5 px-3 font-bold ${
                          (pos.unrealizedPnL || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {(pos.unrealizedPnL || 0) >= 0 ? '+' : ''}₹{pos.unrealizedPnL?.toFixed(2)} (
                        {pos.unrealizedPnLPercent}%)
                      </td>
                      <td className="py-2.5 px-3 text-right font-sans">
                        <button
                          onClick={() => handleClosePosition(pos.id || pos._id)}
                          className="px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-semibold transition"
                        >
                          Market Exit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 2: Open Orders */}
        {bottomTab === 'ORDERS' && (
          <div className="overflow-x-auto">
            {openOrders.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No active pending orders.
              </div>
            ) : (
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase font-sans">
                    <th className="py-2 px-3">Asset</th>
                    <th className="py-2 px-3">Type</th>
                    <th className="py-2 px-3">Side</th>
                    <th className="py-2 px-3">Quantity</th>
                    <th className="py-2 px-3">Order Price</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {openOrders.map((ord) => (
                    <tr key={ord.id || ord._id} className="hover:bg-dark-850/60">
                      <td className="py-2.5 px-3 font-bold text-white font-sans">{ord.asset}</td>
                      <td className="py-2.5 px-3 text-slate-400">{ord.type}</td>
                      <td
                        className={`py-2.5 px-3 font-semibold ${
                          ord.side === 'BUY' ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {ord.side}
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">{ord.quantity}</td>
                      <td className="py-2.5 px-3 text-white">₹{ord.price?.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-cyan-400 font-sans text-[11px]">{ord.status}</td>
                      <td className="py-2.5 px-3 text-right font-sans">
                        <button
                          onClick={() => handleCancelOrder(ord.id || ord._id)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 3: Trade History */}
        {bottomTab === 'TRADES' && (
          <div className="overflow-x-auto">
            {tradeHistory.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No recent trades recorded yet.
              </div>
            ) : (
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase font-sans">
                    <th className="py-2 px-3">Asset</th>
                    <th className="py-2 px-3">Side</th>
                    <th className="py-2 px-3">Quantity</th>
                    <th className="py-2 px-3">Executed Price</th>
                    <th className="py-2 px-3">Simulated Fee</th>
                    <th className="py-2 px-3">Realized P&L</th>
                    <th className="py-2 px-3 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {tradeHistory.map((tr) => (
                    <tr key={tr.id || tr._id} className="hover:bg-dark-850/60">
                      <td className="py-2.5 px-3 font-bold text-white font-sans">{tr.asset}</td>
                      <td
                        className={`py-2.5 px-3 font-semibold ${
                          tr.side === 'BUY' ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {tr.side}
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">{tr.quantity}</td>
                      <td className="py-2.5 px-3 text-white">₹{tr.price?.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-slate-400">₹{tr.fee?.toFixed(2)}</td>
                      <td
                        className={`py-2.5 px-3 font-bold ${
                          (tr.realizedPnL || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {(tr.realizedPnL || 0) >= 0 ? '+' : ''}₹{tr.realizedPnL?.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-500 text-[11px]">
                        {new Date(tr.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
