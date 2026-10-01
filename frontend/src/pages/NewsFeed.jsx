import React from 'react';
import { Newspaper, TrendingUp, ExternalLink, Zap } from 'lucide-react';

const NEWS_ARTICLES = [
  {
    id: 1,
    title: 'Bitcoin Crosses Dynamic SMA(21) Moving Average as Automated Bots Register Surge in Volume',
    category: 'Technical Analysis',
    source: 'Nexus Quantitative Wire',
    time: '8 mins ago',
    snippet:
      'Algorithmic momentum strategies triggered widespread BUY executions as BTC/USDT broke past upper consolidation envelopes. Institutional paper trading volume spiked across simulated order books.',
    sentiment: 'BULLISH',
  },
  {
    id: 2,
    title: 'Solana High-Frequency Trading Frequency Reaches New Simulation Peak',
    category: 'On-Chain Metrics',
    source: 'CryptoPulse Research',
    time: '24 mins ago',
    snippet:
      'Sub-second tick simulations indicate strong Mean-Reversion RSI dip buying around key Fibonacci retracement clusters, with automated bots capturing steady intraday spread profits.',
    sentiment: 'BULLISH',
  },
  {
    id: 3,
    title: 'Macro Liquidity Report: Crypto Volatility Envelopes Show Contraction Before Breakout',
    category: 'Macro Economics',
    source: 'Global Quant Dispatch',
    time: '1 hour ago',
    snippet:
      'Bollinger Band widths across top 5 crypto assets have contracted to multi-week lows, historically signaling imminent directional expansion for trend-following trading bots.',
    sentiment: 'NEUTRAL',
  },
  {
    id: 4,
    title: 'Ethereum Layer 2 Throughput Climbs as Gas Fees Stabilize Near Historic Baselines',
    category: 'Ecosystem',
    source: 'Nexus Tech Ledger',
    time: '2 hours ago',
    snippet:
      'Optimistic execution environments continue to process millions of transactions daily, providing steady liquidity anchors for multi-asset crypto portfolios.',
    sentiment: 'BULLISH',
  },
  {
    id: 5,
    title: 'Risk Management Protocols Enforce Automated Circuit Breakers in High-Frequency Bot Engines',
    category: 'Risk Engineering',
    source: 'Fintech Systems Review',
    time: '4 hours ago',
    snippet:
      'Quantitative desks highlight the paramount necessity of hard daily loss limits and strict position caps to safeguard paper trading portfolios against sudden flash swings.',
    sentiment: 'NEUTRAL',
  },
];

export default function NewsFeed() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Market News & Simulation Feed</h1>
        <p className="text-xs text-slate-400 mt-1">
          Real-time macro intelligence, algorithmic market trends, and technical signal breakdowns
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {NEWS_ARTICLES.map((article) => (
          <div
            key={article.id}
            className="p-5 rounded-2xl bg-dark-900 border border-slate-800 hover:border-slate-700 transition"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-brand/10 text-brand border border-brand/30">
                  {article.category}
                </span>
                <span className="text-xs text-slate-500 font-mono">• {article.source}</span>
                <span className="text-xs text-slate-500 font-mono">• {article.time}</span>
              </div>

              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  article.sentiment === 'BULLISH'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                {article.sentiment}
              </span>
            </div>

            <h3 className="text-base font-bold text-white mb-2 leading-snug">{article.title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{article.snippet}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
