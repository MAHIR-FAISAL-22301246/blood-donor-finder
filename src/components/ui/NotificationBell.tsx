"use client";

import { useEffect, useState, useCallback } from 'react';
import { Bell } from 'lucide-react';
import { INotificationDTO } from '@/types';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<INotificationDTO[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = useCallback(async (showToastForNew = true) => {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/notifications?userId=${user.id}`);
      const data = await res.json();
      if (data.success) {
        const newNotifs = data.data as INotificationDTO[];

        setNotifications(prev => {
          if (showToastForNew && prev.length > 0 && newNotifs.length > 0) {
            const latestNew = newNotifs[0];
            const isActuallyNew = !prev.find(n => n._id === latestNew._id);
            if (isActuallyNew && !latestNew.isRead) {
              toast('New notification!', {
                icon: '🔔',
                style: { borderRadius: '10px', background: '#fee2e2', color: '#991b1b', fontWeight: 'bold' },
              });
            }
          }
          return newNotifs;
        });
      }
    } catch {
      // silently fail — polling should not disrupt the UI
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    fetchNotifications(false);
    const interval = setInterval(() => fetchNotifications(true), 8000);
    return () => clearInterval(interval);
  }, [user?.id, fetchNotifications]);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: 'PATCH' });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch {
      // silently fail
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.isRead);
    await Promise.all(unread.map(n => fetch(`/api/notifications/${n._id}`, { method: 'PATCH' })));
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  // Don't render anything if not logged in
  if (!user) return null;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-white hover:text-red-200 rounded-full transition-colors focus:outline-none"
        aria-label="Notifications"
      >
        <Bell size={22} className={unreadCount > 0 ? 'animate-bounce' : ''} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-white text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-tight">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden flex flex-col max-h-[28rem]">
            {/* Header */}
            <div className="bg-slate-50 border-b border-gray-100 p-4 flex items-center justify-between">
              <h3 className="font-bold text-gray-800">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-red-600 hover:underline font-medium"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* List */}
            <div className="overflow-y-auto flex-grow p-2">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-sm text-gray-400">
                  <Bell size={28} className="mx-auto mb-2 opacity-30" />
                  You have no notifications yet.
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {notifications.map(n => (
                    <div
                      key={n._id}
                      className={`p-3 rounded-xl text-sm transition-colors cursor-pointer ${
                        n.isRead
                          ? 'bg-white hover:bg-gray-50 text-gray-600'
                          : 'bg-red-50 hover:bg-red-100 text-red-900 border border-red-100'
                      }`}
                      onClick={() => !n.isRead && markAsRead(n._id)}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-xs opacity-70">
                          {new Date(n.createdAt).toLocaleString([], {
                            month: 'short', day: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                        {!n.isRead && <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-1" />}
                      </div>
                      <p className="leading-snug">{n.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
