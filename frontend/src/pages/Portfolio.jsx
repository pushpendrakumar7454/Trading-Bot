import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Layers,
  PieChart as PieIcon,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import api from '../services/api';
import { useMarket } from '../context/MarketContext';

const PIE_COLORS = ['#00d2ff', '#10b981', '#fbbf24', '#c084fc', '#f43f5e', '#6366f1', '#64748b'];

export default function Portfolio() {
  const { setSelectedSymbol } = useMarket();
  const navigate = useNavigate();

  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPortfolio = async () => {
    try {
      const res = await api.get('/portfolio');
      if (res.data.success) {
        setPortfolio(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
    const interval = setInterval(fetchPortfolio, 4000);
    return () => clearInterval(interval);
  }, []);

  const holdings = portfolio?.holdings || [];

  // Build allocation pie chart data
  const pieData = holdings.map((h) => ({
    name: h.asset,
    value: h.currentValue || 0,
  }));

  if ((portfolio?.cashBalance || 0) > 0) {
    pieData.push({
      name: 'Cash USDT',
      value: portfolio?.cashBalance || 0,
    });
  }

  const handleTradeAsset = (asset) => {
    setSelectedSymbol(asset);
    navigate('/trade');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Portfolio Overview</h1>
        <p className="text-xs text-slate-400 mt-1">
          Real-time mark-to-market balances, holdings, and asset allocation breakdown
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-2xl bg-dark-900 border border-slate-800">
          <div className="text-xs text-slate-400 mb-1">Total Value</div>
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

        <div className="p-4 rounded-2xl bg-dark-900 border border-slate-800">
          <div className="text-xs text-slate-400 mb-1">Cash Balance</div>
          <div className="text-lg font-mono font-extrabold text-white">
            ₹{portfolio?.cashBalance?.toLocaleString() || '10,000.00'}
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-1">Available for trades</div>
        </div>

        <div className="p-4 rounded-2xl bg-dark-900 border border-slate-800">
          <div className="text-xs text-slate-400 mb-1">Invested Value</div>
          <div className="text-lg font-mono font-extrabold text-white">
            ₹{portfolio?.investedValue?.toLocaleString() || '0.00'}
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-1">In {holdings.length} assets</div>
        </div>

        <div className="p-4 rounded-2xl bg-dark-900 border border-slate-800">
          <div className="text-xs text-slate-400 mb-1">Unrealized P&L</div>
          <div
            className={`text-lg font-mono font-extrabold ${
              (portfolio?.unrealizedPnL || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {(portfolio?.unrealizedPnL || 0) >= 0 ? '+' : ''}₹{portfolio?.unrealizedPnL?.toFixed(2) || '0.00'}
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-1">Open positions</div>
        </div>

        <div className="p-4 rounded-2xl bg-dark-900 border border-slate-800">
          <div className="text-xs text-slate-400 mb-1">Realized P&L</div>
          <div
            className={`text-lg font-mono font-extrabold ${
              (portfolio?.realizedPnL || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {(portfolio?.realizedPnL || 0) >= 0 ? '+' : ''}₹{portfolio?.realizedPnL?.toFixed(2) || '0.00'}
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-1">Settled gains</div>
        </div>

        <div className="p-4 rounded-2xl bg-dark-900 border border-slate-800">
          <div className="text-xs text-slate-400 mb-1">Total Return</div>
          <div
            className={`text-lg font-mono font-extrabold ${
              (portfolio?.totalPnL || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {(portfolio?.totalPnL || 0) >= 0 ? '+' : ''}₹{portfolio?.totalPnL?.toFixed(2) || '0.00'}
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-1">All-time</div>
        </div>
      </div>

      {/* Allocation Breakdown Chart & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-dark-900 border border-slate-800 flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white">Asset Allocation</h3>
            <PieIcon className="w-4 h-4 text-brand" />
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => `₹${Number(val).toLocaleString()}`}
                  contentStyle={{
                    backgroundColor: '#0b0f19',
                    borderColor: '#1e293b',
                    borderRadius: '0.75rem',
                    fontSize: '11px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Allocation Legend List */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-dark-900 border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-1">Capital Distribution</h3>
            <p className="text-xs text-slate-400 mb-4">Current weighting across asset classes</p>

            <div className="space-y-3">
              {pieData.map((item, idx) => {
                const total = portfolio?.totalValue || 10000;
                const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
                const color = PIE_COLORS[idx % PIE_COLORS.length];

                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                        <span className="font-semibold text-slate-200">{item.name}</span>
                      </div>
                      <span className="font-mono text-slate-400">
                        ₹{item.value.toLocaleString()} ({pct}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-dark-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="p-5 rounded-2xl bg-dark-900 border border-slate-800">
        <h3 className="text-sm font-bold text-white mb-4">Current Holdings ({holdings.length})</h3>

        {holdings.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            You do not currently hold any cryptocurrencies. Open a trade in the Trading Terminal.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase font-sans">
                  <th className="py-3 px-3">Asset</th>
                  <th className="py-3 px-3">Quantity</th>
                  <th className="py-3 px-3">Avg Buy Price</th>
                  <th className="py-3 px-3">Current Mark</th>
                  <th className="py-3 px-3">Market Value</th>
                  <th className="py-3 px-3">Unrealized P&L</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {holdings.map((h) => (
                  <tr key={h.asset} className="hover:bg-dark-850/60">
                    <td className="py-3 px-3 font-bold text-white font-sans">{h.asset}</td>
                    <td className="py-3 px-3 text-slate-300">{h.quantity}</td>
                    <td className="py-3 px-3 text-slate-400">₹{h.averageBuyPrice?.toLocaleString()}</td>
                    <td className="py-3 px-3 text-white">₹{h.currentPrice?.toLocaleString()}</td>
                    <td className="py-3 px-3 text-slate-200 font-bold">₹{h.currentValue?.toLocaleString()}</td>
                    <td
                      className={`py-3 px-3 font-bold ${
                        (h.unrealizedPnL || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {(h.unrealizedPnL || 0) >= 0 ? '+' : ''}₹{h.unrealizedPnL?.toFixed(2)} (
                      {h.unrealizedPnLPercent}%)
                    </td>
                    <td className="py-3 px-3 text-right font-sans">
                      <button
                        onClick={() => handleTradeAsset(h.asset)}
                        className="px-3 py-1 rounded-xl bg-brand/10 hover:bg-brand/20 border border-brand/30 text-brand text-xs font-semibold transition inline-flex items-center space-x-1"
                      >
                        <span>Trade</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
