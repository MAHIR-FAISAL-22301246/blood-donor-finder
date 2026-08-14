'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { ISelectedDonorDTO } from '@/types';

export default function SelectedDonorsPage() {
  const [records, setRecords] = useState<ISelectedDonorDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const res = await fetch('/api/selected-donors');
        const json = await res.json();
        if (!json.success) throw new Error(json.message || 'Failed to fetch selected donors');
        setRecords(json.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <p className="text-gray-500 font-medium">Loading history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-ivory py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-red-600 font-medium mb-6">{error}</p>
          <Link href="/search" className="inline-block px-6 py-3 bg-oxblood text-white font-semibold rounded-lg hover:bg-oxblood-hover transition-colors shadow-sm">
            Back to Search
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-1">Selected Donor History</h1>
            <p className="text-gray-600">All donors you have previously selected.</p>
          </div>
          <Link href="/search" className="text-sm font-semibold text-oxblood hover:text-oxblood-hover transition-colors">
            ← Back to Search
          </Link>
        </div>

        {records.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border-2 border-black p-8 text-center">
            <p className="text-gray-500 mb-4">No donors selected yet.</p>
            <Link href="/search" className="inline-block px-6 py-3 bg-oxblood text-white font-semibold rounded-lg hover:bg-oxblood-hover transition-colors shadow-sm">
              Find Donors
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {records.map((record) => (
              <div key={record._id} className="bg-white rounded-xl shadow-sm border-2 border-black p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-800">{record.donor.name}</h2>
                    <p className="text-sm text-gray-500">
                      Selected on {new Date(record.selectedAt).toLocaleString()}
                    </p>
                  </div>
                  <span className="px-3.5 py-1.5 bg-oxblood-light text-oxblood text-sm font-semibold rounded-full border border-oxblood/20">
                    {record.donor.bloodGroup}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <span className="font-medium text-slate-700">Phone:</span>
                    <a href={`tel:${record.donor.phone}`} className="text-slate-900 hover:text-oxblood underline underline-offset-2 transition-colors">
                      {record.donor.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <span className="font-medium text-slate-700">Location:</span>
                    {record.donor.location.area}, {record.donor.location.district}, {record.donor.location.division}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${record.donor.isAvailable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {record.donor.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                  {record.donor.isVerified && (
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">✓ Verified</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
