import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, ArrowRight, CheckCircle2, Sliders, Play } from 'lucide-react';
import api from '../services/api';

export default function Strategies() {
  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStrategies = async () => {
      try {
        const res = await api.get('/strategies');
        if (res.data.success) {
          setStrategies(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStrategies();
  }, []);

  const handleDeploy = (strategySlug) => {
    navigate('/bots');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Algorithmic Strategies</h1>
        <p className="text-xs text-slate-400 mt-1">
          Quantitative mathematical models programmed to generate automated trading signals on simulated tick feeds
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {strategies.map((strat) => (
          <div
            key={strat.slug}
            className="p-6 rounded-3xl bg-dark-900 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-brand/10 border border-brand/30 flex items-center justify-center text-brand">
                    <Brain className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{strat.name}</h3>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-dark-850 text-cyan-400 border border-slate-700">
                      {strat.category}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-4">{strat.description}</p>

              {/* Technical Indicator Badges */}
              <div className="mb-4">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block mb-1">
                  Required Indicators
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {strat.indicators?.map((ind) => (
                    <span
                      key={ind}
                      className="px-2 py-0.5 rounded text-[10px] font-mono bg-dark-850 border border-slate-700 text-slate-300"
                    >
                      {ind}
                    </span>
                  ))}
                </div>
              </div>

              {/* Conditions Box */}
              <div className="p-3.5 bg-dark-850 rounded-2xl border border-slate-800/80 text-xs space-y-2 mb-4 font-mono">
                <div>
                  <span className="text-emerald-400 font-sans font-semibold text-[11px] block">
                    ✓ Entry Condition (BUY):
                  </span>
                  <p className="text-slate-300 text-[11px] mt-0.5">{strat.entryConditions}</p>
                </div>
                <div>
                  <span className="text-rose-400 font-sans font-semibold text-[11px] block">
                    ✕ Exit Condition (SELL):
                  </span>
                  <p className="text-slate-300 text-[11px] mt-0.5">{strat.exitConditions}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleDeploy(strat.slug)}
              className="w-full py-2.5 rounded-xl bg-brand/10 hover:bg-brand/20 border border-brand/30 text-brand font-bold text-xs transition flex items-center justify-center space-x-2"
            >
              <span>Deploy Bot with this Strategy</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
