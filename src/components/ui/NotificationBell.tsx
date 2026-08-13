"use client";

import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { INotificationDTO } from '@/types';
import toast from 'react-hot-toast';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<INotificationDTO[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hasNew, setHasNew] = useState(false);

  // MOCK DONOR ID - using the same one from the request board
  const MOCK_DONOR_ID = '000000000000000000000001';

  const fetchNotifications = async (showToastForNew = true) => {
    try {
      const res = await fetch(`/api/notifications?userId=${MOCK_DONOR_ID}`);
      const data = await res.json();
      if (data.success) {
        const newNotifs = data.data as INotificationDTO[];
        
        setNotifications(prev => {
          // Check if there's a new notification we haven't seen yet
          if (showToastForNew && prev.length > 0 && newNotifs.length > 0) {
            const latestNew = newNotifs[0];
            const isActuallyNew = !prev.find(n => n._id === latestNew._id);
            if (isActuallyNew && !latestNew.isRead) {
              setHasNew(true);
              toast.error('Urgent Blood Request Nearby!', {
                icon: '🚨',
                style: { borderRadius: '10px', background: '#fee2e2', color: '#991b1b', fontWeight: 'bold' },
              });
            }
          } else if (prev.length === 0 && newNotifs.some(n => !n.isRead)) {
            // Initial load has unread
            setHasNew(true);
          }
          return newNotifs;
        });
      }
    } catch (e) {
      console.error('Polling failed');
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchNotifications(false);

    // Polling every 5 seconds for "pseudo real-time"
    const interval = setInterval(() => {
      fetchNotifications(true);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: 'PATCH' });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      
      // Update hasNew if no more unread
      setNotifications(prev => {
        if (!prev.some(n => !n.isRead)) setHasNew(false);
        return prev;
      });
    } catch (e) {
      console.error('Failed to mark read');
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="relative">
      <button 
        onClick={() => {
          setIsOpen(!isOpen);
          if (hasNew) setHasNew(false); // Clear the dot when opening
        }}
        className="relative p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors focus:outline-none"
      >
        <Bell size={24} className={hasNew ? 'animate-bounce text-red-500' : ''} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden flex flex-col max-h-[28rem]">
            <div className="bg-slate-50 border-b border-gray-100 p-4">
              <h3 className="font-bold text-gray-800">Notifications</h3>
            </div>
            
            <div className="overflow-y-auto flex-grow p-2">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-400">
                  You have no notifications yet.
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {notifications.map(n => (
                    <div 
                      key={n._id} 
                      className={`p-3 rounded-xl text-sm transition-colors cursor-pointer ${
                        n.isRead ? 'bg-white hover:bg-gray-50 text-gray-600' : 'bg-red-50 hover:bg-red-100 text-red-900 border border-red-100'
                      }`}
                      onClick={() => !n.isRead && markAsRead(n._id)}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-xs opacity-70">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
