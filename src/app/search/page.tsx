'use client';

import { useState } from 'react';

interface Donor {
  _id: string;
  name: string;
  bloodGroup: string;
  phone: string;
  location: {
    division: string;
    district: string;
    area: string;
  };
}

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function SearchPage() {
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string>('');
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!selectedBloodGroup) {
      setError('Please select a blood group');
      return;
    }

    setLoading(true);
    setError(null);
    setDonors([]);

    try {
      const params = new URLSearchParams();
      params.set('bloodGroup', selectedBloodGroup);
      const res = await fetch(`/api/donors?${params.toString()}`);

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server error: ${res.status} ${text || res.statusText}`);
      }

      const json = await res.json();

      if (!json.success) {
        throw new Error(json.message || 'Failed to fetch donors');
      }

      setDonors(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sky-bg py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-3 tracking-tight">
            Find Blood Donors
          </h1>
          <p className="text-lg text-slate-600 max-w-xl mx-auto">
            Search by blood group to find available donors near you
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-10">
          <div className="flex flex-col sm:flex-row gap-5 items-end">
            <div className="flex-1 w-full">
              <label
                htmlFor="bloodGroup"
                className="block text-sm font-semibold text-slate-700 mb-2.5"
              >
                Blood Group
              </label>
              <select
                id="bloodGroup"
                value={selectedBloodGroup}
                onChange={(e) => setSelectedBloodGroup(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-sky-button focus:ring-2 focus:ring-sky-hover/30 focus:outline-none transition-colors"
              >
                <option value="">Select blood group</option>
                {BLOOD_GROUPS.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleSearch}
              disabled={loading}
              className="w-full sm:w-auto px-8 py-3 bg-sky-button text-white font-semibold rounded-lg hover:bg-sky-hover disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {error && (
            <p className="mt-5 text-sm text-red-600 font-medium">{error}</p>
          )}
        </div>

        {loading && (
          <p className="text-center text-slate-500 font-medium">Searching...</p>
        )}

        {!loading && donors.length === 0 && !error && selectedBloodGroup && (
          <p className="text-center text-slate-500">
            No donors found for blood group <span className="font-semibold text-slate-700">{selectedBloodGroup}</span>
          </p>
        )}

        {donors.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {donors.map((donor) => (
              <div
                key={donor._id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-xl font-semibold text-slate-800">
                    {donor.name}
                  </h3>
                  <span className="px-3.5 py-1.5 bg-sky-bg text-slate-700 text-sm font-semibold rounded-full border border-sky-hover/20">
                    {donor.bloodGroup}
                  </span>
                </div>

                <div className="space-y-3 text-sm text-slate-600">
                  <p className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="font-medium text-slate-700">Phone:</span>
                    <a
                      href={`tel:${donor.phone}`}
                      className="text-slate-900 hover:text-sky-hover underline underline-offset-2 transition-colors"
                    >
                      {donor.phone}
                    </a>
                  </p>
                  <p className="flex items-start gap-2.5">
                    <svg className="w-4 h-4 text-slate-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243A8 8 0 1117.657 16.657z" />
                      <circle cx={12} cy={11} r={1.5} fill="currentColor" />
                    </svg>
                    <span>
                      <span className="font-medium text-slate-700">Location:</span> {donor.location.area}, {donor.location.district}, {donor.location.division}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
