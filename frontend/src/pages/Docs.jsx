import React, { useState } from 'react';
import { BookOpen, Code, Server, Cpu, ShieldCheck, Terminal, Copy, Check } from 'lucide-react';

const API_GROUPS = [
  {
    title: 'Authentication & Profile',
    endpoints: [
      { method: 'POST', path: '/api/auth/register', desc: 'Create a new user account with ₹10,000 virtual balance' },
      { method: 'POST', path: '/api/auth/login', desc: 'Authenticate and receive JWT token' },
      { method: 'POST', path: '/api/auth/demo', desc: '1-Click quick login as Demo Trader or Admin' },
      { method: 'GET', path: '/api/auth/me', desc: 'Get authenticated user profile and risk settings' },
      { method: 'PUT', path: '/api/auth/profile', desc: 'Update profile name or risk parameters' },
      { method: 'POST', path: '/api/auth/reset-demo', desc: 'Reset virtual portfolio balance to ₹10,000' },
    ],
  },
  {
    title: 'Market Engine & Indicators',
    endpoints: [
      { method: 'GET', path: '/api/markets', desc: 'Get live quotes and 24h metrics for all 7 crypto pairs' },
      { method: 'GET', path: '/api/markets/:symbol', desc: 'Get single asset with real-time calculated SMA, EMA, RSI, MACD' },
      { method: 'GET', path: '/api/markets/:symbol/candles', desc: 'Get historical OHLCV candle bars for charting' },
    ],
  },
  {
    title: 'Order Processing & Positions',
    endpoints: [
      { method: 'POST', path: '/api/orders', desc: 'Submit Market, Limit, or Stop order with risk validation' },
      { method: 'GET', path: '/api/orders', desc: 'Query user order history with filtering by status and side' },
      { method: 'DELETE', path: '/api/orders/:id', desc: 'Cancel an open Limit or Stop order' },
      { method: 'GET', path: '/api/positions', desc: 'Fetch open and closed mark-to-market positions' },
      { method: 'POST', path: '/api/positions/:id/close', desc: 'Execute market exit to close an open position' },
    ],
  },
  {
    title: 'Automated Bot Engine',
    endpoints: [
      { method: 'GET', path: '/api/bots', desc: 'Retrieve all automated trading bots created by user' },
      { method: 'POST', path: '/api/bots', desc: 'Deploy new bot with allocated capital, asset, and strategy' },
      { method: 'POST', path: '/api/bots/:id/start', desc: 'Start live evaluation on incoming market ticks' },
      { method: 'POST', path: '/api/bots/:id/stop', desc: 'Halt bot strategy execution' },
      { method: 'POST', path: '/api/bots/:id/pause', desc: 'Temporarily pause bot' },
    ],
  },
  {
    title: 'Algorithmic Backtesting',
    endpoints: [
      { method: 'POST', path: '/api/backtests', desc: 'Execute dynamic quantitative backtest over historical bars' },
      { method: 'GET', path: '/api/backtests', desc: 'Retrieve backtest history reports' },
    ],
  },
];

export default function Docs() {
  const [copied, setCopied] = useState(false);

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-white">Developer Documentation & REST API</h1>
        <p className="text-sm text-slate-400 mt-1">
          Complete architecture guide, quantitative algorithm flow, and REST/WebSocket API references
        </p>
      </div>

      {/* Architecture Overview */}
      <div className="p-6 rounded-3xl bg-dark-900 border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center space-x-2">
          <Server className="w-5 h-5 text-brand" />
          <span>Full-Stack Architecture & Data Flow</span>
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          The NexusTrade platform follows an event-driven quantitative finance architecture.
          The backend runs a high-frequency Market Simulation generating realistic Geometric
          Brownian Motion price ticks. Ticks stream to connected clients via Socket.IO, while
          simultaneously feeding the backend Bot Engine and Order Matcher.
        </p>

        <div className="p-4 bg-dark-950 rounded-2xl border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto whitespace-pre">
{`Market Engine (Ticks) ──> Socket.IO Broadcast ──> React Terminal UI
        │
        ├──> Order Matcher (Evaluates Limit & Stop Orders, Stop-Loss triggers)
        │         └──> On Fill ──> Updates Portfolio, Holdings, Positions, Ledger
        │
        ├──> Bot Engine (Evaluates MA Cross, RSI, MACD, Bollinger Bands)
        │         └──> Strategy Signal ──> Risk Service Check ──> Market Order
        │
        └──> Alert Engine (Evaluates Price & P&L Thresholds)`}
        </div>
      </div>

      {/* API Reference Sections */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <Terminal className="w-5 h-5 text-emerald-400" />
          <span>REST API Endpoints Reference</span>
        </h2>

        {API_GROUPS.map((group) => (
          <div key={group.title} className="p-5 rounded-2xl bg-dark-900 border border-slate-800">
            <h3 className="text-sm font-bold text-slate-200 mb-3">{group.title}</h3>
            <div className="divide-y divide-slate-800/60 font-mono text-xs">
              {group.endpoints.map((ep, idx) => (
                <div key={idx} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ep.method === 'GET'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                          : ep.method === 'POST'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : ep.method === 'PUT'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {ep.method}
                    </span>
                    <span className="text-white font-semibold">{ep.path}</span>
                  </div>
                  <span className="text-slate-400 font-sans text-xs">{ep.desc}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Sample Curl Execution */}
      <div className="p-6 rounded-3xl bg-dark-900 border border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Code className="w-4 h-4 text-brand" />
            <span>Sample Market Order cURL</span>
          </h3>
          <button
            onClick={() =>
              copyCode(`curl -X POST http://localhost:5000/api/orders \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -d '{"asset":"BTC/USDT","type":"MARKET","side":"BUY","quantity":0.05}'`)
            }
            className="flex items-center space-x-1 text-xs text-brand hover:underline font-mono"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy cURL'}</span>
          </button>
        </div>

        <pre className="p-4 bg-dark-950 rounded-2xl border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto">
{`curl -X POST http://localhost:5000/api/orders \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -d '{"asset":"BTC/USDT","type":"MARKET","side":"BUY","quantity":0.05}'`}
        </pre>
      </div>
    </div>
  );
}
