import React, { useState, useEffect } from 'react';
import { BellRing, Plus, Trash2, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import api from '../services/api';
import { useMarket } from '../context/MarketContext';
import { useNotification } from '../context/NotificationContext';

export default function Alerts() {
  const { assets } = useMarket();
  const { addToast } = useNotification();

  const [alerts, setAlerts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);

  // Form state
  const [asset, setAsset] = useState('BTC/USDT');
  const [condition, setCondition] = useState('PRICE_ABOVE');
  const [targetValue, setTargetValue] = useState('65000');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchAlerts = async () => {
    try {
      const res = await api.get('/alerts');
      if (res.data.success) {
        setAlerts(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/alerts', {
        asset,
        condition,
        targetValue: parseFloat(targetValue),
        message: message || `${condition} on ${asset} @ ₹${targetValue}`,
      });

      if (res.data.success) {
        addToast({ type: 'success', title: 'Alert Created', message: 'Price condition trigger configured.' });
        setModalOpen(false);
        fetchAlerts();
      }
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: 'Could not create alert.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await api.delete(`/alerts/${id}`);
      if (res.data.success) {
        addToast({ type: 'info', title: 'Alert Removed', message: 'Alert was deleted.' });
        fetchAlerts();
      }
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: 'Could not delete alert.' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Price & Risk Alerts</h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure real-time threshold notifications triggered immediately by backend market ticks
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand to-cyan-500 hover:from-cyan-400 hover:to-brand text-dark-950 font-bold text-xs tracking-wide shadow-lg shadow-cyan-500/20 transition flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Alert</span>
        </button>
      </div>

      {/* Alerts Table */}
      <div className="p-5 rounded-2xl bg-dark-900 border border-slate-800">
        {alerts.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500">
            No active alerts configured. Click "New Alert" above to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase font-sans">
                  <th className="py-3 px-3">Asset</th>
                  <th className="py-3 px-3">Condition</th>
                  <th className="py-3 px-3">Target Value</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Message</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {alerts.map((alt) => {
                  const altId = alt.id || alt._id;
                  return (
                    <tr key={altId} className="hover:bg-dark-850/60">
                      <td className="py-3 px-3 font-bold text-white font-sans">{alt.asset}</td>
                      <td className="py-3 px-3 text-cyan-400 font-semibold">{alt.condition}</td>
                      <td className="py-3 px-3 text-white font-bold">₹{alt.targetValue?.toLocaleString()}</td>
                      <td className="py-3 px-3 font-sans">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            alt.status === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {alt.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-300 font-sans text-xs">{alt.message}</td>
                      <td className="py-3 px-3 text-right font-sans">
                        <button
                          onClick={() => handleDelete(altId)}
                          className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                          title="Delete Alert"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Alert Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-dark-900 border border-slate-700 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white">Create Price / Risk Alert</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs font-mono">
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
                <label className="text-slate-300 font-sans block mb-1">Trigger Condition</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand font-sans"
                >
                  <option value="PRICE_ABOVE">Price Above Target (₹)</option>
                  <option value="PRICE_BELOW">Price Below Target (₹)</option>
                  <option value="PNL_ABOVE">Position P&L Above (₹)</option>
                  <option value="PNL_BELOW">Position P&L Below (₹)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-sans block mb-1">Target Price / Value (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={targetValue}
                  onChange={(e) => setTargetValue(e.target.value)}
                  className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand"
                />
              </div>

              <div>
                <label className="text-slate-300 font-sans block mb-1">Custom Note (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. BTC Breakout Resistance"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3 py-2 text-white font-sans focus:outline-none focus:border-brand"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3 font-sans">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:bg-dark-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-brand hover:bg-cyan-400 text-dark-950 font-bold transition"
                >
                  {submitting ? 'Creating...' : 'Set Alert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
