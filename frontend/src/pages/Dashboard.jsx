import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Bot,
  Activity,
  Award,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  RefreshCw,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from 'recharts';
import api from '../services/api';
import { useMarket } from '../context/MarketContext';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const { assets, priceFlashes, setSelectedSymbol } = useMarket();
  const navigate = useNavigate();

  const [portfolio, setPortfolio] = useState(null);
  const [positions, setPositions] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentTrades, setRecentTrades] = useState([]);
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [portRes, posRes, ordRes, trRes, botRes] = await Promise.all([
        api.get('/portfolio'),
        api.get('/positions?status=OPEN'),
        api.get('/orders?limit=5'),
        api.get('/trades?limit=5'),
        api.get('/bots'),
      ]);

      if (portRes.data.success) setPortfolio(portRes.data.data);
      if (posRes.data.success) setPositions(posRes.data.data);
      if (ordRes.data.success) setRecentOrders(ordRes.data.data);
      if (trRes.data.success) setRecentTrades(trRes.data.data);
      if (botRes.data.success) setBots(botRes.data.data);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 5000);
    return () => clearInterval(interval);
  }, []);

  const activeBots = bots.filter((b) => b.status === 'RUNNING');
  const winRate =
    recentTrades.length > 0
      ? (
          (recentTrades.filter((t) => t.realizedPnL > 0).length / recentTrades.length) *
          100
        ).toFixed(1)
      : '0.0';

  // Sample portfolio performance growth curve
  const growthData = [
    { time: '09:00', equity: 10000 },
    { time: '10:00', equity: 10045 },
    { time: '11:00', equity: 10120 },
    { time: '12:00', equity: 10090 },
    { time: '13:00', equity: 10180 },
    { time: '14:00', equity: 10240 },
    { time: '15:00', equity: portfolio?.totalValue || 10250 },
  ];

  // Best performing asset by 24h change
  const topAsset = [...assets].sort((a, b) => b.changePercent24h - a.changePercent24h)[0] || null;

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-dark-900 border border-slate-800 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-extrabold text-white">
              Welcome back, {user?.name || 'Trader'}
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold">
              PAPER TRADING ACTIVE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Simulated high-frequency algorithmic bot terminal • Zero capital risk
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/trade"
            className="px-4 py-2 rounded-xl bg-brand hover:bg-cyan-400 text-dark-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition flex items-center space-x-1.5"
          >
            <span>Open Terminal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/bots"
            className="px-4 py-2 rounded-xl bg-dark-800 hover:bg-dark-750 text-slate-200 border border-slate-700 font-semibold text-xs transition flex items-center space-x-1.5"
          >
            <Bot className="w-3.5 h-3.5 text-brand" />
            <span>Manage Bots</span>
          </Link>
        </div>
      </div>

      {/* 6 Key Stat Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Total Portfolio */}
        <div className="p-4 rounded-2xl bg-dark-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Portfolio Value</span>
            <Wallet className="w-4 h-4 text-brand" />
          </div>
          <div className="text-lg font-mono font-extrabold text-white">
            ₹{portfolio?.totalValue?.toLocaleString() || '10,000.00'}
          </div>
          <div
            className={`text-[11px] font-mono mt-1 flex items-center space-x-1 ${
              (portfolio?.totalPnL || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {(portfolio?.totalPnL || 0) >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            <span>
              {portfolio?.totalPnL >= 0 ? '+' : ''}
              {portfolio?.totalPnLPercent || 0}%
            </span>
          </div>
        </div>

        {/* Available Cash Balance */}
        <div className="p-4 rounded-2xl bg-dark-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Cash Available</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-lg font-mono font-extrabold text-white">
            ₹{portfolio?.cashBalance?.toLocaleString() || '10,000.00'}
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-1">Virtual USDT</div>
        </div>

        {/* Today's P&L */}
        <div className="p-4 rounded-2xl bg-dark-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Today's P&L</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div
            className={`text-lg font-mono font-extrabold ${
              (portfolio?.dailyPnL || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {(portfolio?.dailyPnL || 0) >= 0 ? '+' : ''}₹{portfolio?.dailyPnL?.toFixed(2) || '0.00'}
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-1">Realized today</div>
        </div>

        {/* Total Net Profit */}
        <div className="p-4 rounded-2xl bg-dark-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Total P&L</span>
            {(portfolio?.totalPnL || 0) >= 0 ? (
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-rose-400" />
            )}
          </div>
          <div
            className={`text-lg font-mono font-extrabold ${
              (portfolio?.totalPnL || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {(portfolio?.totalPnL || 0) >= 0 ? '+' : ''}₹{portfolio?.totalPnL?.toFixed(2) || '0.00'}
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-1">Cumulative</div>
        </div>

        {/* Win Rate */}
        <div className="p-4 rounded-2xl bg-dark-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Win Rate</span>
            <Award className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-lg font-mono font-extrabold text-white">{winRate}%</div>
          <div className="text-[11px] text-slate-500 font-mono mt-1">
            {recentTrades.length} closed trades
          </div>
        </div>

        {/* Active Bots */}
        <div className="p-4 rounded-2xl bg-dark-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Active Bots</span>
            <Bot className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-mono font-extrabold text-white">
            {activeBots.length} / {bots.length}
          </div>
          <div className="text-[11px] text-emerald-400 font-mono mt-1 flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Running</span>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Portfolio Growth Chart */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-dark-900 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white">Simulated Portfolio Equity Curve</h3>
              <p className="text-xs text-slate-400">Mark-to-market performance today</p>
            </div>
            <div className="text-right">
              <span className="text-sm font-mono font-bold text-white">
                ₹{portfolio?.totalValue?.toLocaleString() || '10,000.00'}
              </span>
            </div>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d2ff" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#00d2ff" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} />
                <YAxis
                  stroke="#475569"
                  fontSize={10}
                  tickLine={false}
                  domain={['dataMin - 100', 'dataMax + 100']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0b0f19',
                    borderColor: '#1e293b',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="equity"
                  stroke="#00d2ff"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#equityGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Asset & Risk Status Sidecard */}
        <div className="space-y-4">
          {/* Top Asset Card */}
          <div className="p-4 rounded-2xl bg-dark-900 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400">Top Market Gainer</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                24h Lead
              </span>
            </div>
            {topAsset ? (
              <div className="flex items-center justify-between mt-2">
                <div>
                  <div className="text-base font-bold text-white">{topAsset.symbol}</div>
                  <div className="text-xs text-slate-400">{topAsset.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono font-bold text-white">
                    ₹{topAsset.price?.toLocaleString()}
                  </div>
                  <div className="text-xs font-mono text-emerald-400">
                    +{topAsset.changePercent24h}%
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500">Loading asset feeds...</div>
            )}
          </div>

          {/* Risk Status Guard Card */}
          <div className="p-4 rounded-2xl bg-dark-900 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400">Risk Circuit Breaker</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xs text-slate-300 font-medium">Status: Optimal (Normal)</div>
            <div className="mt-2 text-[11px] text-slate-400 leading-relaxed">
              Daily Loss Threshold: <strong className="text-white">₹1,000.00</strong>
              <br />
              Open Positions: <strong className="text-white">{positions.length} / 5 max</strong>
            </div>
            <Link
              to="/risk"
              className="mt-3 block text-center py-1.5 rounded-lg bg-dark-800 hover:bg-dark-750 text-[11px] text-brand border border-slate-700 font-medium transition"
            >
              Configure Risk Rules
            </Link>
          </div>
        </div>
      </div>

      {/* Market Overview Table */}
      <div className="p-5 rounded-2xl bg-dark-900 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white">Live Simulated Markets</h3>
            <p className="text-xs text-slate-400">Instant paper execution on 7 major cryptocurrency pairs</p>
          </div>
          <Link to="/markets" className="text-xs text-brand hover:underline font-semibold">
            View All Markets →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="py-2.5 px-3">Asset</th>
                <th className="py-2.5 px-3">Price</th>
                <th className="py-2.5 px-3">24h Change</th>
                <th className="py-2.5 px-3">24h High</th>
                <th className="py-2.5 px-3">24h Low</th>
                <th className="py-2.5 px-3">24h Volume</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {assets.map((asset) => {
                const flash = priceFlashes[asset.symbol];
                return (
                  <tr
                    key={asset.symbol}
                    className={`hover:bg-dark-850/60 transition ${
                      flash === 'up' ? 'flash-up' : flash === 'down' ? 'flash-down' : ''
                    }`}
                  >
                    <td className="py-3 px-3 font-sans">
                      <div className="font-bold text-white">{asset.symbol}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{asset.name}</div>
                    </td>
                    <td className="py-3 px-3 font-bold text-white">
                      ₹{asset.price?.toLocaleString()}
                    </td>
                    <td
                      className={`py-3 px-3 font-bold ${
                        asset.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {asset.changePercent24h >= 0 ? '+' : ''}
                      {asset.changePercent24h}%
                    </td>
                    <td className="py-3 px-3 text-slate-300">₹{asset.high24h?.toLocaleString()}</td>
                    <td className="py-3 px-3 text-slate-300">₹{asset.low24h?.toLocaleString()}</td>
                    <td className="py-3 px-3 text-slate-400">{asset.volume24h?.toLocaleString()} USDT</td>
                    <td className="py-3 px-3 text-right font-sans">
                      <button
                        onClick={() => {
                          setSelectedSymbol(asset.symbol);
                          navigate('/trade');
                        }}
                        className="px-3 py-1 rounded-lg bg-brand/10 hover:bg-brand/20 border border-brand/30 text-brand text-xs font-semibold transition"
                      >
                        Trade
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom 2-Column Split: Active Positions & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Positions */}
        <div className="p-5 rounded-2xl bg-dark-900 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white">Active Open Positions ({positions.length})</h3>
            <Link to="/positions" className="text-xs text-brand hover:underline font-semibold">
              Manage Positions →
            </Link>
          </div>

          {positions.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No open positions. Open a simulated trade from the Terminal.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase font-sans">
                    <th className="py-2 px-2">Asset</th>
                    <th className="py-2 px-2">Qty</th>
                    <th className="py-2 px-2">Entry</th>
                    <th className="py-2 px-2">Mark</th>
                    <th className="py-2 px-2 text-right">P&L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {positions.map((pos) => (
                    <tr key={pos.id || pos._id} className="hover:bg-dark-850/60">
                      <td className="py-2.5 px-2 font-bold text-white">{pos.asset}</td>
                      <td className="py-2.5 px-2 text-slate-300">{pos.quantity}</td>
                      <td className="py-2.5 px-2 text-slate-400">₹{pos.entryPrice?.toLocaleString()}</td>
                      <td className="py-2.5 px-2 text-white">₹{pos.currentPrice?.toLocaleString()}</td>
                      <td
                        className={`py-2.5 px-2 text-right font-bold ${
                          (pos.unrealizedPnL || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {(pos.unrealizedPnL || 0) >= 0 ? '+' : ''}₹{pos.unrealizedPnL?.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="p-5 rounded-2xl bg-dark-900 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white">Recent Orders</h3>
            <Link to="/orders" className="text-xs text-brand hover:underline font-semibold">
              View All Orders →
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No orders placed yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase font-sans">
                    <th className="py-2 px-2">Asset</th>
                    <th className="py-2 px-2">Side</th>
                    <th className="py-2 px-2">Type</th>
                    <th className="py-2 px-2">Price</th>
                    <th className="py-2 px-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {recentOrders.map((ord) => (
                    <tr key={ord.id || ord._id} className="hover:bg-dark-850/60">
                      <td className="py-2.5 px-2 font-bold text-white">{ord.asset}</td>
                      <td
                        className={`py-2.5 px-2 font-semibold ${
                          ord.side === 'BUY' ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {ord.side}
                      </td>
                      <td className="py-2.5 px-2 text-slate-400">{ord.type}</td>
                      <td className="py-2.5 px-2 text-white">₹{ord.price?.toLocaleString()}</td>
                      <td className="py-2.5 px-2 text-right font-sans">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            ord.status === 'FILLED'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : ord.status === 'OPEN'
                              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
