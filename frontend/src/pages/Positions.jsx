import React, { useState, useEffect } from 'react';
import { Layers, ArrowRight, CheckCircle2, RefreshCw } from 'lucide-react';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';

export default function Positions() {
  const [tab, setTab] = useState('OPEN'); // OPEN | CLOSED
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useNotification();

  const fetchPositions = async () => {
    try {
      const res = await api.get(`/positions?status=${tab}`);
      if (res.data.success) {
        setPositions(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
    const interval = setInterval(fetchPositions, 3000);
    return () => clearInterval(interval);
  }, [tab]);

  const handleClose = async (id, asset) => {
    try {
      const res = await api.post(`/positions/${id}/close`);
      if (res.data.success) {
        addToast({
          type: 'success',
          title: 'Position Closed',
          message: `Closed simulated position for ${asset}.`,
        });
        fetchPositions();
      }
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Error',
        message: err.response?.data?.message || 'Could not close position.',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Positions Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Track and manage your live open mark-to-market positions and historical closures
          </p>
        </div>

        <div className="flex items-center space-x-2 p-1 bg-dark-900 border border-slate-800 rounded-xl">
          <button
            onClick={() => setTab('OPEN')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
              tab === 'OPEN'
                ? 'bg-brand/10 border border-brand/40 text-brand'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Open Positions
          </button>
          <button
            onClick={() => setTab('CLOSED')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
              tab === 'CLOSED'
                ? 'bg-brand/10 border border-brand/40 text-brand'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Closed History
          </button>
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-dark-900 border border-slate-800">
        {positions.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500">
            {tab === 'OPEN' ? 'No open positions right now.' : 'No closed positions recorded.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase font-sans">
                  <th className="py-3 px-3">Asset</th>
                  <th className="py-3 px-3">Side</th>
                  <th className="py-3 px-3">Quantity</th>
                  <th className="py-3 px-3">Entry Price</th>
                  <th className="py-3 px-3">Mark Price</th>
                  <th className="py-3 px-3">Stop Loss</th>
                  <th className="py-3 px-3">Take Profit</th>
                  <th className="py-3 px-3">Unrealized P&L</th>
                  <th className="py-3 px-3">Opened At</th>
                  {tab === 'OPEN' && <th className="py-3 px-3 text-right">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {positions.map((pos) => (
                  <tr key={pos.id || pos._id} className="hover:bg-dark-850/60">
                    <td className="py-3 px-3 font-bold text-white font-sans">{pos.asset}</td>
                    <td
                      className={`py-3 px-3 font-semibold ${
                        pos.side === 'BUY' ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {pos.side}
                    </td>
                    <td className="py-3 px-3 text-slate-300">{pos.quantity}</td>
                    <td className="py-3 px-3 text-slate-400">₹{pos.entryPrice?.toLocaleString()}</td>
                    <td className="py-3 px-3 text-white font-bold">₹{pos.currentPrice?.toLocaleString()}</td>
                    <td className="py-3 px-3 text-rose-400">{pos.stopLoss ? `₹${pos.stopLoss}` : '-'}</td>
                    <td className="py-3 px-3 text-emerald-400">{pos.takeProfit ? `₹${pos.takeProfit}` : '-'}</td>
                    <td
                      className={`py-3 px-3 font-bold ${
                        (pos.unrealizedPnL || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {(pos.unrealizedPnL || 0) >= 0 ? '+' : ''}₹{pos.unrealizedPnL?.toFixed(2)} (
                      {pos.unrealizedPnLPercent}%)
                    </td>
                    <td className="py-3 px-3 text-slate-500 text-[11px]">
                      {new Date(pos.openedAt).toLocaleString()}
                    </td>
                    {tab === 'OPEN' && (
                      <td className="py-3 px-3 text-right font-sans">
                        <button
                          onClick={() => handleClose(pos.id || pos._id, pos.asset)}
                          className="px-3 py-1 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-semibold transition"
                        >
                          Close Position
                        </button>
                      </td>
                    )}
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
