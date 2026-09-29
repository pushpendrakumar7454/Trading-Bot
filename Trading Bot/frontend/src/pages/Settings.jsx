import React, { useState } from 'react';
import { Sliders, Sun, Moon, Volume2, Globe, Save } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { addToast } = useNotification();

  const [currency, setCurrency] = useState('INR');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [orderConfirmation, setOrderConfirmation] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    addToast({
      type: 'success',
      title: 'Preferences Saved',
      message: 'Your platform settings have been updated.',
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-white">System Settings</h1>
        <p className="text-xs text-slate-400 mt-1">
          Customize platform appearance, audio alerts, and execution preferences
        </p>
      </div>

      <div className="p-6 rounded-3xl bg-dark-900 border border-slate-800 space-y-6">
        {/* Theme Setting */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              {theme === 'dark' ? <Moon className="w-4 h-4 text-brand" /> : <Sun className="w-4 h-4 text-amber-400" />}
              <span>Interface Theme</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Currently using {theme === 'dark' ? 'Fintech Dark Terminal' : 'Light Mode'}
            </p>
          </div>

          <button
            onClick={toggleTheme}
            className="px-4 py-2 rounded-xl bg-dark-850 hover:bg-dark-800 border border-slate-700 text-xs font-semibold text-slate-200 transition"
          >
            Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
          </button>
        </div>

        {/* Currency Formatting */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>Base Currency Display</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Select primary currency symbol for portfolio and order values
            </p>
          </div>

          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="bg-dark-850 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-brand"
          >
            <option value="INR">₹ INR (Indian Rupee)</option>
            <option value="USD">$ USD (US Dollar)</option>
          </select>
        </div>

        {/* Notification Sound */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Volume2 className="w-4 h-4 text-purple-400" />
              <span>Audio Chime on Order Fill</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Play subtle audio feedback whenever a bot or market order executes
            </p>
          </div>

          <input
            type="checkbox"
            checked={soundEnabled}
            onChange={(e) => setSoundEnabled(e.target.checked)}
            className="w-4 h-4 accent-brand cursor-pointer"
          />
        </div>

        {/* Order Confirmation Prompt */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white">One-Click Order Execution</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Instantly submit terminal orders without secondary modal prompt
            </p>
          </div>

          <input
            type="checkbox"
            checked={!orderConfirmation}
            onChange={(e) => setOrderConfirmation(!e.target.checked)}
            className="w-4 h-4 accent-brand cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
