import React, { useState, useEffect } from 'react';
import { Download, Search, Filter } from 'lucide-react';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';

export default function TradeHistory() {
  const [trades, setTrades] = useState([]);
  const [search, setSearch] = useState('');
  const [sideFilter, setSideFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const { addToast } = useNotification();

  const fetchTrades = async () => {
    try {
      const res = await api.get('/trades?limit=200');
      if (res.data.success) {
        setTrades(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrades();
  }, []);

  const exportCSV = () => {
    if (trades.length === 0) {
      addToast({ type: 'info', title: 'Export', message: 'No trades available to export.' });
      return;
    }
    const headers = ['Trade ID', 'Asset', 'Side', 'Quantity', 'Price', 'Fee', 'PnL', 'Strategy', 'Date'];
    const rows = trades.map((t) => [
      t._id || t.id,
      t.asset,
      t.side,
      t.quantity,
      t.price,
      t.fee,
      t.realizedPnL || 0,
      t.strategy,
      new Date(t.createdAt).toISOString(),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `trades_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast({ type: 'success', title: 'Exported CSV', message: 'Trade history CSV downloaded.' });
  };

  let filtered = trades.filter((t) => t.asset.toLowerCase().includes(search.toLowerCase()));
  if (sideFilter !== 'ALL') filtered = filtered.filter((t) => t.side === sideFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Trade History</h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete transaction execution log with realized P&L and fee accounting
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="px-4 py-2 rounded-xl bg-dark-850 hover:bg-dark-800 border border-slate-700 text-xs font-semibold text-white transition flex items-center space-x-2"
        >
          <Download className="w-3.5 h-3.5 text-brand" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-dark-900 border border-slate-800">
        <div className="flex items-center space-x-2">
          {['ALL', 'BUY', 'SELL'].map((s) => (
            <button
              key={s}
              onClick={() => setSideFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                sideFilter === s
                  ? 'bg-brand/10 border border-brand/40 text-brand'
                  : 'bg-dark-850 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search asset..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-dark-850 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand"
          />
        </div>
      </div>

      {/* Trades Table */}
      <div className="p-5 rounded-2xl bg-dark-900 border border-slate-800">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500">
            No executed trades recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase font-sans">
                  <th className="py-3 px-3">Trade ID</th>
                  <th className="py-3 px-3">Asset</th>
                  <th className="py-3 px-3">Side</th>
                  <th className="py-3 px-3">Quantity</th>
                  <th className="py-3 px-3">Executed Price</th>
                  <th className="py-3 px-3">Total Value</th>
                  <th className="py-3 px-3">Fee</th>
                  <th className="py-3 px-3">Realized P&L</th>
                  <th className="py-3 px-3">Strategy</th>
                  <th className="py-3 px-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((tr) => (
                  <tr key={tr.id || tr._id} className="hover:bg-dark-850/60">
                    <td className="py-3 px-3 text-slate-500">
                      #{(tr.id || tr._id).toString().slice(-6)}
                    </td>
                    <td className="py-3 px-3 font-bold text-white font-sans">{tr.asset}</td>
                    <td
                      className={`py-3 px-3 font-semibold ${
                        tr.side === 'BUY' ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {tr.side}
                    </td>
                    <td className="py-3 px-3 text-slate-300">{tr.quantity}</td>
                    <td className="py-3 px-3 text-white">₹{tr.price?.toLocaleString()}</td>
                    <td className="py-3 px-3 text-slate-300">₹{tr.totalValue?.toLocaleString()}</td>
                    <td className="py-3 px-3 text-slate-400">₹{tr.fee?.toFixed(2)}</td>
                    <td
                      className={`py-3 px-3 font-bold ${
                        (tr.realizedPnL || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {(tr.realizedPnL || 0) >= 0 ? '+' : ''}₹{tr.realizedPnL?.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-slate-400 font-sans text-[11px]">{tr.strategy}</td>
                    <td className="py-3 px-3 text-right text-slate-500 text-[11px]">
                      {new Date(tr.createdAt).toLocaleString()}
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
