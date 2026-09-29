import React, { useState, useEffect } from 'react';
import { Bot, Play, Square, Pause, TrendingUp, Award, Layers } from 'lucide-react';
import api from '../../services/api';

export default function BotMonitoring() {
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBots = async () => {
    try {
      const res = await api.get('/admin/bots');
      if (res.data.success) {
        setBots(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBots();
    const interval = setInterval(fetchBots, 4000);
    return () => clearInterval(interval);
  }, []);

  const runningCount = bots.filter((b) => b.status === 'RUNNING').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">System-Wide Bot Fleet Monitoring</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time telemetry and state monitoring across all automated bots deployed in the platform
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-xl bg-dark-850 border border-slate-700 text-xs font-mono">
          <span className="text-slate-400">Active Fleet: </span>
          <span className="text-emerald-400 font-bold">{runningCount}</span>
          <span className="text-slate-500"> / {bots.length} total</span>
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-dark-900 border border-slate-800">
        {bots.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500">
            No active bot instances running across users.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase font-sans">
                  <th className="py-3 px-3">Bot Name</th>
                  <th className="py-3 px-3">Asset</th>
                  <th className="py-3 px-3">Strategy</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Capital</th>
                  <th className="py-3 px-3">Total Profit</th>
                  <th className="py-3 px-3">Trades</th>
                  <th className="py-3 px-3">Win Rate</th>
                  <th className="py-3 px-3 text-right">Last Signal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {bots.map((bot) => (
                  <tr key={bot.id || bot._id} className="hover:bg-dark-850/60">
                    <td className="py-3 px-3 font-sans font-bold text-white">{bot.name}</td>
                    <td className="py-3 px-3 text-slate-300">{bot.asset}</td>
                    <td className="py-3 px-3 text-cyan-400 font-sans text-[11px]">{bot.strategy}</td>
                    <td className="py-3 px-3 font-sans">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          bot.status === 'RUNNING'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : bot.status === 'PAUSED'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {bot.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-white">₹{bot.capital?.toLocaleString()}</td>
                    <td
                      className={`py-3 px-3 font-bold ${
                        (bot.totalProfit || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {(bot.totalProfit || 0) >= 0 ? '+' : ''}₹{bot.totalProfit?.toFixed(2) || '0.00'}
                    </td>
                    <td className="py-3 px-3 text-slate-300">{bot.totalTrades || 0}</td>
                    <td className="py-3 px-3 text-purple-400">{bot.winRate || 0}%</td>
                    <td className="py-3 px-3 text-right">
                      <span
                        className={`font-semibold ${
                          bot.lastSignal === 'BUY'
                            ? 'text-emerald-400'
                            : bot.lastSignal === 'SELL'
                            ? 'text-rose-400'
                            : 'text-slate-400'
                        }`}
                      >
                        {bot.lastSignal || 'HOLD'}
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
  );
}
