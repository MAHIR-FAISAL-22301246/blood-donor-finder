"use client";

import { useEffect, useState } from 'react';
import DonorCard from '@/components/ui/DonorCard';
import { IUserDTO } from '@/types';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function AdminDashboard() {
  const [donors, setDonors] = useState<IUserDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDonors = async () => {
    try {
      const res = await fetch('/api/donors?all=true');
      const data = await res.json();
      if (data.success) {
        setDonors(data.data);
      } else {
        setError(data.message || 'Failed to fetch donors');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while fetching donors.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, []);

  const handleVerify = async (id: string) => {
    try {
      const res = await fetch(`/api/donors/${id}/verify`, { method: 'PATCH' });
      const data = await res.json();
      if (data.success) {
        // Update local state to show verified
        setDonors(donors.map(donor => donor._id === id ? { ...donor, isVerified: true } : donor));
      } else {
        alert('Failed to verify donor: ' + data.message);
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred during verification.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8 border-b pb-4">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage and verify all registered donors</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : donors.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500">No donors found in the system.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {donors.map((donor) => (
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
