import React, { useState, useEffect } from 'react';
import { Search, Filter, XCircle, RotateCcw } from 'lucide-react';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sideFilter, setSideFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { addToast } = useNotification();

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders?limit=100');
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleCancel = async (id) => {
    try {
      const res = await api.delete(`/orders/${id}`);
      if (res.data.success) {
        addToast({ type: 'success', title: 'Order Cancelled', message: 'Pending order cancelled.' });
        fetchOrders();
      }
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: err.response?.data?.message || 'Failed to cancel.' });
    }
  };

  let filtered = orders.filter((o) => o.asset.toLowerCase().includes(search.toLowerCase()));
  if (statusFilter !== 'ALL') filtered = filtered.filter((o) => o.status === statusFilter);
  if (sideFilter !== 'ALL') filtered = filtered.filter((o) => o.side === sideFilter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Order Management</h1>
        <p className="text-xs text-slate-400 mt-1">
          Complete ledger of simulated Market, Limit, and Stop orders
        </p>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-dark-900 border border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'OPEN', 'FILLED', 'CANCELLED', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                statusFilter === st
                  ? 'bg-brand/10 border border-brand/40 text-brand'
                  : 'bg-dark-850 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-48">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by asset..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-dark-850 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand"
            />
          </div>

          <select
            value={sideFilter}
            onChange={(e) => setSideFilter(e.target.value)}
            className="bg-dark-850 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-brand"
          >
            <option value="ALL">All Sides</option>
            <option value="BUY">BUY Only</option>
            <option value="SELL">SELL Only</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="p-5 rounded-2xl bg-dark-900 border border-slate-800">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500">
            No matching orders found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase font-sans">
                  <th className="py-3 px-3">Asset</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Side</th>
                  <th className="py-3 px-3">Quantity</th>
                  <th className="py-3 px-3">Target Price</th>
                  <th className="py-3 px-3">Filled Price</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Created</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((ord) => (
                  <tr key={ord.id || ord._id} className="hover:bg-dark-850/60">
                    <td className="py-3 px-3 font-bold text-white font-sans">{ord.asset}</td>
                    <td className="py-3 px-3 text-slate-400">{ord.type}</td>
                    <td
                      className={`py-3 px-3 font-semibold ${
                        ord.side === 'BUY' ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {ord.side}
                    </td>
                    <td className="py-3 px-3 text-slate-300">{ord.quantity}</td>
                    <td className="py-3 px-3 text-white">₹{ord.price?.toLocaleString()}</td>
                    <td className="py-3 px-3 text-slate-300">
                      {ord.filledPrice ? `₹${ord.filledPrice.toLocaleString()}` : '-'}
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          ord.status === 'FILLED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : ord.status === 'OPEN'
                            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                            : ord.status === 'CANCELLED'
                            ? 'bg-slate-800 text-slate-400'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500 text-[11px]">
                      {new Date(ord.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-sans">
                      {ord.status === 'OPEN' && (
                        <button
                          onClick={() => handleCancel(ord.id || ord._id)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                        >
                          Cancel
                        </button>
                      )}
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
