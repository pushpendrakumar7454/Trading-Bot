import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  Search,
  Sun,
  Moon,
  RotateCcw,
  User,
  LogOut,
  ChevronDown,
  ShieldAlert,
  Bot,
  TrendingUp,
  Menu,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMarket } from '../context/MarketContext';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';
import SearchModal from './SearchModal';
import ResetDemoModal from './ResetDemoModal';

export default function Navbar({ onToggleSidebar }) {
  const { user, logout, isAdmin } = useAuth();
  const { assets, priceFlashes, setSelectedSymbol } = useMarket();
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
  const navigate = useNavigate();

  const [searchOpen, setSearchOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleSelectTicker = (symbol) => {
    setSelectedSymbol(symbol);
    navigate('/trade');
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-dark-900/90 backdrop-blur-md border-b border-slate-800">
        {/* Top Mini Ticker Bar */}
        <div className="bg-dark-950/80 border-b border-slate-800/60 px-4 py-1 flex items-center overflow-x-auto text-xs font-mono space-x-6 scrollbar-none">
          <div className="flex items-center space-x-1.5 text-slate-400 font-sans font-semibold shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>LIVE SIMULATION</span>
          </div>
          <div className="flex items-center space-x-6 whitespace-nowrap">
            {assets.slice(0, 7).map((asset) => {
              const flash = priceFlashes[asset.symbol];
              return (
                <button
                  key={asset.symbol}
                  onClick={() => handleSelectTicker(asset.symbol)}
                  className={`flex items-center space-x-2 py-0.5 px-2 rounded hover:bg-dark-800 transition ${
                    flash === 'up' ? 'flash-up' : flash === 'down' ? 'flash-down' : ''
                  }`}
                >
                  <span className="text-slate-300 font-medium">{asset.symbol.split('/')[0]}</span>
                  <span className="text-white">₹{asset.price?.toLocaleString()}</span>
                  <span
                    className={asset.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}
                  >
                    {asset.changePercent24h >= 0 ? '+' : ''}
                    {asset.changePercent24h}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Nav Bar */}
        <div className="px-4 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-dark-800"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link to="/dashboard" className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Bot className="w-5 h-5 text-dark-950 font-bold" />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-transparent">
                  NEXUSTRADE
                </span>
                <span className="text-[10px] font-semibold text-brand tracking-widest ml-1.5 uppercase px-1.5 py-0.5 rounded bg-brand/10 border border-brand/30">
                  Paper Bot
                </span>
              </div>
            </Link>
          </div>

          {/* Center Search Trigger */}
          <div className="hidden md:flex items-center">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center space-x-3 px-3 py-1.5 bg-dark-850 border border-slate-700/70 hover:border-brand/40 rounded-xl text-slate-400 text-xs w-64 justify-between transition group shadow-inner"
            >
              <div className="flex items-center space-x-2">
                <Search className="w-3.5 h-3.5 group-hover:text-brand transition" />
                <span>Search markets, bots...</span>
              </div>
              <kbd className="px-1.5 py-0.5 bg-dark-800 border border-slate-700 rounded text-[10px] text-slate-400">
                Ctrl K
              </kbd>
            </button>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Quick Demo Reset Button */}
            <button
              onClick={() => setResetModalOpen(true)}
              title="Reset Virtual Demo Account to ₹10,000"
              className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-medium transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-dark-800 transition"
              title="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notification Bell & Dropdown */}
            <div className="relative">
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-dark-800 transition relative"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-dark-900 animate-pulse"></span>
                )}
              </button>

              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-dark-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Notifications ({unreadCount})
                    </span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-[11px] text-brand hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.slice(0, 6).map((n) => (
                        <div
                          key={n.id || n._id}
                          onClick={() => markAsRead(n.id || n._id)}
                          className={`p-3 text-xs hover:bg-dark-800/70 transition cursor-pointer ${
                            !n.read ? 'bg-dark-850/60 font-medium' : 'text-slate-400'
                          }`}
                        >
                          <div className="font-semibold text-slate-200">{n.title}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{n.message}</div>
                          <div className="text-[10px] text-slate-500 mt-1">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <Link
                    to="/notifications"
                    onClick={() => setNotifDropdownOpen(false)}
                    className="block text-center py-2 bg-dark-850 text-xs font-semibold text-brand hover:bg-dark-800 border-t border-slate-800"
                  >
                    View All Notifications
                  </Link>
                </div>
              )}
            </div>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-dark-800 transition"
              >
                <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 font-bold text-xs">
                  {user?.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <span className="hidden sm:inline text-xs font-medium text-slate-200 max-w-[100px] truncate">
                  {user?.name || 'Trader'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-dark-900 border border-slate-700 rounded-2xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-slate-800 mb-1">
                    <div className="text-xs font-bold text-white truncate">{user?.name}</div>
                    <div className="text-[11px] text-slate-400 truncate">{user?.email}</div>
                    <div className="mt-1">
                      <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-brand/10 border border-brand/30 text-brand">
                        {user?.role || 'USER'} • Demo
                      </span>
                    </div>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-dark-800 hover:text-white transition"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>My Profile</span>
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center space-x-2 px-3 py-2 rounded-lg text-xs text-amber-300 hover:bg-dark-800 transition font-semibold"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Admin Dashboard</span>
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      logout();
                      navigate('/login');
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 transition mt-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Modals */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
      <ResetDemoModal isOpen={resetModalOpen} onClose={() => setResetModalOpen(false)} />
    </>
  );
}
