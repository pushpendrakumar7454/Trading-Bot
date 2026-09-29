import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Star, TrendingUp, TrendingDown, ArrowUpDown, ExternalLink } from 'lucide-react';
import { useMarket } from '../context/MarketContext';
import { useNotification } from '../context/NotificationContext';

export default function Markets() {
  const { assets, priceFlashes, setSelectedSymbol } = useMarket();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [sortField, setSortField] = useState('volume');
  const [watchlist, setWatchlist] = useState(() => {
    return JSON.parse(localStorage.getItem('user_watchlist') || '["BTC/USDT", "ETH/USDT"]');
  });

  const toggleWatchlist = (symbol, e) => {
    e.stopPropagation();
    let next;
    if (watchlist.includes(symbol)) {
      next = watchlist.filter((s) => s !== symbol);
      addToast({ type: 'info', title: 'Watchlist', message: `Removed ${symbol} from watchlist.` });
    } else {
      next = [...watchlist, symbol];
      addToast({ type: 'success', title: 'Watchlist', message: `Added ${symbol} to watchlist.` });
    }
    setWatchlist(next);
    localStorage.setItem('user_watchlist', JSON.stringify(next));
  };

  const handleTrade = (symbol) => {
    setSelectedSymbol(symbol);
    navigate('/trade');
  };

  // Filter & Search
  let filtered = assets.filter(
    (a) =>
      a.symbol.toLowerCase().includes(search.toLowerCase()) ||
      a.name.toLowerCase().includes(search.toLowerCase())
  );

  if (filter === 'GAINERS') filtered = filtered.filter((a) => a.change24h > 0);
  if (filter === 'LOSERS') filtered = filtered.filter((a) => a.change24h < 0);
  if (filter === 'WATCHLIST') filtered = filtered.filter((a) => watchlist.includes(a.symbol));

  // Sort
  filtered.sort((a, b) => {
    if (sortField === 'price') return b.price - a.price;
    if (sortField === 'change') return b.changePercent24h - a.changePercent24h;
    if (sortField === 'volume') return b.volume24h - a.volume24h;
    return 0;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Cryptocurrency Markets</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time simulated pricing and order routing across 7 high-liquidity crypto assets
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-dark-900 border border-slate-800">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          {['ALL', 'GAINERS', 'LOSERS', 'WATCHLIST'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                filter === f
                  ? 'bg-brand/10 border border-brand/40 text-brand'
                  : 'bg-dark-850 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search symbol or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-dark-850 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand"
            />
          </div>

          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value)}
            className="bg-dark-850 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-brand"
          >
            <option value="volume">Sort by Volume</option>
            <option value="price">Sort by Price</option>
            <option value="change">Sort by 24h Change</option>
          </select>
        </div>
      </div>

      {/* Markets Table */}
      <div className="p-5 rounded-2xl bg-dark-900 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <th className="py-3 px-3">Fav</th>
                <th className="py-3 px-3">Market</th>
                <th className="py-3 px-3">Price</th>
                <th className="py-3 px-3">24h Change</th>
                <th className="py-3 px-3">24h High</th>
                <th className="py-3 px-3">24h Low</th>
                <th className="py-3 px-3">24h Volume</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Trade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filtered.map((asset) => {
                const isFav = watchlist.includes(asset.symbol);
                const flash = priceFlashes[asset.symbol];
                return (
                  <tr
                    key={asset.symbol}
                    onClick={() => handleTrade(asset.symbol)}
                    className={`hover:bg-dark-850/70 transition cursor-pointer ${
                      flash === 'up' ? 'flash-up' : flash === 'down' ? 'flash-down' : ''
                    }`}
                  >
                    <td className="py-3 px-3">
                      <button
                        onClick={(e) => toggleWatchlist(asset.symbol, e)}
                        className={`p-1 rounded hover:bg-dark-800 transition ${
                          isFav ? 'text-amber-400' : 'text-slate-600 hover:text-slate-300'
                        }`}
                      >
                        <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400' : ''}`} />
                      </button>
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <div className="font-bold text-white flex items-center space-x-1.5">
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
                    <td className="py-3 px-3 font-sans">
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {asset.marketStatus || 'OPEN'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-sans">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTrade(asset.symbol);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-brand hover:bg-cyan-400 text-dark-950 font-bold text-xs shadow-md shadow-brand/10 transition inline-flex items-center space-x-1"
                      >
                        <span>Trade</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
