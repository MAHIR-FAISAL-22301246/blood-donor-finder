"use client";

import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Toaster, toast } from 'react-hot-toast';
import { HeartHandshake, MapPin, Droplet, Clock, CheckCircle } from 'lucide-react';
import { IBloodRequestDTO } from '@/types';

export default function RequestBoardPage() {
  const [requests, setRequests] = useState<IBloodRequestDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [committing, setCommitting] = useState<string | null>(null);

  // MOCK DONOR ID for testing until authentication is added
  const MOCK_DONOR_ID = '000000000000000000000001';

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/requests?status=open');
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
    fetchRequests();
  }, []);

  const handleCommit = async (requestId: string) => {
    setCommitting(requestId);
    try {
      const res = await fetch(`/api/requests/${requestId}/commit`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donorId: MOCK_DONOR_ID }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Successfully committed to donate!');
        setRequests(prev => prev.map(req => 
          req._id === requestId ? { ...req, committedDonors: [...(req.committedDonors || []), MOCK_DONOR_ID] } : req
        ));
      } else {
        toast.error(data.message || 'Failed to commit');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setCommitting(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Toaster position="top-right" />
      <Navbar />

      {/* Hero */}
      <div className="bg-[#1e293b] text-white pb-20 pt-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-2">
            <HeartHandshake size={32} className="text-red-400" />
            <h1 className="text-4xl font-bold">Urgent Blood Requests</h1>
          </div>
          <p className="text-slate-300 text-lg max-w-xl">
            These patients need your help. Browse open requests and commit to saving a life today.
          </p>
        </div>
      </div>

      <main className="flex-grow container mx-auto px-4 py-8 pb-16">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-red-500 rounded-full animate-spin" />
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center max-w-2xl mx-auto">
            <CheckCircle size={48} className="text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Urgent Requests</h2>
            <p className="text-gray-500">Currently, there are no open blood requests. Check back later!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map(request => {
              const hasCommitted = request.committedDonors?.some(
                d => (typeof d === 'string' ? d : d._id) === MOCK_DONOR_ID
              );

              return (
                <div key={request._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col relative overflow-hidden transition-all hover:shadow-md hover:border-red-200">
                  {/* Decorative accent */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-400 to-red-600" />
                  
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-full text-lg font-black flex items-center gap-1 shadow-sm">
                      <Droplet size={16} className="text-red-500" />
                      {request.bloodGroup}
                    </span>
                    <span className="bg-yellow-50 text-yellow-700 text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1 border border-yellow-200">
                      <Clock size={12} /> Open
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-800 mb-1">{request.patientName}</h3>
                  <div className="flex flex-col gap-2 text-sm text-gray-600 mb-6 flex-grow">
                    <p className="flex items-center gap-2">
                      <span className="font-semibold text-gray-700">Units Needed:</span> 
                      {request.unitsNeeded}
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="mt-0.5 shrink-0"><MapPin size={16} className="text-gray-400" /></span>
                      <span className="leading-snug">
                        {request.hospital}<br/>
                        <span className="text-gray-400">{request.location?.district}, {request.location?.division}</span>
                      </span>
                    </p>
                    <p className="flex items-center gap-2 mt-1 bg-gray-50 p-2 rounded-lg border border-gray-100">
                      <span className="font-semibold text-gray-700">Required By:</span> 
                      <span className="text-red-600 font-medium">
                        {new Date(request.requiredDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </p>
                  </div>

                  {hasCommitted ? (
                    <button disabled className="w-full bg-green-50 text-green-700 border border-green-200 font-bold py-3 rounded-xl flex items-center justify-center gap-2">
                      <CheckCircle size={18} /> Committed to Donate
                    </button>
                  ) : (
                    <button
                      onClick={() => handleCommit(request._id)}
                      disabled={committing === request._id}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-70 shadow-sm shadow-red-200"
                    >
                      {committing === request._id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <HeartHandshake size={18} />
                      )}
                      Commit to Donate
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
