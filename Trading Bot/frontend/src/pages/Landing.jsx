import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Bot,
  Zap,
  ShieldCheck,
  BarChart3,
  TestTube2,
  ArrowRight,
  CheckCircle2,
  PlayCircle,
  Activity,
  Award,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMarket } from '../context/MarketContext';

export default function Landing() {
  const { demoLogin, isAuthenticated } = useAuth();
  const { assets } = useMarket();
  const navigate = useNavigate();

  const handleExploreDemo = async () => {
    await demoLogin('USER');
    navigate('/dashboard');
  };

  return (
    <div className="relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-brand/10 blur-[130px] rounded-full pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-dark-850 border border-slate-700/80 text-xs font-medium text-slate-300 mb-8 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>100% Risk-Free Simulation • ₹10,000 Virtual Starting Capital</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none">
          Smart Paper Trading &{' '}
          <span className="bg-gradient-to-r from-brand via-cyan-300 to-emerald-400 bg-clip-text text-transparent">
            Automated Bot Simulation
          </span>{' '}
          Platform
        </h1>

        <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Master quantitative crypto trading, build automated algorithm bots, and backtest
          proven strategies in real-time simulation without risking a single penny.
        </p>

        {/* Call to Actions */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand to-cyan-500 hover:from-cyan-400 hover:to-brand text-dark-950 font-bold text-sm tracking-wide shadow-xl shadow-cyan-500/25 transition flex items-center justify-center space-x-2"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand to-cyan-500 hover:from-cyan-400 hover:to-brand text-dark-950 font-bold text-sm tracking-wide shadow-xl shadow-cyan-500/25 transition flex items-center justify-center space-x-2"
              >
                <span>Start Trading Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={handleExploreDemo}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-dark-850 hover:bg-dark-800 border border-slate-700 text-white font-semibold text-sm transition flex items-center justify-center space-x-2"
              >
                <PlayCircle className="w-4 h-4 text-emerald-400" />
                <span>Instant Demo Login</span>
              </button>
            </>
          )}
        </div>

        {/* Live Market Bar Strip */}
        <div className="mt-16 bg-dark-900/90 border border-slate-800 rounded-2xl p-4 shadow-2xl max-w-5xl mx-auto">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-brand animate-pulse" />
              <span>Live Simulated Market Feeds</span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">Updates every 1.5s</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {assets.slice(0, 7).map((asset) => (
              <div
                key={asset.symbol}
                className="p-2.5 rounded-xl bg-dark-950 border border-slate-800/80 hover:border-brand/40 transition text-left"
              >
                <div className="text-[11px] text-slate-400 font-semibold">{asset.symbol}</div>
                <div className="text-sm font-mono font-bold text-white mt-0.5">
                  ₹{asset.price?.toLocaleString()}
                </div>
                <div
                  className={`text-[10px] font-mono mt-0.5 ${
                    asset.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {asset.changePercent24h >= 0 ? '+' : ''}
                  {asset.changePercent24h}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto border-t border-slate-800/60">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold text-brand uppercase tracking-widest">
            Institutional-Grade Architecture
          </h2>
          <p className="text-3xl font-extrabold text-white mt-2">
            Everything You Need To Master Trading & Bots
          </p>
          <p className="text-sm text-slate-400 mt-3">
            Built from scratch with Express REST APIs, WebSockets, quantitative algorithms, and
            real-time portfolio ledger mechanics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: TrendingUp,
              title: 'Paper Trading Engine',
              desc: 'Execute real-time Market, Limit, and Stop orders. Simulated order book processing with realistic execution.',
            },
            {
              icon: Bot,
              title: 'Autonomous Trading Bots',
              desc: 'Create, start, pause, and configure multiple automated algorithmic bots trading 24/7 on live tick streams.',
            },
            {
              icon: TestTube2,
              title: 'Quantitative Backtesting Lab',
              desc: 'Simulate strategies against historical candle data with dynamic equity curves, max drawdown, and profit factor.',
            },
            {
              icon: BarChart3,
              title: 'Live Technical Indicators',
              desc: 'Built-in real-time mathematical calculations for SMA, EMA, RSI, MACD, and Bollinger Bands envelopes.',
            },
            {
              icon: ShieldCheck,
              title: 'Enforced Risk Management',
              desc: 'Daily loss limit circuit breakers, max position allocation rules, and automatic emergency bot shutoff.',
            },
            {
              icon: Zap,
              title: 'Sub-Second WebSockets',
              desc: 'Socket.IO event stream broadcasting continuous price ticks, trade fills, stop executions, and live alerts.',
            },
          ].map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="p-6 rounded-2xl bg-dark-900 border border-slate-800/80 hover:border-slate-700 transition relative group"
              >
                <div className="w-12 h-12 rounded-xl bg-brand/10 border border-brand/30 flex items-center justify-center text-brand mb-4 group-hover:scale-110 transition">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto border-t border-slate-800/60">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
            Step-by-Step Simulation
          </h2>
          <p className="text-3xl font-extrabold text-white mt-2">How NexusTrade Works</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {[
            { step: '01', title: 'Create Account', desc: 'Sign up in 5 seconds or click Instant Demo.' },
            { step: '02', title: 'Virtual Capital', desc: 'Receive ₹10,000 instant virtual funds.' },
            { step: '03', title: 'Select Strategy', desc: 'Choose from 6 quantitative trading algorithms.' },
            { step: '04', title: 'Launch Bot', desc: 'Deploy bots to execute trades automatically.' },
            { step: '05', title: 'Analyze Performance', desc: 'Track Win Rate, Drawdown, and P&L analytics.' },
          ].map((s, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-dark-900 border border-slate-800 relative text-left"
            >
              <div className="text-2xl font-mono font-black text-brand/40 mb-2">{s.step}</div>
              <h4 className="text-sm font-bold text-white mb-1">{s.title}</h4>
              <p className="text-xs text-slate-400">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 px-4 sm:px-6 max-w-5xl mx-auto my-12">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-dark-850 via-dark-900 to-dark-850 border border-brand/30 shadow-2xl text-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Ready to Test Your Trading Strategies?
            </h2>
            <p className="text-sm text-slate-300 mt-3 max-w-xl mx-auto">
              Jump straight into our interactive trading terminal and automated bot engine right now.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleExploreDemo}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-brand hover:bg-cyan-400 text-dark-950 font-bold text-sm tracking-wide shadow-lg shadow-cyan-500/25 transition"
              >
                Launch Demo Terminal (₹10,000)
              </button>
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-dark-800 hover:bg-dark-750 text-white font-semibold text-sm border border-slate-700 transition"
              >
                Create Free Account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
