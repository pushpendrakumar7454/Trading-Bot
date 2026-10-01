import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Bot, Play, Square, Pause, ArrowLeft, Activity, ShieldCheck, Zap } from 'lucide-react';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';

export default function BotDetails() {
  const { id } = useParams();
  const [bot, setBot] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useNotification();

  const fetchBot = async () => {
    try {
      const res = await api.get(`/bots/${id}`);
      if (res.data.success) {
        setBot(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBot();
    const interval = setInterval(fetchBot, 3000);
    return () => clearInterval(interval);
  }, [id]);

  const handleAction = async (action) => {
    try {
      const res = await api.post(`/bots/${id}/${action}`);
      if (res.data.success) {
        addToast({ type: 'success', title: 'Bot Updated', message: `Bot is now ${action}ed.` });
        fetchBot();
      }
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: 'Action failed.' });
    }
  };

  if (loading && !bot) {
    return (
      <div className="py-20 text-center text-xs text-slate-400">Loading bot telemetry...</div>
    );
  }

  if (!bot) {
    return (
      <div className="py-20 text-center text-xs text-slate-400">
        Bot not found. <Link to="/bots" className="text-brand underline">Back to Bot Manager</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Link to="/bots" className="p-2 rounded-xl bg-dark-900 border border-slate-800 text-slate-400 hover:text-white">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center space-x-2">
            <span>{bot.name}</span>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold ${
                bot.status === 'RUNNING'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : bot.status === 'PAUSED'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {bot.status}
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Trading Asset: <strong className="text-white">{bot.asset}</strong> • Algorithm: <strong className="text-brand">{bot.strategy}</strong>
          </p>
        </div>
      </div>

      {/* Control Strip */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-dark-900 border border-slate-800">
        <div className="flex items-center space-x-3">
          {bot.status === 'RUNNING' ? (
            <>
              <button
                onClick={() => handleAction('stop')}
                className="px-4 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-400 text-xs font-semibold transition flex items-center space-x-1.5"
              >
                <Square className="w-3.5 h-3.5" />
                <span>Stop Execution</span>
              </button>
              <button
                onClick={() => handleAction('pause')}
                className="px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-400 text-xs font-semibold transition flex items-center space-x-1.5"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => handleAction('start')}
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-dark-950 text-xs font-bold transition flex items-center space-x-1.5 shadow-lg shadow-emerald-500/20"
            >
              <Play className="w-3.5 h-3.5 fill-dark-950" />
              <span>Start Bot</span>
            </button>
          )}
        </div>

        <div className="text-xs font-mono text-slate-400 flex items-center space-x-2">
          <span>Current Evaluation Signal:</span>
          <span
            className={`font-bold px-2 py-0.5 rounded ${
              bot.lastSignal === 'BUY'
                ? 'bg-emerald-500/20 text-emerald-400'
                : bot.lastSignal === 'SELL'
                ? 'bg-rose-500/20 text-rose-400'
                : 'bg-dark-850 text-slate-300'
            }`}
          >
            {bot.lastSignal || 'HOLD'}
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-dark-900 border border-slate-800">
          <div className="text-xs text-slate-400 mb-1">Allocated Capital</div>
          <div className="text-lg font-mono font-bold text-white">₹{bot.capital?.toLocaleString()}</div>
        </div>
        <div className="p-4 rounded-2xl bg-dark-900 border border-slate-800">
          <div className="text-xs text-slate-400 mb-1">Net Realized Profit</div>
          <div
            className={`text-lg font-mono font-bold ${
              (bot.totalProfit || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {(bot.totalProfit || 0) >= 0 ? '+' : ''}₹{bot.totalProfit?.toFixed(2) || '0.00'}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-dark-900 border border-slate-800">
          <div className="text-xs text-slate-400 mb-1">Executed Trades</div>
          <div className="text-lg font-mono font-bold text-white">{bot.totalTrades || 0}</div>
        </div>
        <div className="p-4 rounded-2xl bg-dark-900 border border-slate-800">
          <div className="text-xs text-slate-400 mb-1">Algorithmic Win Rate</div>
          <div className="text-lg font-mono font-bold text-white">{bot.winRate || 0}%</div>
        </div>
      </div>

      {/* Strategy Telemetry & Rules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-dark-900 border border-slate-800">
          <h3 className="text-sm font-bold text-white mb-3">Risk Configuration Parameters</h3>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">Risk Per Trade:</span>
              <span className="text-white">{bot.riskSettings?.riskPerTrade || 2}%</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">Target Stop Loss:</span>
              <span className="text-rose-400">{bot.riskSettings?.stopLoss || 2.5}%</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">Target Take Profit:</span>
              <span className="text-emerald-400">{bot.riskSettings?.takeProfit || 5.0}%</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">Max Drawdown Limit:</span>
              <span className="text-amber-400">{bot.riskSettings?.maxDrawdown || 10}%</span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-dark-900 border border-slate-800">
          <h3 className="text-sm font-bold text-white mb-3">Engine Lifecycle Telemetry</h3>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">Last Evaluation Time:</span>
              <span className="text-white">
                {bot.lastRunAt ? new Date(bot.lastRunAt).toLocaleTimeString() : 'Awaiting tick'}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">Created Timestamp:</span>
              <span className="text-white">{new Date(bot.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">Engine Health:</span>
              <span className="text-emerald-400 font-sans font-semibold">Active & Responsive</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
