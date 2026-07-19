"use client";

import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Toaster, toast } from 'react-hot-toast';
import { ClipboardList, CheckCircle, XCircle, Clock, Search } from 'lucide-react';
import { IBloodRequestDTO, RequestStatus } from '@/types';

const STATUS_TABS: { label: string; value: string }[] = [
  { label: 'All', value: 'all' },
  { label: 'Open', value: 'open' },
  { label: 'Fulfilled', value: 'fulfilled' },
  { label: 'Cancelled', value: 'cancelled' },
];

const statusBadge = (status: RequestStatus) => {
  const styles: Record<RequestStatus, string> = {
    open: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    fulfilled: 'bg-green-50 text-green-700 border border-green-200',
    cancelled: 'bg-gray-100 text-gray-500 border border-gray-200',
  };
  const icons: Record<RequestStatus, React.ReactNode> = {
    open: <Clock size={12} />,
    fulfilled: <CheckCircle size={12} />,
    cancelled: <XCircle size={12} />,
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${styles[status]}`}>
      {icons[status]} {status}
    </span>
  );
};

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<IBloodRequestDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchRequests = async (status: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/requests?status=${status}`);
      const data = await res.json();
      if (data.success) {
        setRequests(data.data);
      } else {
        toast.error('Failed to load requests');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests(activeTab);
  }, [activeTab]);

  const handleStatusChange = async (id: string, newStatus: RequestStatus) => {
    setUpdating(id);
    try {
      const res = await fetch(`/api/requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setRequests(prev =>
          prev.map(r => r._id === id ? { ...r, status: newStatus } : r)
        );
        toast.success(`Request marked as ${newStatus}`, {
          style: { borderRadius: '10px', background: '#333', color: '#fff' },
        });
      } else {
        toast.error('Failed to update status');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setUpdating(null);
    }
  };

  const filtered = requests.filter(r =>
    r.patientName.toLowerCase().includes(search.toLowerCase()) ||
    r.bloodGroup.toLowerCase().includes(search.toLowerCase()) ||
    r.hospital.toLowerCase().includes(search.toLowerCase())
  );

  const openCount = requests.filter(r => r.status === 'open').length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Toaster position="top-right" />
      <Navbar />

      {/* Hero */}
      <div className="bg-[#1e293b] text-white pb-24 pt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <ClipboardList size={36} className="text-blue-400" />
                Manage Requests
              </h1>
              <p className="text-slate-300 text-lg max-w-xl">
                Review all incoming blood requests and update their status.
              </p>
            </div>
            <div className="flex gap-4">
              <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10 min-w-[120px]">
                <p className="text-slate-300 text-sm font-medium mb-1">Total Requests</p>
                <p className="text-3xl font-bold">{requests.length}</p>
              </div>
              <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10 min-w-[120px]">
                <p className="text-slate-300 text-sm font-medium mb-1">Open / Urgent</p>
                <p className="text-3xl font-bold text-yellow-400">{openCount}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-grow container mx-auto px-4 py-8 pb-12">

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
          {/* Status Tabs */}
          <div className="flex gap-2">
            {STATUS_TABS.map(tab => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  activeTab === tab.value
                    ? 'bg-[#1e293b] text-white'
                    : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by patient, hospital, blood group..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-sm"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-400">
              <div className="w-8 h-8 border-4 border-gray-200 border-t-red-500 rounded-full animate-spin mx-auto mb-3" />
              Loading requests...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <ClipboardList size={40} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No requests found</p>
              <p className="text-gray-400 text-sm mt-1">
                {search ? `No results for "${search}"` : `No ${activeTab === 'all' ? '' : activeTab} requests yet.`}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b border-gray-200">
                  <tr className="text-gray-500">
                    <th className="px-6 py-4 font-semibold">Patient</th>
                    <th className="px-6 py-4 font-semibold">Blood Group</th>
                    <th className="px-6 py-4 font-semibold">Units</th>
                    <th className="px-6 py-4 font-semibold">Hospital</th>
                    <th className="px-6 py-4 font-semibold">Location</th>
                    <th className="px-6 py-4 font-semibold">Required By</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((request) => (
                    <tr key={request._id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-800">{request.patientName}</td>
                      <td className="px-6 py-4">
                        <span className="bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded-full text-xs font-bold">
                          {request.bloodGroup}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{request.unitsNeeded} unit(s)</td>
                      <td className="px-6 py-4 text-gray-600 max-w-[160px] truncate">{request.hospital}</td>
                      <td className="px-6 py-4 text-gray-500 text-xs">
                        {request.location?.district}, {request.location?.division}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs">
                        {new Date(request.requiredDate).toLocaleDateString('en-GB', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4">
                        {statusBadge(request.status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {request.status !== 'fulfilled' && (
                            <button
                              onClick={() => handleStatusChange(request._id, 'fulfilled')}
                              disabled={updating === request._id}
                              className="text-green-600 border border-green-200 hover:bg-green-50 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                            >
                              ✓ Fulfill
                            </button>
                          )}
                          {request.status === 'open' && (
                            <button
                              onClick={() => handleStatusChange(request._id, 'cancelled')}
                              disabled={updating === request._id}
                              className="text-gray-500 border border-gray-200 hover:bg-gray-100 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                            >
                              ✕ Cancel
                            </button>
                          )}
                          {request.status === 'cancelled' && (
                            <button
                              onClick={() => handleStatusChange(request._id, 'open')}
                              disabled={updating === request._id}
                              className="text-blue-600 border border-blue-200 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                            >
                              ↩ Reopen
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
