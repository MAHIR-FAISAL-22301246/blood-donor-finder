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

      <div className="flex gap-5 text-sm font-medium items-center">
        <NotificationBell />
        <Link href="/search" className="hover:text-red-200 transition-colors">Find Donors</Link>
        <Link href="/requests" className="hover:text-red-200 transition-colors">Request Blood</Link>
        <Link href="/requests/board" className="hover:text-red-200 transition-colors">Urgent Requests</Link>
        <Link href="/search-analytics" className="hover:text-red-200 transition-colors">Analytics</Link>
        <Link href="/saved-searches" className="hover:text-red-200 transition-colors">Saved Searches</Link>
        <Link href="/selected-donors" className="hover:text-red-200 transition-colors">Selected Donors</Link>
        <Link href="/feedback" className="hover:text-red-200 transition-colors">Feedback</Link>

        {/* Admin link — only for admins */}
        {user?.role === 'admin' && (
          <>
            <Link href="/admin" className="hover:text-red-200 transition-colors">Admin</Link>
            <Link href="/admin/requests" className="hover:text-red-200 transition-colors">Admin Requests</Link>
            <Link href="/admin/inactive" className="hover:text-red-200 transition-colors">Inactive Accounts</Link>
          </>
        )}

        {loading ? (
          <span className="w-20 h-6 bg-red-500 animate-pulse rounded" />
        ) : user ? (
          <div className="flex items-center gap-3">
            <Link href="/profile" className="bg-white/20 hover:bg-white/30 rounded-full px-3 py-1 text-xs font-semibold transition-colors">
              👤 {user.name.split(' ')[0]}
            </Link>
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
