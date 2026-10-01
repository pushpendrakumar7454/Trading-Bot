import React, { useState } from 'react';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export default function ResetDemoModal({ isOpen, onClose }) {
  const { resetDemoAccount } = useAuth();
  const { addToast } = useNotification();
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleReset = async () => {
    setLoading(true);
    try {
      const res = await resetDemoAccount();
      if (res.success) {
        addToast({
          type: 'success',
          title: 'Demo Account Reset',
          message: 'Portfolio balance restored to ₹10,000. All test positions and orders wiped clean.',
        });
        onClose();
        // Reload dashboard/window to reflect clean slate
        window.location.reload();
      }
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Reset Failed',
        message: err.response?.data?.message || 'Could not reset demo account.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-dark-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <h3 className="text-lg font-bold text-white mb-2">Reset Paper Trading Account?</h3>
        <p className="text-sm text-slate-300 mb-6 leading-relaxed">
          This action will reset your virtual cash balance back to{' '}
          <strong className="text-brand">₹10,000 USDT</strong>. All current open positions, active
          orders, bot trade statistics, and performance history will be permanently reset.
        </p>

        <div className="bg-dark-850 border border-slate-800 rounded-xl p-3.5 mb-6 text-xs text-slate-400 space-y-1">
          <div className="flex items-center text-emerald-400">✓ Balance reset to ₹10,000</div>
          <div className="flex items-center text-rose-400">✕ All test trades & orders deleted</div>
          <div className="flex items-center text-rose-400">✕ Active bot execution history reset</div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-slate-700 text-sm font-medium text-slate-300 hover:bg-dark-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleReset}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-sm font-semibold text-white shadow-lg shadow-rose-600/30 transition flex items-center justify-center space-x-2"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>Confirm Reset</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
