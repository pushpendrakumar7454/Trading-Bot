import React, { useState, useEffect } from 'react';
import { Receipt, Download, Filter } from 'lucide-react';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [filterType, setFilterType] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const { addToast } = useNotification();

  const fetchTransactions = async () => {
    try {
      const res = await api.get('/transactions');
      if (res.data.success) {
        setTransactions(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const exportCSV = () => {
    if (transactions.length === 0) return;
    const headers = ['Tx ID', 'Type', 'Amount', 'Balance After', 'Asset', 'Description', 'Status', 'Date'];
    const rows = transactions.map((t) => [
      t._id || t.id,
      t.type,
      t.amount,
      t.balanceAfter,
      t.asset,
      `"${t.description}"`,
      t.status,
      new Date(t.createdAt).toISOString(),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `transactions_ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast({ type: 'success', title: 'Export Complete', message: 'Transaction ledger CSV downloaded.' });
  };

  let filtered = transactions;
  if (filterType !== 'ALL') {
    filtered = filtered.filter((t) => t.type === filterType);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Transaction Ledger</h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete virtual financial audit trail tracking deposits, trades, and fees
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="px-4 py-2 rounded-xl bg-dark-850 hover:bg-dark-800 border border-slate-700 text-xs font-semibold text-white transition flex items-center space-x-2"
        >
          <Download className="w-3.5 h-3.5 text-brand" />
          <span>Export Ledger CSV</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 p-3 rounded-2xl bg-dark-900 border border-slate-800 overflow-x-auto">
        {['ALL', 'BUY', 'SELL', 'DEPOSIT', 'RESET'].map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterType === t
                ? 'bg-brand/10 border border-brand/40 text-brand'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="p-5 rounded-2xl bg-dark-900 border border-slate-800">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500">
            No transactions found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase font-sans">
                  <th className="py-3 px-3">Tx ID</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Balance After</th>
                  <th className="py-3 px-3">Description</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((tx) => (
                  <tr key={tx.id || tx._id} className="hover:bg-dark-850/60">
                    <td className="py-3 px-3 text-slate-500">
                      #{(tx.id || tx._id).toString().slice(-6)}
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          tx.type === 'BUY'
                            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                            : tx.type === 'SELL'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : tx.type === 'DEPOSIT' || tx.type === 'RESET'
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-white">₹{tx.amount?.toLocaleString()}</td>
                    <td className="py-3 px-3 text-slate-300">₹{tx.balanceAfter?.toLocaleString()}</td>
                    <td className="py-3 px-3 text-slate-300 font-sans">{tx.description}</td>
                    <td className="py-3 px-3 text-emerald-400 font-sans text-[11px]">{tx.status}</td>
                    <td className="py-3 px-3 text-right text-slate-500 text-[11px]">
                      {new Date(tx.createdAt).toLocaleString()}
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
