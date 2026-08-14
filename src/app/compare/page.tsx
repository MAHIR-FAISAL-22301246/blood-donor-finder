'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface Donor {
  _id: string;
  name: string;
  bloodGroup: string;
  phone: string;
  location: { division: string; district: string; area: string };
  isAvailable: boolean;
  isVerified: boolean;
  lastDonationDate?: string;
  donationHistory: { date: string; hospital: string; division: string; district: string; area?: string }[];
  email: string;
  role: string;
  createdAt: string;
}

type Step = 'compare' | 'confirm' | 'success';

export default function ComparePage() {
  const searchParams = useSearchParams();
  const ids = searchParams.get('ids')?.split(',').filter(Boolean) || [];

  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [step, setStep] = useState<Step>('compare');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchDonors = async () => {
      if (ids.length === 0) {
        setError('No donors selected for comparison.');
        setLoading(false);
        return;
      }

      const uniqueIds = Array.from(new Set(ids));
      const results: Donor[] = [];
      const errors: string[] = [];

      for (const id of uniqueIds) {
        try {
          const res = await fetch(`/api/donors/${id}`);
          const json = await res.json();
          if (!json.success) {
            errors.push(json.message || `Donor ${id} not found`);
            continue;
          }
          results.push(json.data as Donor);
        } catch {
          errors.push(`Failed to load donor ${id}`);
        }
      }

      if (results.length > 0) {
        setDonors(results);
      }
      if (errors.length > 0) {
        setError(errors.join('\n'));
      }

      setLoading(false);
    };

    fetchDonors();
  }, [ids]);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setStep('confirm');
  };

  const handleConfirm = async () => {
    if (!selectedId) return;
    setSaving(true);
    try {
      const res = await fetch('/api/selected-donors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donorId: selectedId }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'Failed to save selection');
      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save selection');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <p className="text-gray-500 font-medium">Loading donors...</p>
      </div>
    );
  }

  if (error && donors.length === 0) {
    return (
      <div className="min-h-screen bg-ivory py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-red-600 font-medium mb-6">{error}</p>
          <Link href="/search" className="inline-block px-6 py-3 bg-oxblood text-white font-semibold rounded-lg hover:bg-oxblood-hover transition-colors shadow-sm">
            Back to search
          </Link>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    const selected = donors.find((d) => d._id === selectedId);
    return (
      <div className="min-h-screen bg-ivory py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
           <div className="bg-white rounded-xl shadow-sm border border-ivory-border p-8 mb-6">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Donor Selected</h1>
            <p className="text-gray-600 mb-6">You have successfully selected a donor.</p>
            {selected && (
              <div className="text-left bg-ivory rounded-lg p-4 mb-6">
                <p className="font-semibold text-slate-800">{selected.name}</p>
                <p className="text-sm text-gray-600">🩸 {selected.bloodGroup}</p>
                <p className="text-sm text-gray-600">📍 {selected.location.district}, {selected.location.division}</p>
                <p className="text-sm text-gray-600">📞 {selected.phone}</p>
              </div>
            )}
            <div className="flex gap-3 justify-center">
              <Link href="/selected-donors" className="inline-block px-6 py-3 bg-oxblood text-white font-semibold rounded-lg hover:bg-oxblood-hover transition-colors shadow-sm">
                View History
              </Link>
              <Link href="/search" className="inline-block px-6 py-3 bg-white border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors">
                Back to Search
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'confirm') {
    const donor = donors.find((d) => d._id === selectedId);
    if (!donor) return null;

    return (
      <div className="min-h-screen bg-ivory py-16 px-4">
        <div className="max-w-2xl mx-auto">
           <div className="bg-white rounded-xl shadow-sm border border-ivory-border p-8">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Confirm Selection</h1>
            <p className="text-gray-600 mb-6">Please review the selected donor details before finalizing.</p>

            {error && (
              <p className="mb-4 text-sm text-red-600 font-medium whitespace-pre-line">{error}</p>
            )}

            <div className="bg-ivory rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-slate-800">{donor.name}</h2>
                <span className="px-3.5 py-1.5 bg-oxblood-light text-oxblood text-sm font-semibold rounded-full border border-oxblood/20">
                  {donor.bloodGroup}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <span className="font-medium text-slate-700">Phone:</span>
                  <a href={`tel:${donor.phone}`} className="text-slate-900 hover:text-oxblood underline underline-offset-2 transition-colors">
                    {donor.phone}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <span className="font-medium text-slate-700">Location:</span>
                  {donor.location.area}, {donor.location.district}, {donor.location.division}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${donor.isAvailable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {donor.isAvailable ? 'Available' : 'Unavailable'}
                </span>
                {donor.isVerified && (
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">✓ Verified</span>
                )}
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setStep('compare')}
                className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleConfirm}
                disabled={saving}
                className="px-6 py-3 bg-oxblood text-white font-semibold rounded-lg hover:bg-oxblood-hover disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                {saving ? 'Saving...' : 'Confirm Selection'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const fields = [
    { label: 'Name', key: 'name', format: (d: Donor) => d.name },
    { label: 'Blood Group', key: 'bloodGroup', format: (d: Donor) => d.bloodGroup },
    { label: 'Phone', key: 'phone', format: (d: Donor) => d.phone },
    { label: 'Location', key: 'location', format: (d: Donor) => `${d.location.area}, ${d.location.district}, ${d.location.division}` },
    { label: 'Availability', key: 'isAvailable', format: (d: Donor) => d.isAvailable ? 'Available' : 'Unavailable' },
    { label: 'Verified', key: 'isVerified', format: (d: Donor) => d.isVerified ? 'Yes' : 'No' },
    {
      label: 'Last Donation',
      key: 'lastDonationDate',
      format: (d: Donor) =>
        d.lastDonationDate
          ? new Date(d.lastDonationDate).toLocaleDateString()
          : 'No records',
    },
    {
      label: 'Donation History',
      key: 'donationHistory',
      format: (d: Donor) => `${d.donationHistory.length} record${d.donationHistory.length !== 1 ? 's' : ''}`,
    },
  ];

  return (
    <div className="min-h-screen bg-ivory py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-1">Compare Donors</h1>
            <p className="text-gray-600">Review side-by-side and select the best match.</p>
          </div>
          <Link href="/search" className="text-sm font-semibold text-oxblood hover:text-oxblood-hover transition-colors">
            ← Back to Search
          </Link>
        </div>

        {error && donors.length > 0 && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 whitespace-pre-line">
            {error}
          </div>
        )}

        {donors.length === 0 && error ? (
          <div className="bg-white rounded-xl shadow-sm border border-ivory-border p-8 text-center">
            <p className="text-red-600 font-medium mb-4">Could not load donors for comparison.</p>
            <Link href="/search" className="inline-block px-6 py-3 bg-oxblood text-white font-semibold rounded-lg hover:bg-oxblood-hover transition-colors shadow-sm">
              Back to Search
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-ivory-border overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-ivory-border">
                  <th className="px-6 py-4 font-semibold text-slate-700 w-40">Criteria</th>
                  {donors.map((donor) => (
                    <th key={donor._id} className="px-6 py-4 font-semibold text-slate-800">
                      {donor.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fields.map((field) => (
                  <tr key={field.key} className="border-b border-slate-100">
                    <td className="px-6 py-4 text-slate-600 font-medium">{field.label}</td>
                    {donors.map((donor) => (
                      <td key={donor._id} className="px-6 py-4 text-slate-800">
                        {field.format(donor)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500">Select the donor you want to choose.</p>
          <div className="flex gap-3">
            <Link
              href="/search"
              className="inline-flex items-center justify-center px-6 py-3 bg-white border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>
            {selectedId ? (
              <button
                onClick={() => handleSelect(selectedId)}
                className="inline-flex items-center justify-center px-6 py-3 bg-oxblood text-white font-semibold rounded-lg hover:bg-oxblood-hover transition-colors shadow-sm"
              >
                Select Donor
              </button>
            ) : (
              <button
                disabled
                className="inline-flex items-center justify-center px-6 py-3 bg-gray-300 text-gray-500 font-semibold rounded-lg cursor-not-allowed"
              >
                Select Donor
              </button>
            )}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          {donors.map((donor) => (
            <div
              key={donor._id}
              onClick={() => setSelectedId(donor._id)}
              className={`cursor-pointer rounded-xl border p-6 transition-all ${
                selectedId === donor._id
                  ? 'border-oxblood bg-oxblood-light shadow-md'
                   : 'border-ivory-border bg-white hover:border-oxblood/40 hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-slate-800">{donor.name}</h3>
                <span className="px-3.5 py-1.5 bg-oxblood-light text-oxblood text-sm font-semibold rounded-full border border-oxblood/20">
                  {donor.bloodGroup}
                </span>
              </div>
              <div className="space-y-2 text-sm text-slate-600">
                <p>📍 {donor.location.district}, {donor.location.division}</p>
                <p>📞 {donor.phone}</p>
                <div className="flex items-center gap-2 pt-1">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${donor.isAvailable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {donor.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                  {donor.isVerified && (
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">✓ Verified</span>
                  )}
                </div>
              </div>
              {selectedId === donor._id && (
                <div className="mt-4 text-xs font-semibold text-oxblood">Selected</div>
              )}
            </div>
            ))}
        </div>
          </>
        )}
      </div>
    </div>
  );
}
