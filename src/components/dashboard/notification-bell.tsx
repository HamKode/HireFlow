'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { markNotificationRead, markAllNotificationsRead } from '@/app/actions/notifications';
import type { Notification } from '@/lib/supabase/types';

export function NotificationBell({
  initialNotifications,
  initialUnreadCount,
}: {
  initialNotifications: Notification[];
  initialUnreadCount: number;
}) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function handleMarkRead(id: string) {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
    await markNotificationRead(id);
  }

  async function handleMarkAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
    await markAllNotificationsRead();
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-ink-200 bg-white text-ink-500 transition-colors hover:border-ink-300 hover:bg-ink-50 hover:text-ink-700 dark:border-white/10 dark:bg-ink-900 dark:text-ink-400 dark:hover:bg-ink-800"
        aria-label="Notifications"
      >
        <Bell className="h-4.5 w-4.5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white ring-2 ring-white dark:ring-ink-950">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="animate-scale-in fixed inset-x-4 top-18 z-50 origin-top rounded-2xl border border-ink-200/70 bg-white shadow-xl shadow-ink-900/10 sm:absolute sm:inset-x-auto sm:top-auto sm:right-0 sm:mt-2 sm:w-80 sm:origin-top-right dark:border-white/10 dark:bg-ink-900">
          <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3 dark:border-white/10">
            <p className="text-sm font-semibold text-ink-900 dark:text-white">Notifications</p>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllRead} className="text-xs font-medium text-brand-600 hover:text-brand-700">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-ink-400">No notifications yet.</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`border-b border-ink-100 px-4 py-3 text-sm last:border-b-0 dark:border-white/10 ${
                    !n.is_read ? 'bg-brand-50/60 dark:bg-brand-500/5' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-ink-900 dark:text-white">{n.title}</p>
                      <p className="mt-0.5 text-xs text-ink-500">{n.message}</p>
                      <p className="mt-1 text-[10px] text-ink-400">{new Date(n.created_at).toLocaleString()}</p>
                    </div>
                    {!n.is_read && (
                      <button
                        onClick={() => handleMarkRead(n.id)}
                        className="shrink-0 text-xs font-medium text-brand-600 hover:text-brand-700"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="border-t border-ink-100 px-4 py-2.5 text-center dark:border-white/10">
            <Link href="/automation-logs" className="text-xs font-medium text-ink-500 hover:text-ink-700">
              View full activity log
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
