'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface DonationRecord {
  date: string;
  hospital: string;
  division: string;
  district: string;
  area?: string;
}

interface Donor {
  _id: string;
  name: string;
  bloodGroup: string;
  phone: string;
  email: string;
  location: {
    division: string;
    district: string;
    area: string;
  };
  isAvailable: boolean;
  isVerified: boolean;
  lastDonationDate?: string;
  donationHistory: DonationRecord[];
}

export default function DonorProfilePage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [donor, setDonor] = useState<Donor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchDonor = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/donors/${id}`);
        const json = await res.json();
        if (!json.success) {
          throw new Error(json.message || 'Donor not found');
        }
        setDonor(json.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };
    fetchDonor();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-sky-bg flex items-center justify-center">
        <p className="text-slate-500 font-medium">Loading donor...</p>
      </div>
    );
  }

  if (error || !donor) {
    return (
      <div className="min-h-screen bg-sky-bg py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-red-600 font-medium mb-6">{error || 'Donor not found'}</p>
          <Link
            href="/search"
            className="inline-block px-6 py-3 bg-sky-button text-white font-semibold rounded-lg hover:bg-sky-hover transition-colors shadow-sm"
          >
            Back to search
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sky-bg py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/search"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-sky-hover transition-colors mb-8"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to search
        </Link>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-slate-800">{donor.name}</h1>
            <span className="px-3.5 py-1.5 bg-sky-bg text-slate-700 text-sm font-semibold rounded-full border border-sky-hover/20">
              {donor.bloodGroup}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2.5 text-slate-600">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="font-medium text-slate-700">Phone:</span>
              <a href={`tel:${donor.phone}`} className="text-slate-900 hover:text-sky-hover underline underline-offset-2 transition-colors">
                {donor.phone}
              </a>
            </div>
            <div className="flex items-center gap-2.5 text-slate-600">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243A8 8 0 1117.657 16.657z" />
                <circle cx={12} cy={11} r={1.5} fill="currentColor" />
              </svg>
              <span className="font-medium text-slate-700">Location:</span>
              {donor.location.area}, {donor.location.district}, {donor.location.division}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-5">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${donor.isAvailable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
              {donor.isAvailable ? 'Available' : 'Unavailable'}
            </span>
            {donor.isVerified && (
              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                ✓ Verified
              </span>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-800">Donation History</h2>
            <span className="px-3 py-1.5 bg-sky-bg text-slate-700 text-sm font-semibold rounded-full border border-sky-hover/20">
              {donor.donationHistory.length} time{donor.donationHistory.length !== 1 && 's'}
            </span>
          </div>

          {donor.donationHistory.length === 0 ? (
            <p className="text-slate-500 text-sm">No donation history recorded yet.</p>
          ) : (
            <ol className="relative border-l-2 border-slate-200 ml-2 space-y-6">
              {[...donor.donationHistory]
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((record, index) => (
                  <li key={index} className="ml-5">
                    <span className="absolute -left-[9px] w-4 h-4 bg-sky-button rounded-full border-2 border-white" />
                    <p className="text-sm font-semibold text-slate-800">
                      {new Date(record.date).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-sm text-slate-600 mt-1">
                      {record.hospital || 'Unknown hospital'}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {record.area ? `${record.area}, ` : ''}{record.district}, {record.division}
                    </p>
                  </li>
                ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
