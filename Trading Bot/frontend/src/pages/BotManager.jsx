import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot as BotIcon,
  Play,
  Square,
  Pause,
  Plus,
  Trash2,
  ExternalLink,
  Activity,
  Sliders,
  X,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import api from '../services/api';
import { useMarket } from '../context/MarketContext';
import { useNotification } from '../context/NotificationContext';

export default function BotManager() {
  const { assets } = useMarket();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // New bot form
  const [botName, setBotName] = useState('BTC Quantitative Momentum');
  const [botAsset, setBotAsset] = useState('BTC/USDT');
  const [botStrategy, setBotStrategy] = useState('MA_CROSSOVER');
  const [botCapital, setBotCapital] = useState('2000');
  const [riskPerTrade, setRiskPerTrade] = useState('2');
  const [stopLoss, setStopLoss] = useState('2.5');
  const [takeProfit, setTakeProfit] = useState('5.0');
  const [creating, setCreating] = useState(false);

  const fetchBots = async () => {
    try {
      const res = await api.get('/bots');
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
    const interval = setInterval(fetchBots, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleStart = async (id, name) => {
    try {
      const res = await api.post(`/bots/${id}/start`);
      if (res.data.success) {
        addToast({ type: 'success', title: 'Bot Started', message: `Bot "${name}" is now executing strategies.` });
        fetchBots();
      }
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: err.response?.data?.message || 'Could not start bot.' });
    }
  };

  const handleStop = async (id, name) => {
    try {
      const res = await api.post(`/bots/${id}/stop`);
      if (res.data.success) {
        addToast({ type: 'info', title: 'Bot Stopped', message: `Bot "${name}" was stopped.` });
        fetchBots();
      }
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: 'Could not stop bot.' });
    }
  };

  const handlePause = async (id, name) => {
    try {
      const res = await api.post(`/bots/${id}/pause`);
      if (res.data.success) {
        addToast({ type: 'info', title: 'Bot Paused', message: `Bot "${name}" is paused.` });
        fetchBots();
      }
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: 'Could not pause bot.' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this bot?')) return;
    try {
      const res = await api.delete(`/bots/${id}`);
      if (res.data.success) {
        addToast({ type: 'success', title: 'Bot Removed', message: 'Bot deleted from manager.' });
        fetchBots();
      }
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: 'Could not delete bot.' });
    }
  };

  const handleCreateBot = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const payload = {
        name: botName,
        asset: botAsset,
        strategy: botStrategy,
        capital: parseFloat(botCapital),
        riskSettings: {
          riskPerTrade: parseFloat(riskPerTrade),
          stopLoss: parseFloat(stopLoss),
          takeProfit: parseFloat(takeProfit),
        },
      };
      const res = await api.post('/bots', payload);
      if (res.data.success) {
        addToast({ type: 'success', title: 'Bot Created', message: `Trading bot "${botName}" deployed.` });
        setModalOpen(false);
        fetchBots();
      }
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: err.response?.data?.message || 'Failed to create bot.' });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Algorithmic Bot Manager</h1>
          <p className="text-xs text-slate-400 mt-1">
            Build, deploy, and monitor 24/7 quantitative paper trading bots powered by real-time market data
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand to-cyan-500 hover:from-cyan-400 hover:to-brand text-dark-950 font-bold text-xs tracking-wide shadow-lg shadow-cyan-500/25 transition flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Bot</span>
        </button>
      </div>

      {/* Bots Grid */}
      {bots.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-dark-900 border border-slate-800">
          <div className="w-14 h-14 rounded-2xl bg-brand/10 border border-brand/30 flex items-center justify-center text-brand mx-auto mb-4">
            <BotIcon className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white">No Trading Bots Deployed Yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-6">
            Create automated bots that evaluate moving averages, RSI oversold bounces, or momentum spikes on live simulated tick streams.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="px-6 py-2.5 rounded-xl bg-brand text-dark-950 font-bold text-xs shadow-lg shadow-cyan-500/20"
          >
            Deploy First Bot
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {bots.map((bot) => {
            const botId = bot.id || bot._id;
            return (
              <div
                key={botId}
                className="p-5 rounded-2xl bg-dark-900 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-9 h-9 rounded-xl bg-brand/10 border border-brand/30 flex items-center justify-center text-brand">
                        <BotIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white truncate max-w-[150px]">
                          {bot.name}
                        </h4>
                        <div className="text-[11px] font-mono text-slate-400">
                          {bot.asset} • {bot.strategy}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full flex items-center space-x-1 ${
                        bot.status === 'RUNNING'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : bot.status === 'PAUSED'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {bot.status === 'RUNNING' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1"></span>
                      )}
                      <span>{bot.status}</span>
                    </span>
                  </div>

                  {/* Bot Key Stats */}
                  <div className="grid grid-cols-2 gap-2 my-4 p-3 bg-dark-850 rounded-xl text-xs font-mono">
                    <div>
                      <span className="text-slate-500 text-[10px] block">Capital</span>
                      <span className="text-white font-bold">₹{bot.capital?.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Total Profit</span>
                      <span
                        className={`font-bold ${
                          (bot.totalProfit || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {(bot.totalProfit || 0) >= 0 ? '+' : ''}₹{bot.totalProfit?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Trades / Win Rate</span>
                      <span className="text-slate-300">
                        {bot.totalTrades || 0} / {bot.winRate || 0}%
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Last Signal</span>
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
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center space-x-1.5">
                    {bot.status === 'RUNNING' ? (
                      <>
                        <button
                          onClick={() => handleStop(botId, bot.name)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition"
                          title="Stop Bot"
                        >
                          <Square className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handlePause(botId, bot.name)}
                          className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition"
                          title="Pause Bot"
                        >
                          <Pause className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleStart(botId, bot.name)}
                        className="px-3 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/40 transition flex items-center space-x-1"
                      >
                        <Play className="w-3 h-3 fill-emerald-400" />
                        <span>Start</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleDelete(botId)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                      title="Delete Bot"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => navigate(`/bots/${botId}`)}
                    className="text-brand hover:underline flex items-center space-x-1 text-xs"
                  >
                    <span>View Details</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Bot Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-dark-900 border border-slate-700 rounded-3xl p-6 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-5">
              <div className="flex items-center space-x-2">
                <BotIcon className="w-5 h-5 text-brand" />
                <h3 className="text-base font-bold text-white">Deploy Algorithmic Trading Bot</h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBot} className="space-y-4 text-xs font-mono">
              <div>
                <label className="text-slate-300 font-sans block mb-1">Bot Name</label>
                <input
                  type="text"
                  required
                  value={botName}
                  onChange={(e) => setBotName(e.target.value)}
                  className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-sans block mb-1">Target Asset</label>
                  <select
                    value={botAsset}
                    onChange={(e) => setBotAsset(e.target.value)}
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
                  <label className="text-slate-300 font-sans block mb-1">Algorithmic Strategy</label>
                  <select
                    value={botStrategy}
                    onChange={(e) => setBotStrategy(e.target.value)}
                    className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand font-sans"
                  >
                    <option value="MA_CROSSOVER">MA Crossover (SMA 9/21)</option>
                    <option value="RSI_STRATEGY">RSI Mean Reversion (14)</option>
                    <option value="MACD_STRATEGY">MACD Momentum Signal</option>
                    <option value="BOLLINGER_BANDS">Bollinger Bands Breakout</option>
                    <option value="MOMENTUM">Rate of Change Momentum</option>
                    <option value="TREND_FOLLOWING">EMA Trend Following</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-300 font-sans block mb-1">Allocated Capital (₹)</label>
                  <input
                    type="number"
                    required
                    value={botCapital}
                    onChange={(e) => setBotCapital(e.target.value)}
                    className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-sans block mb-1">Stop Loss %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={stopLoss}
                    onChange={(e) => setStopLoss(e.target.value)}
                    className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-sans block mb-1">Take Profit %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={takeProfit}
                    onChange={(e) => setTakeProfit(e.target.value)}
                    className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand"
                  />
                </div>
              </div>

              <div className="p-3 bg-dark-850 rounded-xl border border-slate-800 text-[11px] text-slate-400 font-sans leading-relaxed">
                The bot will automatically evaluate the chosen strategy every time a simulated price tick arrives on WebSocket and generate paper orders adhering to risk parameters.
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3 font-sans">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:bg-dark-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2.5 rounded-xl bg-brand hover:bg-cyan-400 text-dark-950 font-bold shadow-lg shadow-brand/20 transition"
                >
                  {creating ? 'Deploying...' : 'Deploy Bot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
