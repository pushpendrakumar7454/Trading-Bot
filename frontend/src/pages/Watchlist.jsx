import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Plus, Trash2, ExternalLink } from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { useNotification } from '../context/NotificationContext';

export default function Watchlist() {
  const { assets, priceFlashes, setSelectedSymbol } = useMarket();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const [watchlist, setWatchlist] = useState(() => {
    return JSON.parse(localStorage.getItem('user_watchlist') || '["BTC/USDT", "ETH/USDT", "SOL/USDT"]');
  });

  const [selectedToAdd, setSelectedToAdd] = useState('');

  const removeSymbol = (symbol) => {
    const next = watchlist.filter((s) => s !== symbol);
    setWatchlist(next);
    localStorage.setItem('user_watchlist', JSON.stringify(next));
    addToast({ type: 'info', title: 'Watchlist', message: `Removed ${symbol}` });
  };

  const addSymbol = () => {
    if (!selectedToAdd) return;
    if (watchlist.includes(selectedToAdd)) {
      addToast({ type: 'info', title: 'Watchlist', message: 'Asset already in watchlist.' });
      return;
    }
    const next = [...watchlist, selectedToAdd];
    setWatchlist(next);
    localStorage.setItem('user_watchlist', JSON.stringify(next));
    addToast({ type: 'success', title: 'Watchlist', message: `Added ${selectedToAdd}` });
    setSelectedToAdd('');
  };

  const handleTrade = (symbol) => {
    setSelectedSymbol(symbol);
    navigate('/trade');
  };

  const trackedAssets = assets.filter((a) => watchlist.includes(a.symbol));
  const availableToAdd = assets.filter((a) => !watchlist.includes(a.symbol));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Custom Watchlist</h1>
          <p className="text-xs text-slate-400 mt-1">
            Pin and monitor priority crypto pairs with instant live price stream
          </p>
        </div>

        {availableToAdd.length > 0 && (
          <div className="flex items-center space-x-2">
            <select
              value={selectedToAdd}
              onChange={(e) => setSelectedToAdd(e.target.value)}
              className="bg-dark-850 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand"
            >
              <option value="">Select asset to add...</option>
              {availableToAdd.map((a) => (
                <option key={a.symbol} value={a.symbol}>
                  {a.symbol} ({a.name})
                </option>
              ))}
            </select>
            <button
              onClick={addSymbol}
              disabled={!selectedToAdd}
              className="px-4 py-2 rounded-xl bg-brand hover:bg-cyan-400 text-dark-950 font-bold text-xs transition flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        )}
      </div>

      <div className="p-5 rounded-2xl bg-dark-900 border border-slate-800">
        {trackedAssets.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500">
            Your watchlist is currently empty. Add assets above or click the star icon in Markets.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase font-sans">
                  <th className="py-3 px-3">Asset</th>
                  <th className="py-3 px-3">Price</th>
                  <th className="py-3 px-3">24h Change</th>
                  <th className="py-3 px-3">24h High</th>
                  <th className="py-3 px-3">24h Low</th>
                  <th className="py-3 px-3">24h Volume</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {trackedAssets.map((asset) => {
                  const flash = priceFlashes[asset.symbol];
                  return (
                    <tr
                      key={asset.symbol}
                      className={`hover:bg-dark-850/60 transition ${
                        flash === 'up' ? 'flash-up' : flash === 'down' ? 'flash-down' : ''
                      }`}
                    >
                      <td className="py-3 px-3 font-sans">
                        <div className="font-bold text-white flex items-center space-x-1.5">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span>{asset.symbol}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">{asset.name}</div>
                      </td>
                      <td className="py-3 px-3 font-bold text-white text-sm">
                        ₹{asset.price?.toLocaleString()}
                      </td>
                      <td
                        className={`py-3 px-3 font-bold ${
                          asset.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {asset.changePercent24h >= 0 ? '+' : ''}
                        {asset.changePercent24h}%
                      </td>
                      <td className="py-3 px-3 text-slate-300">₹{asset.high24h?.toLocaleString()}</td>
                      <td className="py-3 px-3 text-slate-300">₹{asset.low24h?.toLocaleString()}</td>
                      <td className="py-3 px-3 text-slate-400">
                        {asset.volume24h?.toLocaleString()} USDT
                      </td>
                      <td className="py-3 px-3 text-right font-sans space-x-2">
                        <button
                          onClick={() => handleTrade(asset.symbol)}
                          className="px-3 py-1 rounded-xl bg-brand/10 hover:bg-brand/20 border border-brand/30 text-brand text-xs font-semibold transition inline-flex items-center space-x-1"
                        >
                          <span>Trade</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => removeSymbol(asset.symbol)}
                          className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                          title="Remove"
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
    </div>
  );
}
