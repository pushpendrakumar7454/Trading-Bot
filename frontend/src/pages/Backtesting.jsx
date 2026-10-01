import React, { useState } from 'react';
import {
  TestTube2,
  Play,
  TrendingUp,
  Award,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import api from '../services/api';
import { useMarket } from '../context/MarketContext';
import { useNotification } from '../context/NotificationContext';

export default function Backtesting() {
  const { assets } = useMarket();
  const { addToast } = useNotification();

  // Backtest parameters
  const [asset, setAsset] = useState('BTC/USDT');
  const [strategy, setStrategy] = useState('MA_CROSSOVER');
  const [capital, setCapital] = useState('10000');
  const [riskPerTrade, setRiskPerTrade] = useState('2');
  const [stopLoss, setStopLoss] = useState('3');
  const [takeProfit, setTakeProfit] = useState('6');
  const [candleCount, setCandleCount] = useState('200');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleRun = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/backtests', {
        asset,
        strategy,
        startingCapital: parseFloat(capital),
        riskPerTrade: parseFloat(riskPerTrade),
        stopLoss: parseFloat(stopLoss),
        takeProfit: parseFloat(takeProfit),
        candlesCount: parseInt(candleCount, 10),
      });

      if (res.data.success) {
        setResult(res.data.data);
        addToast({
          type: 'success',
          title: 'Backtest Completed',
          message: `Dynamic analysis produced ${res.data.data.totalTrades} simulated trades with ${res.data.data.winRate}% win rate.`,
        });
      }
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Backtest Failed',
        message: err.response?.data?.message || 'Could not complete backtest run.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Algorithmic Backtesting Lab</h1>
        <p className="text-xs text-slate-400 mt-1">
          Perform rigorous historical simulations and quantitative stress tests on algorithmic strategies
        </p>
      </div>

      {/* Configuration Form Card */}
      <div className="p-6 rounded-3xl bg-dark-900 border border-slate-800">
        <form onSubmit={handleRun} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
            <div>
              <label className="text-slate-300 font-sans block mb-1">Target Asset</label>
              <select
                value={asset}
                onChange={(e) => setAsset(e.target.value)}
                className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand"
              >
                {assets.map((a) => (
                  <option key={a.symbol} value={a.symbol}>
                    {a.symbol}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-sans block mb-1">Trading Strategy</label>
              <select
                value={strategy}
                onChange={(e) => setStrategy(e.target.value)}
                className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand font-sans"
              >
                <option value="MA_CROSSOVER">MA Crossover (SMA 9/21)</option>
                <option value="RSI_STRATEGY">RSI Mean Reversion (14)</option>
                <option value="MACD_STRATEGY">MACD Momentum</option>
                <option value="BOLLINGER_BANDS">Bollinger Bands Breakout</option>
                <option value="MOMENTUM">Price Rate of Change</option>
                <option value="TREND_FOLLOWING">EMA Trend Following</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 font-sans block mb-1">Starting Capital (₹)</label>
              <input
                type="number"
                value={capital}
                onChange={(e) => setCapital(e.target.value)}
                className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand"
              />
            </div>

            <div>
              <label className="text-slate-300 font-sans block mb-1">Historical Candle Bars</label>
              <select
                value={candleCount}
                onChange={(e) => setCandleCount(e.target.value)}
                className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand"
              >
                <option value="150">150 1-Minute Bars</option>
                <option value="250">250 1-Minute Bars</option>
                <option value="400">400 1-Minute Bars</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-xs font-mono pt-2">
            <div>
              <label className="text-slate-300 font-sans block mb-1">Risk Per Trade %</label>
              <input
                type="number"
                step="0.5"
                value={riskPerTrade}
                onChange={(e) => setRiskPerTrade(e.target.value)}
                className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="text-slate-300 font-sans block mb-1">Stop Loss %</label>
              <input
                type="number"
                step="0.5"
                value={stopLoss}
                onChange={(e) => setStopLoss(e.target.value)}
                className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="text-slate-300 font-sans block mb-1">Take Profit %</label>
              <input
                type="number"
                step="0.5"
                value={takeProfit}
                onChange={(e) => setTakeProfit(e.target.value)}
                className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand to-cyan-500 hover:from-cyan-400 hover:to-brand text-dark-950 font-bold text-xs tracking-wider shadow-lg shadow-cyan-500/20 transition flex items-center space-x-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Play className="w-4 h-4 fill-dark-950" />
                  <span>Run Algorithmic Backtest</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Results Section */}
      {result && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Key Performance Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            <div className="p-4 rounded-2xl bg-dark-900 border border-slate-800">
              <div className="text-xs text-slate-400 mb-1">Ending Capital</div>
              <div className="text-lg font-mono font-bold text-white">
                ₹{result.endingCapital?.toLocaleString()}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-dark-900 border border-slate-800">
              <div className="text-xs text-slate-400 mb-1">Total Return</div>
              <div
                className={`text-lg font-mono font-bold ${
                  result.totalReturn >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {result.totalReturn >= 0 ? '+' : ''}₹{result.totalReturn?.toFixed(2)} (
                {result.totalReturnPercent}%)
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-dark-900 border border-slate-800">
              <div className="text-xs text-slate-400 mb-1">Win Rate</div>
              <div className="text-lg font-mono font-bold text-white">{result.winRate}%</div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                {result.winningTrades}W / {result.losingTrades}L
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-dark-900 border border-slate-800">
              <div className="text-xs text-slate-400 mb-1">Profit Factor</div>
              <div className="text-lg font-mono font-bold text-white">{result.profitFactor}</div>
            </div>
            <div className="p-4 rounded-2xl bg-dark-900 border border-slate-800">
              <div className="text-xs text-slate-400 mb-1">Max Drawdown</div>
              <div className="text-lg font-mono font-bold text-rose-400">
                {result.maxDrawdown}%
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-dark-900 border border-slate-800">
              <div className="text-xs text-slate-400 mb-1">Avg Win / Loss</div>
              <div className="text-sm font-mono font-bold text-slate-200">
                ₹{result.averageWin} / ₹{result.averageLoss}
              </div>
            </div>
          </div>

          {/* Equity Curve Chart */}
          <div className="p-5 rounded-2xl bg-dark-900 border border-slate-800">
            <h3 className="text-sm font-bold text-white mb-1">Simulation Equity Curve</h3>
            <p className="text-xs text-slate-400 mb-4">Capital growth trajectory over historical bars</p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={result.equityCurve}>
                  <defs>
                    <linearGradient id="backtestEquityGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#475569" fontSize={10} tickLine={false} />
                  <YAxis
                    stroke="#475569"
                    fontSize={10}
                    tickLine={false}
                    domain={['dataMin - 50', 'dataMax + 50']}
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
                    dataKey="equity"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#backtestEquityGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Trade Results Table */}
          <div className="p-5 rounded-2xl bg-dark-900 border border-slate-800">
            <h3 className="text-sm font-bold text-white mb-4">
              Simulated Trade Executions ({result.trades?.length || 0})
            </h3>

            <div className="overflow-x-auto max-h-80">
              <table className="w-full text-left text-xs font-mono">
                <thead className="sticky top-0 bg-dark-900">
                  <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase font-sans">
                    <th className="py-2.5 px-3">Trade #</th>
                    <th className="py-2.5 px-3">Entry Price</th>
                    <th className="py-2.5 px-3">Exit Price</th>
                    <th className="py-2.5 px-3">Quantity</th>
                    <th className="py-2.5 px-3">P&L</th>
                    <th className="py-2.5 px-3">Exit Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {result.trades?.map((t) => (
                    <tr key={t.id} className="hover:bg-dark-850/60">
                      <td className="py-2 px-3 text-slate-400">{t.id}</td>
                      <td className="py-2 px-3 text-white">₹{t.entryPrice?.toLocaleString()}</td>
                      <td className="py-2 px-3 text-white">₹{t.exitPrice?.toLocaleString()}</td>
                      <td className="py-2 px-3 text-slate-300">{t.quantity}</td>
                      <td
                        className={`py-2 px-3 font-bold ${
                          t.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {t.pnl >= 0 ? '+' : ''}₹{t.pnl?.toFixed(2)} ({t.pnlPercent}%)
                      </td>
                      <td className="py-2 px-3 font-sans text-slate-400 text-[11px]">{t.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
