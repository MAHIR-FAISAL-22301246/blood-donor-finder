'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import NotificationBell from '@/components/ui/NotificationBell';

export default function Navbar() {
  const { user, loading, logout } = useAuth();

  return (
    <nav className="bg-red-600 text-white px-6 py-4 flex items-center justify-between shadow-md">
      <Link href="/" className="text-xl font-bold tracking-tight">
        🩸 Blood Donor Finder
      </Link>
      <div className="flex gap-6 text-sm font-medium items-center">
        <NotificationBell />
        <Link href="/donors" className="hover:text-red-200 transition-colors">Find Donors</Link>
        <Link href="/requests" className="hover:text-red-200 transition-colors">Requests</Link>
        
        {user?.role === 'admin' && (
          <Link href="/admin" className="hover:text-red-200 transition-colors">Admin</Link>
        )}

        {loading ? (
          <span className="w-20 h-6 bg-red-500 animate-pulse rounded" />
        ) : user ? (
          <div className="flex items-center gap-3">
            <span className="bg-white/20 rounded-full px-3 py-1 text-xs font-semibold">
              👤 {user.name.split(' ')[0]}
            </span>
            <button
              onClick={logout}
              className="bg-white text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-50 transition"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="bg-white/10 hover:bg-white/20 border border-white/30 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="bg-white text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-50 transition"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
