import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bot, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const handleSend = (e) => {
    e.preventDefault();
    if (!email) return;
    setSent(true);
    addToast({
      type: 'success',
      title: 'Reset Code Sent',
      message: `A simulated password reset token was generated for ${email}.`,
    });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-dark-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-brand/10 border border-brand/30 flex items-center justify-center text-brand mb-4">
            <Bot className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Reset Password</h2>
          <p className="text-xs text-slate-400 mt-1">
            Enter your email to receive a recovery code
          </p>
        </div>

        {sent ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-xs text-slate-300">
              Recovery link simulated! Check your inbox or continue with verification code{' '}
              <strong className="text-brand">#NEXUS-8821</strong>.
            </p>
            <button
              onClick={() => navigate('/reset-password')}
              className="w-full py-2.5 rounded-xl bg-brand text-dark-950 font-bold text-xs"
            >
              Enter Reset Code
            </button>
          </div>
        ) : (
          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full bg-dark-850 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand transition"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-brand hover:bg-cyan-400 text-dark-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition flex items-center justify-center space-x-2"
            >
              <span>Send Recovery Code</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="text-center mt-6">
          <Link to="/login" className="text-xs text-slate-400 hover:text-white transition">
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
