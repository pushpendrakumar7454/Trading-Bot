import React from 'react';
import { Bell, CheckCheck, Trash2, CheckCircle2 } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Notifications Center</h1>
          <p className="text-xs text-slate-400 mt-1">
            Execution updates, stop triggers, bot actions, and market alert audit logs
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 rounded-xl bg-dark-850 hover:bg-dark-800 border border-slate-700 text-xs font-semibold text-brand transition flex items-center space-x-2"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      <div className="p-5 rounded-2xl bg-dark-900 border border-slate-800">
        {notifications.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-500">
            No notifications recorded yet.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {notifications.map((n) => {
              const id = n.id || n._id;
              return (
                <div
                  key={id}
                  onClick={() => !n.read && markAsRead(id)}
                  className={`p-4 transition rounded-xl flex items-start justify-between cursor-pointer ${
                    !n.read ? 'bg-dark-850/60 hover:bg-dark-850' : 'hover:bg-dark-850/30'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        n.type === 'ORDER_FILLED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : n.type === 'RISK_LIMIT'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          : 'bg-brand/10 text-brand border border-brand/30'
                      }`}
                    >
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-bold text-white">{n.title}</h4>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-brand"></span>
                        )}
                      </div>
                      <p className="text-xs text-slate-300 mt-1">{n.message}</p>
                      <span className="text-[10px] text-slate-500 mt-2 block font-mono">
                        {new Date(n.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {!n.read && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(id);
                      }}
                      className="text-xs text-brand hover:underline font-medium shrink-0 ml-4"
                    >
                      Mark read
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
