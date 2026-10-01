import React, { useState, useEffect } from 'react';
import { Search, UserCheck, Shield, ShieldAlert, KeyRound } from 'lucide-react';
import api from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { addToast } = useNotification();

  const fetchUsers = async () => {
    try {
      const res = await api.get(`/admin/users?search=${encodeURIComponent(search)}`);
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const handleRoleToggle = async (userId, currentRole) => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    try {
      const res = await api.put(`/admin/users/${userId}`, { role: newRole });
      if (res.data.success) {
        addToast({ type: 'success', title: 'Role Updated', message: `User role changed to ${newRole}.` });
        fetchUsers();
      }
    } catch (err) {
      addToast({ type: 'error', title: 'Error', message: 'Could not change user role.' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">User Account Administration</h1>
          <p className="text-xs text-slate-400 mt-1">
            Search, inspect registered traders, and manage administrative role permissions
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-dark-850 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand"
          />
        </div>
      </div>

      <div className="p-5 rounded-2xl bg-dark-900 border border-slate-800">
        {users.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500">
            No registered users found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase font-sans">
                  <th className="py-3 px-3">User</th>
                  <th className="py-3 px-3">Email</th>
                  <th className="py-3 px-3">Role</th>
                  <th className="py-3 px-3">Account Type</th>
                  <th className="py-3 px-3">Registered Date</th>
                  <th className="py-3 px-3 text-right">Role Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((u) => {
                  const uid = u._id || u.id;
                  return (
                    <tr key={uid} className="hover:bg-dark-850/60">
                      <td className="py-3 px-3 font-sans">
                        <div className="font-bold text-white">{u.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">ID: {uid.slice(-6)}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-300">{u.email}</td>
                      <td className="py-3 px-3 font-sans">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            u.role === 'ADMIN'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              : 'bg-dark-800 text-slate-300 border border-slate-700'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-emerald-400 font-sans text-xs">
                        {u.isDemo ? 'Paper Demo' : 'Standard'}
                      </td>
                      <td className="py-3 px-3 text-slate-500 text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-3 text-right font-sans">
                        <button
                          onClick={() => handleRoleToggle(uid, u.role)}
                          className="px-3 py-1 rounded-lg bg-dark-850 hover:bg-dark-800 border border-slate-700 text-slate-300 text-xs font-semibold transition"
                        >
                          {u.role === 'ADMIN' ? 'Demote to User' : 'Promote to Admin'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
