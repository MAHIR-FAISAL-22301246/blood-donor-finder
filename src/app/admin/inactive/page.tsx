"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';
import { UserX, Trash2, RefreshCw, AlertTriangle, User, MapPin, Droplet } from 'lucide-react';
import Link from 'next/link';

interface InactiveUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  bloodGroup: string;
  isAvailable: boolean;
  isVerified: boolean;
  createdAt: string;
  lastDonationDate?: string;
  location: {
    division: string;
    district: string;
  };
}

export default function InactiveAccountsPage() {
  const { user, loading: authLoading } = useAuth();
  const [inactiveUsers, setInactiveUsers] = useState<InactiveUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  const fetchInactive = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/inactive-users');
      const data = await res.json();
      if (data.success) {
        setInactiveUsers(data.data);
      } else {
        toast.error(data.message || 'Failed to load inactive users');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user?.role === 'admin') {
      fetchInactive();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const selectAll = () => {
    if (selected.size === inactiveUsers.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(inactiveUsers.map(u => u._id)));
    }
  };

  const handleDelete = async () => {
    if (selected.size === 0) {
      toast.error('Please select at least one account to remove.');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to permanently delete ${selected.size} account(s)? This cannot be undone.`
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      const res = await fetch('/api/admin/inactive-users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds: Array.from(selected) }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message, { icon: '🗑️' });
        setSelected(new Set());
        fetchInactive(); // Refresh the list
      } else {
        toast.error(data.message || 'Failed to delete accounts');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setDeleting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <main className="flex-grow container mx-auto px-4 pt-8 pb-16">
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </main>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <main className="flex-grow container mx-auto px-4 pt-24 pb-16 text-center">
        <h1 className="text-2xl font-bold text-gray-700">Access Denied. Admins only.</h1>
        <Link href="/" className="text-red-600 hover:underline mt-4 block">Go Home</Link>
      </main>
    );
  }

  return (
    <main className="flex-grow container mx-auto px-4 pt-8 pb-16 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <UserX className="text-red-500" size={32} />
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Inactive Accounts</h1>
            <p className="text-sm text-gray-500 mt-1">
              Accounts unavailable with no recent activity for 6+ months
            </p>
          </div>
        </div>
        <button
          onClick={fetchInactive}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Warning Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
        <AlertTriangle className="text-amber-500 mt-0.5 shrink-0" size={20} />
        <div>
          <p className="font-semibold text-amber-800">Permanent Action</p>
          <p className="text-sm text-amber-700 mt-0.5">
            Removing an account is <strong>irreversible</strong>. All their data including donation history will be deleted. Admin accounts are protected and cannot be removed here.
          </p>
        </div>
      </div>

      {inactiveUsers.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserX size={32} className="text-green-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Inactive Accounts</h3>
          <p className="text-gray-500">All accounts have been active in the last 6 months.</p>
        </div>
      ) : (
        <>
          {/* Bulk Actions Bar */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selected.size === inactiveUsers.length && inactiveUsers.length > 0}
                  onChange={selectAll}
                  className="w-4 h-4 accent-red-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Select All ({inactiveUsers.length})
                </span>
              </label>
              {selected.size > 0 && (
                <span className="text-sm text-red-600 font-semibold">
                  {selected.size} selected
                </span>
              )}
            </div>
            <button
              onClick={handleDelete}
              disabled={selected.size === 0 || deleting}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Trash2 size={16} />
              {deleting ? 'Removing...' : `Remove Selected (${selected.size})`}
            </button>
          </div>

          {/* User List */}
          <div className="space-y-3">
            {inactiveUsers.map((u) => (
              <div
                key={u._id}
                className={`bg-white rounded-2xl border-2 p-4 flex items-center gap-4 transition-all cursor-pointer ${
                  selected.has(u._id) ? 'border-red-400 bg-red-50' : 'border-gray-100 hover:border-gray-300'
                }`}
                onClick={() => toggleSelect(u._id)}
              >
                <input
                  type="checkbox"
                  checked={selected.has(u._id)}
                  onChange={() => toggleSelect(u._id)}
                  onClick={e => e.stopPropagation()}
                  className="w-4 h-4 accent-red-500 shrink-0"
                />

                {/* Avatar */}
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                  <User size={22} className="text-gray-400" />
                </div>

                {/* Details */}
                <div className="flex-grow min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-800">{u.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      u.role === 'donor' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {u.role}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-semibold">
                      Unavailable
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5 truncate">{u.email}</p>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Droplet size={12} className="text-red-300" />
                      {u.bloodGroup}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={12} />
                      {u.location.district}, {u.location.division}
                    </span>
                    <span>Joined: {new Date(u.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</span>
                    {u.lastDonationDate && (
                      <span>Last donated: {new Date(u.lastDonationDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
