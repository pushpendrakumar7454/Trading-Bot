import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bot, Lock, KeyRound, ArrowRight } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

export default function ResetPassword() {
  const [code, setCode] = useState('NEXUS-8821');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const handleReset = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      addToast({ type: 'error', title: 'Error', message: 'Passwords do not match.' });
      return;
    }
    addToast({
      type: 'success',
      title: 'Password Updated',
      message: 'Password successfully reset. You can now log in.',
    });
    navigate('/login');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-dark-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-brand/10 border border-brand/30 flex items-center justify-center text-brand mb-4">
            <Bot className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Choose New Password</h2>
          <p className="text-xs text-slate-400 mt-1">
            Provide the reset verification code and set a new password
          </p>
        </div>

        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Reset Code</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-dark-850 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">New Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full bg-dark-850 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Confirm New Password</label>
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

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-brand hover:bg-cyan-400 text-dark-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition flex items-center justify-center space-x-2 mt-4"
          >
            <span>Update Password</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center mt-6">
          <Link to="/login" className="text-xs text-slate-400 hover:text-white transition">
            ← Cancel and Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
