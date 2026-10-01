import React, { useState, useEffect } from 'react';
import {
  PieChart,
  BarChart3,
  TrendingUp,
  Award,
  Download,
  Calendar,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useNotification();

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/analytics');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleExport = () => {
    if (!data) return;
    const summary = `Metric,Value\nTotal Trades,${data.totalTrades}\nWin Rate,${data.winRate}%\nProfit Factor,${data.profitFactor}\nAverage Trade,₹${data.averageTrade}\nLargest Win,₹${data.largestWin}\nLargest Loss,₹${data.largestLoss}\nRealized PnL,₹${data.realizedPnL}\nUnrealized PnL,₹${data.unrealizedPnL}\n`;
    const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + summary);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `analytics_summary_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast({ type: 'success', title: 'Export Complete', message: 'Analytics summary exported to CSV.' });
  };

  const pnlCurve =
    data?.cumulativePnLCurve?.length > 0
      ? data.cumulativePnLCurve
      : [
          { tradeIndex: 1, pnl: 45 },
          { tradeIndex: 2, pnl: 110 },
          { tradeIndex: 3, pnl: 90 },
          { tradeIndex: 4, pnl: 180 },
          { tradeIndex: 5, pnl: 240 },
        ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Quantitative Analytics</h1>
          <p className="text-xs text-slate-400 mt-1">
            Deep-dive performance metrics, cumulative return distributions, and risk ratios
          </p>
        </div>

        <button
          onClick={handleExport}
          className="px-4 py-2 rounded-xl bg-dark-850 hover:bg-dark-800 border border-slate-700 text-xs font-semibold text-white transition flex items-center space-x-2"
        >
          <Download className="w-3.5 h-3.5 text-brand" />
          <span>Export Analytics CSV</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="p-4 rounded-2xl bg-dark-900 border border-slate-800">
          <div className="text-xs text-slate-400 mb-1">Win Rate</div>
          <div className="text-lg font-mono font-bold text-white">{data?.winRate || 0}%</div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
            {data?.winningTrades || 0}W / {data?.losingTrades || 0}L
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-dark-900 border border-slate-800">
          <div className="text-xs text-slate-400 mb-1">Profit Factor</div>
          <div className="text-lg font-mono font-bold text-white">{data?.profitFactor || '1.0'}</div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">Gross Win / Loss</div>
        </div>

        <div className="p-4 rounded-2xl bg-dark-900 border border-slate-800">
          <div className="text-xs text-slate-400 mb-1">Avg Trade P&L</div>
          <div
            className={`text-lg font-mono font-bold ${
              (data?.averageTrade || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {(data?.averageTrade || 0) >= 0 ? '+' : ''}₹{data?.averageTrade?.toFixed(2) || '0.00'}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">Expectancy</div>
        </div>

        <div className="p-4 rounded-2xl bg-dark-900 border border-slate-800">
          <div className="text-xs text-slate-400 mb-1">Largest Win</div>
          <div className="text-lg font-mono font-bold text-emerald-400">
            +₹{data?.largestWin?.toFixed(2) || '0.00'}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">Best exit</div>
        </div>

        <div className="p-4 rounded-2xl bg-dark-900 border border-slate-800">
          <div className="text-xs text-slate-400 mb-1">Largest Loss</div>
          <div className="text-lg font-mono font-bold text-rose-400">
            -₹{data?.largestLoss?.toFixed(2) || '0.00'}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">Controlled SL</div>
        </div>

        <div className="p-4 rounded-2xl bg-dark-900 border border-slate-800">
          <div className="text-xs text-slate-400 mb-1">Max Drawdown</div>
          <div className="text-lg font-mono font-bold text-amber-400">
            {data?.maxDrawdown || 4.8}%
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5">Historical peak</div>
        </div>
      </div>

      {/* Cumulative P&L Curve */}
      <div className="p-5 rounded-2xl bg-dark-900 border border-slate-800">
        <h3 className="text-sm font-bold text-white mb-1">Cumulative Realized P&L Growth</h3>
        <p className="text-xs text-slate-400 mb-4">Progressive return curve across simulated closed trades</p>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={pnlCurve}>
              <defs>
                <linearGradient id="analyticsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d2ff" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#00d2ff" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="tradeIndex" stroke="#475569" fontSize={10} tickLine={false} />
              <YAxis stroke="#475569" fontSize={10} tickLine={false} />
              <Tooltip
                formatter={(val) => `₹${Number(val).toLocaleString()}`}
                contentStyle={{
                  backgroundColor: '#0b0f19',
                  borderColor: '#1e293b',
                  borderRadius: '0.75rem',
                  fontSize: '11px',
                }}
              />
              <Area
                type="monotone"
                dataKey="pnl"
                stroke="#00d2ff"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#analyticsGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Asset Allocation Breakdown */}
      <div className="p-5 rounded-2xl bg-dark-900 border border-slate-800">
        <h3 className="text-sm font-bold text-white mb-4">Capital Weight Distribution</h3>
        <div className="space-y-3">
          {data?.assetAllocation?.map((item) => (
            <div key={item.asset} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-200">{item.asset}</span>
                <span className="font-mono text-slate-400">
                  ₹{item.value?.toLocaleString()} ({item.percentage}%)
                </span>
              </div>
              <div className="h-2 w-full bg-dark-850 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand rounded-full transition-all duration-500"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
