import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertTriangle, Save, CheckCircle2, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export default function RiskManagement() {
  const { user, updateProfile } = useAuth();
  const { addToast } = useNotification();

  const [riskPerTrade, setRiskPerTrade] = useState(user?.riskSettings?.riskPerTrade || 2);
  const [maxDailyLoss, setMaxDailyLoss] = useState(user?.riskSettings?.maxDailyLoss || 1000);
  const [maxOpenPositions, setMaxOpenPositions] = useState(user?.riskSettings?.maxOpenPositions || 5);
  const [defaultStopLoss, setDefaultStopLoss] = useState(user?.riskSettings?.defaultStopLoss || 3);
  const [defaultTakeProfit, setDefaultTakeProfit] = useState(user?.riskSettings?.defaultTakeProfit || 6);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user?.riskSettings) {
      setRiskPerTrade(user.riskSettings.riskPerTrade);
      setMaxDailyLoss(user.riskSettings.maxDailyLoss);
      setMaxOpenPositions(user.riskSettings.maxOpenPositions);
      setDefaultStopLoss(user.riskSettings.defaultStopLoss);
      setDefaultTakeProfit(user.riskSettings.defaultTakeProfit);
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateProfile({
        riskSettings: {
          riskPerTrade: Number(riskPerTrade),
          maxDailyLoss: Number(maxDailyLoss),
          maxOpenPositions: Number(maxOpenPositions),
          defaultStopLoss: Number(defaultStopLoss),
          defaultTakeProfit: Number(defaultTakeProfit),
        },
      });

      if (res.success) {
        addToast({
          type: 'success',
          title: 'Risk Guard Rules Updated',
          message: 'Backend risk engine will enforce these updated thresholds across all orders and bots.',
        });
      }
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: 'Could not update risk settings.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Risk Management & Circuit Breakers</h1>
        <p className="text-xs text-slate-400 mt-1">
          Enforce institutional-grade capital protection rules and automatic emergency bot shutoff
        </p>
      </div>

      {/* Circuit Breaker Status Banner */}
      <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-start space-x-3 text-xs">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-emerald-200">Active Risk Protection Engaged</h4>
          <p className="text-slate-300 mt-0.5 leading-relaxed">
            The backend Order Engine and Bot Engine continuously validate every simulated order.
            If your daily loss breaches <strong className="text-white">₹{maxDailyLoss}</strong>, all
            running bots are instantly halted and high-priority alerts are dispatched.
          </p>
        </div>
      </div>

      {/* Risk Rule Form */}
      <div className="p-6 rounded-3xl bg-dark-900 border border-slate-800">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Risk Per Trade (% of Capital)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.5"
                max="10"
                value={riskPerTrade}
                onChange={(e) => setRiskPerTrade(e.target.value)}
                className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-brand"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Limits capital allocation on a single bot or order entry (Recommended: 1% - 3%)
              </span>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Maximum Daily Loss Circuit Breaker (₹)
              </label>
              <input
                type="number"
                step="50"
                value={maxDailyLoss}
                onChange={(e) => setMaxDailyLoss(e.target.value)}
                className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-brand"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                If daily loss hits this ceiling, all running bots are automatically stopped
              </span>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Maximum Concurrent Open Positions
              </label>
              <input
                type="number"
                min="1"
                max="15"
                value={maxOpenPositions}
                onChange={(e) => setMaxOpenPositions(e.target.value)}
                className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-brand"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Prevents over-exposure by rejecting new BUY orders once limit is reached
              </span>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Default Stop Loss (%)
              </label>
              <input
                type="number"
                step="0.5"
                value={defaultStopLoss}
                onChange={(e) => setDefaultStopLoss(e.target.value)}
                className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-brand"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Automatically attached to new bot orders
              </span>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Default Take Profit (%)
              </label>
              <input
                type="number"
                step="0.5"
                value={defaultTakeProfit}
                onChange={(e) => setDefaultTakeProfit(e.target.value)}
                className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-brand"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Target profit ratio for automated bot exits
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-brand hover:bg-cyan-400 text-dark-950 font-bold text-xs shadow-lg shadow-brand/20 transition flex items-center space-x-2"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving Rules...' : 'Save Risk Rules'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
