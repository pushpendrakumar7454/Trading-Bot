import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bot, Mail, Lock, ArrowRight, ShieldCheck, PlayCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, demoLogin } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      addToast({ type: 'error', title: 'Missing Fields', message: 'Please enter both email and password.' });
      return;
    }

    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        addToast({ type: 'success', title: 'Welcome Back!', message: `Logged in as ${res.user.name}` });
        navigate('/dashboard');
      }
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Authentication Failed',
        message: err.response?.data?.message || 'Invalid credentials. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (role) => {
    setLoading(true);
    try {
      const res = await demoLogin(role);
      if (res.success) {
        addToast({
          type: 'success',
          title: 'Demo Session Active',
          message: `Logged in as ${role === 'ADMIN' ? 'System Administrator' : 'Alex Mercer (Demo Trader)'}`,
        });
        navigate(role === 'ADMIN' ? '/admin' : '/dashboard');
      }
    } catch (err) {
      addToast({ type: 'error', title: 'Demo Login Failed', message: 'Could not initialize demo session.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-dark-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Header Icon */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/25 mb-4">
            <Bot className="w-6 h-6 text-dark-950 font-bold" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Sign in to NexusTrade</h2>
          <p className="text-xs text-slate-400 mt-1">Access your paper trading terminal & automated bots</p>
        </div>

        {/* 1-Click Quick Demo Sign-in Section */}
        <div className="mb-6 p-3 rounded-2xl bg-dark-850/80 border border-slate-800 text-xs">
          <div className="text-[11px] font-semibold text-brand uppercase tracking-wider mb-2 flex items-center space-x-1">
            <PlayCircle className="w-3.5 h-3.5" />
            <span>Instant 1-Click Demonstration</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemo('USER')}
              disabled={loading}
              className="py-2 px-3 rounded-xl bg-dark-800 hover:bg-dark-750 border border-slate-700/80 hover:border-brand/40 text-slate-200 text-xs font-medium transition flex items-center justify-center space-x-1.5"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Demo Trader</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemo('ADMIN')}
              disabled={loading}
              className="py-2 px-3 rounded-xl bg-dark-800 hover:bg-dark-750 border border-slate-700/80 hover:border-amber-400/40 text-slate-200 text-xs font-medium transition flex items-center justify-center space-x-1.5"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>Admin Demo</span>
            </button>
          </div>
        </div>

        <div className="flex items-center my-5">
          <div className="flex-1 border-t border-slate-800"></div>
          <span className="px-3 text-[11px] text-slate-500 uppercase">Or sign in with email</span>
          <div className="flex-1 border-t border-slate-800"></div>
        </div>

        {/* Standard Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="trader@domain.com"
                className="w-full bg-dark-850 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <Link to="/forgot-password" className="text-[11px] text-brand hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-dark-850 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-brand to-cyan-500 hover:from-cyan-400 hover:to-brand text-dark-950 font-bold text-xs tracking-wider shadow-lg shadow-cyan-500/20 transition flex items-center justify-center space-x-2 mt-6"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Sign In to Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand font-semibold hover:underline">
            Create Free Account
          </Link>
        </p>
      </div>
    </div>
  );
}
