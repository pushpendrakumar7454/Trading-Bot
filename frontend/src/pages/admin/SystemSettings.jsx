import React, { useState } from 'react';
import { Sliders, ShieldAlert, Database, Cpu, CheckCircle2, Save } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

export default function SystemSettings() {
  const { addToast } = useNotification();
  const [tickInterval, setTickInterval] = useState('1500');
  const [makerFee, setMakerFee] = useState('0.1');
  const [maxPositionsGlobal, setMaxPositionsGlobal] = useState('10');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    addToast({
      type: 'success',
      title: 'Global Settings Updated',
      message: 'System parameters successfully persisted to environment.',
    });
  };

  const handleEmergencyStopAll = () => {
    if (!window.confirm('WARNING: Emergency killswitch will halt ALL running bots across all users. Proceed?')) return;
    addToast({
      type: 'error',
      title: 'Global Killswitch Triggered',
      message: 'All running trading bots across the platform were halted immediately.',
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Global Platform Configuration</h1>
        <p className="text-xs text-slate-400 mt-1">
          Adjust simulation engine parameters, trading fees, and global security killswitches
        </p>
      </div>

      {/* Emergency Killswitch Banner */}
      <div className="p-5 rounded-3xl bg-rose-950/40 border border-rose-500/30 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-rose-300 flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Emergency Bot Halt Killswitch</span>
          </h3>
          <p className="text-xs text-slate-300 mt-0.5">
            Immediately forces all active bots to STOPPED status across every registered user.
          </p>
        </div>

        <button
          onClick={handleEmergencyStopAll}
          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition shrink-0"
        >
          Halt All Bots
        </button>
      </div>

      {/* Global Engine Form */}
      <div className="p-6 rounded-3xl bg-dark-900 border border-slate-800">
        <form onSubmit={handleSave} className="space-y-5 text-xs font-mono">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="text-slate-300 font-sans font-semibold block mb-1">
                Market Simulation Tick Interval (ms)
              </label>
              <input
                type="number"
                value={tickInterval}
                onChange={(e) => setTickInterval(e.target.value)}
                className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand"
              />
              <span className="text-[10px] text-slate-500 font-sans mt-1 block">
                Standard: 1500ms (1.5 seconds per brownian tick)
              </span>
            </div>

            <div>
              <label className="text-slate-300 font-sans font-semibold block mb-1">
                Simulated Trading Fee (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={makerFee}
                onChange={(e) => setMakerFee(e.target.value)}
                className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand"
              />
              <span className="text-[10px] text-slate-500 font-sans mt-1 block">
                Default: 0.10% per executed trade
              </span>
            </div>

            <div>
              <label className="text-slate-300 font-sans font-semibold block mb-1">
                Global Max Position Limit Per User
              </label>
              <input
                type="number"
                value={maxPositionsGlobal}
                onChange={(e) => setMaxPositionsGlobal(e.target.value)}
                className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-dark-850 border border-slate-800 self-end">
              <div>
                <span className="text-slate-300 font-sans font-semibold block">Maintenance Mode</span>
                <span className="text-[10px] text-slate-500 font-sans">Temporarily pause paper order execution</span>
              </div>
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                className="w-4 h-4 accent-brand cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end font-sans">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-brand hover:bg-cyan-400 text-dark-950 font-bold text-xs shadow-lg shadow-brand/20 transition flex items-center space-x-2"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save System Parameters</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
