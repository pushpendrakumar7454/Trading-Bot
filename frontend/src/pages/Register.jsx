import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bot, User, Mail, Lock, ArrowRight, ShieldCheck, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      addToast({ type: 'error', title: 'Missing Information', message: 'Please complete all fields.' });
      return;
    }
    if (password !== confirmPassword) {
      addToast({ type: 'error', title: 'Password Mismatch', message: 'Passwords do not match.' });
      return;
    }
    if (password.length < 6) {
      addToast({ type: 'error', title: 'Weak Password', message: 'Password must be at least 6 characters.' });
      return;
    }

    setLoading(true);
    try {
      const res = await register(name, email, password);
      if (res.success) {
        addToast({
          type: 'success',
          title: 'Account Created!',
          message: 'Welcome to NexusTrade! ₹10,000 virtual balance credited.',
        });
        navigate('/dashboard');
      }
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Registration Error',
        message: err.response?.data?.message || 'Could not register account.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-dark-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/25 mb-4">
            <Bot className="w-6 h-6 text-dark-950 font-bold" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Create Virtual Trader Account</h2>
          <p className="text-xs text-slate-400 mt-1">Get ₹10,000 virtual capital to test algorithms</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Mercer"
                className="w-full bg-dark-850 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@domain.com"
                className="w-full bg-dark-850 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full bg-dark-850 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Confirm Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full bg-dark-850 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand transition"
              />
            </div>
          </div>

          <div className="p-3 bg-dark-850 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 shrink-0" />
              <span>₹10,000 Virtual Starting Balance</span>
            </div>
            <div className="flex items-center text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 shrink-0" />
              <span>Full Access to 6 Algorithmic Bot Strategies</span>
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
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          Already registered?{' '}
          <Link to="/login" className="text-brand font-semibold hover:underline">
            Sign In Here
          </Link>
        </p>
      </div>
    </div>
  );
}
