"use client";

import { useEffect, useState } from 'react';
import DonorCard from '@/components/ui/DonorCard';
import { IUserDTO } from '@/types';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Toaster, toast } from 'react-hot-toast';
import { Search, Filter, ShieldCheck, Users } from 'lucide-react';

export default function AdminDashboard() {
  const [donors, setDonors] = useState<IUserDTO[]>([]);
  const [filteredDonors, setFilteredDonors] = useState<IUserDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchDonors = async () => {
    try {
      const res = await fetch('/api/donors?all=true');
      const data = await res.json();
      if (data.success) {
        setDonors(data.data);
        setFilteredDonors(data.data);
      } else {
        toast.error(data.message || 'Failed to fetch donors');
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred while fetching donors.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, []);

  // Filter and search logic
  useEffect(() => {
    let result = donors;
    
    // Search
    if (searchQuery) {
      result = result.filter(donor => 
        donor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        donor.bloodGroup.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter
    if (filterStatus === 'verified') result = result.filter(d => d.isVerified);
    if (filterStatus === 'unverified') result = result.filter(d => !d.isVerified);

    setFilteredDonors(result);
  }, [donors, searchQuery, filterStatus]);

  const handleVerify = async (id: string) => {
    try {
      const res = await fetch(`/api/donors/${id}/verify`, { method: 'PATCH' });
      const data = await res.json();
      if (data.success) {
        // Update local state to show verified
        setDonors(donors.map(donor => donor._id === id ? { ...donor, isVerified: true } : donor));
        toast.success('Donor verified successfully!', {
          icon: '🎉',
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        });
      } else {
        toast.error('Failed to verify donor: ' + data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error('An error occurred during verification.');
    }
  };

  const verifiedCount = donors.filter(d => d.isVerified).length;
  const unverifiedCount = donors.length - verifiedCount;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Toaster position="top-right" />
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-red-700 via-rose-600 to-red-800 text-white pb-28 pt-14 relative overflow-hidden">
        {/* Decorative subtle overlay */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <ShieldCheck size={36} className="text-red-200" />
                Admin Dashboard
              </h1>
              <p className="text-red-100 text-lg max-w-xl">
                Manage your donor network, verify identities, and ensure the safety of the blood donation community.
              </p>
            </div>
            
            {/* Stats Cards */}
            <div className="flex gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 min-w-[120px]">
                <p className="text-red-100 text-sm font-medium mb-1">Total Donors</p>
                <p className="text-3xl font-bold">{donors.length}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 min-w-[120px]">
                <p className="text-red-100 text-sm font-medium mb-1">Unverified</p>
                <p className="text-3xl font-bold">{unverifiedCount}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-grow container mx-auto px-4 -mt-10 pb-12">
        
        {/* Controls Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search donors by name or blood group..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Filter size={18} className="text-gray-400 hidden md:block" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full md:w-auto rounded-xl border border-gray-200 bg-white py-2.5 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all font-medium cursor-pointer"
            >
              <option value="all">All Donors ({donors.length})</option>
              <option value="verified">Verified Only ({verifiedCount})</option>
              <option value="unverified">Unverified Only ({unverifiedCount})</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="border border-gray-100 rounded-2xl p-6 bg-white flex flex-col h-full animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                    <div className="h-3 w-32 bg-gray-100 rounded"></div>
                  </div>
                </div>
                <div className="space-y-3 mt-4">
                  <div className="h-8 w-full bg-gray-50 rounded"></div>
                  <div className="h-6 w-20 bg-gray-100 rounded-full"></div>
                </div>
                <div className="mt-8 h-10 w-full bg-gray-200 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : filteredDonors.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No donors found</h3>
            <p className="text-gray-500 max-w-sm mx-auto">
              {searchQuery ? `We couldn't find any donors matching "${searchQuery}".` : "There are currently no donors registered in the system."}
            </p>
            {searchQuery && (
              <button 
                onClick={() => {setSearchQuery(''); setFilterStatus('all');}}
                className="mt-6 text-red-600 font-medium hover:text-red-700 hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDonors.map((donor) => (
              <DonorCard 
                key={donor._id} 
                donor={donor} 
                onVerify={handleVerify} 
              />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
