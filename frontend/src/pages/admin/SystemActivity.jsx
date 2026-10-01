import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, User, Layers, RefreshCw } from 'lucide-react';
import api from '../../services/api';

export default function SystemActivity() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchActivity = async () => {
    try {
      const res = await api.get('/admin/activity?limit=50');
      if (res.data.success) {
        setLogs(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
    const interval = setInterval(fetchActivity, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">System Activity & Audit Trail</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time event logging capturing logins, order fills, bot triggers, and risk halts
          </p>
        </div>

        <button
          onClick={fetchActivity}
          className="px-3.5 py-1.5 rounded-xl bg-dark-850 hover:bg-dark-800 border border-slate-700 text-xs text-slate-300 font-semibold transition flex items-center space-x-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Feed</span>
        </button>
      </div>

      <div className="p-5 rounded-2xl bg-dark-900 border border-slate-800">
        {logs.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500">
            No system activity logged yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase font-sans">
                  <th className="py-3 px-3">Event Action</th>
                  <th className="py-3 px-3">Entity Type</th>
                  <th className="py-3 px-3">User</th>
                  <th className="py-3 px-3">IP Address</th>
                  <th className="py-3 px-3">Details</th>
                  <th className="py-3 px-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {logs.map((log) => (
                  <tr key={log.id || log._id} className="hover:bg-dark-850/60">
                    <td className="py-3 px-3 font-sans font-bold text-white flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-brand"></span>
                      <span>{log.action}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-dark-850 border border-slate-700 text-slate-300">
                        {log.entityType}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400 font-sans">{log.userEmail || 'trader'}</td>
                    <td className="py-3 px-3 text-slate-500">{log.ipAddress || '127.0.0.1'}</td>
                    <td className="py-3 px-3 text-slate-300 font-sans text-xs">
                      {typeof log.details === 'object' ? JSON.stringify(log.details) : log.details}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-500 text-[11px]">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
