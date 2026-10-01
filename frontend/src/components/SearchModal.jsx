import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, TrendingUp, Cpu, BookOpen, Layers, X } from 'lucide-react';
import { useMarket } from '../context/MarketContext';

const SEARCH_ITEMS = [
  { type: 'Page', name: 'Dashboard', path: '/dashboard', icon: Layers },
  { type: 'Page', name: 'Trading Terminal', path: '/trade', icon: TrendingUp },
  { type: 'Page', name: 'Portfolio Overview', path: '/portfolio', icon: Layers },
  { type: 'Page', name: 'Positions Management', path: '/positions', icon: TrendingUp },
  { type: 'Page', name: 'Order History', path: '/orders', icon: BookOpen },
  { type: 'Page', name: 'Bot Manager', path: '/bots', icon: Cpu },
  { type: 'Page', name: 'Strategies Directory', path: '/strategies', icon: Cpu },
  { type: 'Page', name: 'Algorithmic Backtesting', path: '/backtesting', icon: TrendingUp },
  { type: 'Page', name: 'Performance Analytics', path: '/analytics', icon: TrendingUp },
  { type: 'Page', name: 'Risk Management Rules', path: '/risk', icon: Layers },
  { type: 'Page', name: 'Price & Risk Alerts', path: '/alerts', icon: Layers },
  { type: 'Page', name: 'Market News Feed', path: '/news', icon: BookOpen },
  { type: 'Page', name: 'Transaction Ledger', path: '/transactions', icon: BookOpen },
  { type: 'Page', name: 'Account Profile', path: '/profile', icon: Layers },
  { type: 'Page', name: 'System Settings', path: '/settings', icon: Layers },
  { type: 'Page', name: 'Documentation & API', path: '/docs', icon: BookOpen },
  { type: 'Page', name: 'Admin Dashboard', path: '/admin', icon: Layers },
];

export default function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { assets, setSelectedSymbol } = useMarket();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter items & assets
  const filteredPages = SEARCH_ITEMS.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase())
  );

  const filteredAssets = assets.filter(
    (a) =>
      a.symbol.toLowerCase().includes(query.toLowerCase()) ||
      a.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelectPage = (path) => {
    navigate(path);
    onClose();
  };

  const handleSelectAsset = (symbol) => {
    setSelectedSymbol(symbol);
    navigate(`/trade`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-xl bg-dark-900 border border-slate-700/60 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center px-4 py-3 border-b border-slate-800">
          <Search className="w-5 h-5 text-brand mr-3" />
          <input
            type="text"
            placeholder="Search assets, pages, bots, strategies... (ESC to close)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none"
          />
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-3 space-y-4">
          {/* Assets Section */}
          {filteredAssets.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-400 px-3 py-1 uppercase tracking-wider">
                Crypto Assets
              </div>
              <div className="space-y-1 mt-1">
                {filteredAssets.map((asset) => (
                  <button
                    key={asset.symbol}
                    onClick={() => handleSelectAsset(asset.symbol)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left hover:bg-dark-800 transition"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-7 h-7 rounded-full bg-brand/10 border border-brand/30 flex items-center justify-center font-bold text-xs text-brand">
                        {asset.symbol.split('/')[0]}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{asset.symbol}</div>
                        <div className="text-xs text-slate-400">{asset.name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-mono font-medium text-white">
                        ₹{asset.price?.toLocaleString()}
                      </div>
                      <div
                        className={`text-xs font-mono ${
                          asset.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {asset.changePercent24h >= 0 ? '+' : ''}
                        {asset.changePercent24h}%
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Pages */}
          {filteredPages.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-slate-400 px-3 py-1 uppercase tracking-wider">
                Platform Navigation
              </div>
              <div className="space-y-1 mt-1">
                {filteredPages.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleSelectPage(item.path)}
                      className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left hover:bg-dark-800 transition"
                    >
                      <Icon className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-200">{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {filteredAssets.length === 0 && filteredPages.length === 0 && (
            <div className="py-8 text-center text-sm text-slate-400">
              No matching assets or pages found for "{query}".
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
