import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Bot, Shield, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function PublicLayout() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 flex flex-col selection:bg-brand/30">
      {/* Public Header */}
      <header className="border-b border-slate-800/80 bg-dark-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/25">
              <Bot className="w-5 h-5 text-dark-950 font-bold" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-transparent">
                NEXUSTRADE
              </span>
              <span className="text-[10px] font-semibold text-brand tracking-widest ml-1.5 uppercase px-1.5 py-0.5 rounded bg-brand/10 border border-brand/30">
                Simulation
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
            <Link to="/#features" className="hover:text-brand transition">Features</Link>
            <Link to="/#strategies" className="hover:text-brand transition">Strategies</Link>
            <Link to="/#how-it-works" className="hover:text-brand transition">How It Works</Link>
            <Link to="/docs" className="hover:text-brand transition">API Docs</Link>
          </nav>

          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="px-4 py-2 rounded-xl bg-brand hover:bg-cyan-400 text-dark-950 font-semibold text-xs tracking-wide shadow-lg shadow-cyan-500/20 transition flex items-center space-x-1.5"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-dark-850 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand to-cyan-500 hover:from-cyan-400 hover:to-brand text-dark-950 font-bold text-xs tracking-wide shadow-lg shadow-cyan-500/25 transition"
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Public View */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-dark-900/60 py-10 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-brand/20 border border-brand/40 flex items-center justify-center">
                <Bot className="w-4 h-4 text-brand" />
              </div>
              <span className="font-bold text-sm text-white">NEXUSTRADE Engine</span>
              <span className="text-xs text-slate-500">| Full-Stack Paper Trading & AI Bot Simulator</span>
            </div>
            <div className="flex items-center space-x-6 text-xs text-slate-400">
              <Link to="/docs" className="hover:text-slate-200 transition">API Documentation</Link>
              <Link to="/#features" className="hover:text-slate-200 transition">Strategy Engine</Link>
              <span className="text-slate-600">•</span>
              <span>100% Virtual Simulation • No Real Funds</span>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-800/60 text-center text-xs text-slate-500">
            © 2026 NexusTrade Full-Stack Architecture. Built with React, Vite, Node.js, Express, Socket.IO & MongoDB.
          </div>
        </div>
      </footer>
    </div>
  );
}
