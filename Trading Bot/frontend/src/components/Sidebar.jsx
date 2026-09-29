import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  BarChart3,
  Wallet,
  Layers,
  ClipboardList,
  History,
  Star,
  Bot,
  Brain,
  TestTube2,
  PieChart,
  ShieldCheck,
  BellRing,
  Newspaper,
  Receipt,
  FileCode,
  ShieldAlert,
  Users,
  Activity,
  Sliders,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
  const { isAdmin } = useAuth();

  const navSection = (title, items) => (
    <div className="mb-5">
      <div className="px-3 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
        {title}
      </div>
      <div className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => onClose && onClose()}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2 rounded-xl text-xs font-medium transition group ${
                  isActive
                    ? 'bg-brand/10 text-brand border border-brand/20 font-semibold shadow-sm shadow-brand/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-dark-800'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0 transition group-hover:scale-110" />
              <span>{item.name}</span>
              {item.badge && (
                <span className="ml-auto text-[10px] px-1.5 py-0.2 rounded font-mono bg-dark-800 border border-slate-700 text-slate-400">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Content */}
      <aside
        className={`fixed top-14 bottom-0 left-0 z-40 w-64 bg-dark-900 border-r border-slate-800/80 transition-transform duration-200 ease-in-out lg:translate-x-0 overflow-y-auto p-3 flex flex-col justify-between ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Mobile Close Button */}
          <div className="flex items-center justify-between px-2 pb-3 mb-2 border-b border-slate-800 lg:hidden">
            <span className="text-xs font-bold text-white">Menu Navigation</span>
            <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          {navSection('Trading & Market', [
            { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
            { name: 'Markets', path: '/markets', icon: BarChart3 },
            { name: 'Trading Terminal', path: '/trade', icon: TrendingUp, badge: 'Live' },
            { name: 'Portfolio', path: '/portfolio', icon: Wallet },
            { name: 'Positions', path: '/positions', icon: Layers },
            { name: 'Orders', path: '/orders', icon: ClipboardList },
            { name: 'Trade History', path: '/history', icon: History },
            { name: 'Watchlist', path: '/watchlist', icon: Star },
          ])}

          {navSection('Automated Bots', [
            { name: 'Bot Manager', path: '/bots', icon: Bot, badge: 'AI' },
            { name: 'Strategies Directory', path: '/strategies', icon: Brain },
            { name: 'Backtesting Lab', path: '/backtesting', icon: TestTube2 },
            { name: 'Performance Analytics', path: '/analytics', icon: PieChart },
          ])}

          {navSection('Risk & Controls', [
            { name: 'Risk Management', path: '/risk', icon: ShieldCheck },
            { name: 'Price & Risk Alerts', path: '/alerts', icon: BellRing },
            { name: 'Market News Feed', path: '/news', icon: Newspaper },
            { name: 'Transaction Ledger', path: '/transactions', icon: Receipt },
            { name: 'Documentation / API', path: '/docs', icon: FileCode },
          ])}

          {isAdmin &&
            navSection('Admin Portal', [
              { name: 'Admin Dashboard', path: '/admin', icon: ShieldAlert },
              { name: 'User Management', path: '/admin/users', icon: Users },
              { name: 'System Activity', path: '/admin/activity', icon: Activity },
              { name: 'Bot Monitoring', path: '/admin/bots', icon: Bot },
              { name: 'System Settings', path: '/admin/settings', icon: Sliders },
            ])}
        </div>

        {/* Paper Trading Status Pill */}
        <div className="p-3 mt-4 rounded-xl bg-dark-950 border border-slate-800 text-[11px]">
          <div className="flex items-center space-x-2 text-emerald-400 font-semibold mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>SIMULATION MODE</span>
          </div>
          <p className="text-slate-400 text-[10px] leading-tight">
            Virtual capital paper execution only. No real money or exchange risks involved.
          </p>
        </div>
      </aside>
    </>
  );
}
