import React, { useState } from 'react';
import { User, Mail, Shield, Lock, RotateCcw, Save, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import ResetDemoModal from '../components/ResetDemoModal';
import api from '../services/api';

export default function Profile() {
  const { user } = useAuth();
  const { addToast } = useNotification();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changing, setChanging] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      addToast({ type: 'error', title: 'Error', message: 'New passwords do not match.' });
      return;
    }
    if (newPassword.length < 6) {
      addToast({ type: 'error', title: 'Error', message: 'Password must be at least 6 characters.' });
      return;
    }

    setChanging(true);
    try {
      const res = await api.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      if (res.data.success) {
        addToast({ type: 'success', title: 'Password Changed', message: 'Your password was updated.' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Error',
        message: err.response?.data?.message || 'Could not update password.',
      });
    } finally {
      setChanging(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Trader Profile</h1>
        <p className="text-xs text-slate-400 mt-1">
          Account credentials, role credentials, and simulation configuration
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="p-6 rounded-3xl bg-dark-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-cyan-400 flex items-center justify-center text-dark-950 font-black text-2xl shadow-lg shadow-cyan-500/20">
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{user?.name}</h2>
            <div className="text-xs text-slate-400 mt-0.5">{user?.email}</div>
            <div className="flex items-center space-x-2 mt-2">
              <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-brand/10 text-brand border border-brand/30">
                {user?.role || 'USER'}
              </span>
              <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Paper Trading Tier
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setResetModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-400 text-xs font-semibold transition flex items-center space-x-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Demo Account</span>
        </button>
      </div>

      {/* Change Password Card */}
      <div className="p-6 rounded-3xl bg-dark-900 border border-slate-800">
        <h3 className="text-sm font-bold text-white mb-1 flex items-center space-x-2">
          <Lock className="w-4 h-4 text-brand" />
          <span>Change Security Password</span>
        </h3>
        <p className="text-xs text-slate-400 mb-5">
          Update your login password hashed with salted bcrypt on the backend
        </p>

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md text-xs">
          <div>
            <label className="text-slate-300 font-semibold block mb-1">Current Password</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand"
            />
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">New Password</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand"
            />
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">Confirm New Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-dark-850 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-brand"
            />
          </div>

          <button
            type="submit"
            disabled={changing}
            className="px-5 py-2.5 rounded-xl bg-brand hover:bg-cyan-400 text-dark-950 font-bold shadow-lg shadow-brand/20 transition flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{changing ? 'Saving...' : 'Update Password'}</span>
          </button>
        </form>
      </div>

      <ResetDemoModal isOpen={resetModalOpen} onClose={() => setResetModalOpen(false)} />
    </div>
  );
}
