'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { ISavedSearchDTO } from '@/types';

export default function SavedSearchesPage() {
  const [searches, setSearches] = useState<ISavedSearchDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSearches = async () => {
    try {
      const res = await fetch('/api/saved-searches');
      const json = await res.json();
      if (!json.success) throw new Error(json.message || 'Failed to fetch saved searches');
      setSearches(json.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSearches();
  }, []);

  const applySearch = (s: ISavedSearchDTO) => {
    const params = new URLSearchParams();
    if (s.bloodGroup) params.set('bloodGroup', s.bloodGroup);
    if (s.division) params.set('division', s.division);
    if (s.district) params.set('district', s.district);
    if (s.availability) params.set('availability', s.availability);
    if (s.sortBy) params.set('sortBy', s.sortBy);
    window.location.href = `/search?${params.toString()}`;
  };

  const deleteSearch = async (id: string) => {
    try {
      await fetch(`/api/saved-searches?id=${id}`, { method: 'DELETE' });
      setSearches((prev) => prev.filter((s) => s._id !== id));
    } catch {
      /* ignore */
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500 font-medium">Loading saved searches...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white py-16 px-4">
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
    <>
      <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                <span className="text-red-400">💾</span>
                Saved Searches
              </h1>
              <p className="text-slate-300 text-lg max-w-xl">
                Quickly reuse your previous donor searches.
              </p>
            </div>
            <Link href="/search" className="inline-flex items-center justify-center px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-lg transition-colors">
              ← Back to Search
            </Link>
          </div>
        </div>
      </div>

      <main className="flex-grow container mx-auto px-4 pt-8 pb-12">
        <div className="max-w-4xl mx-auto -mt-20">

        {searches.length === 0 ? (
          <div className="bg-white border-2 border-black rounded-xl shadow-sm p-8 text-center">
            <p className="text-gray-500 mb-4">No saved searches yet.</p>
            <Link href="/search" className="inline-block px-6 py-3 bg-oxblood text-white font-semibold rounded-lg hover:bg-oxblood-hover transition-colors shadow-sm">
              Search Donors
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {searches.map((s) => (
              <div
                key={s._id}
                className="flex items-center justify-between bg-white border border-ivory-border rounded-xl p-5 hover:border-oxblood/40 hover:shadow-md transition-all"
              >
                <button
                  onClick={() => applySearch(s)}
                  className="text-left flex-1"
                >
                  <p className="font-semibold text-slate-800">
                    {[s.bloodGroup, s.division, s.district].filter(Boolean).join(' · ') || 'All donors'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {[s.availability && `Availability: ${s.availability}`, s.sortBy && `Sort: ${s.sortBy}`].filter(Boolean).join(' · ') || 'No additional filters'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(s.searchedAt).toLocaleString()}
                  </p>
                </button>
                <button
                  onClick={() => deleteSearch(s._id)}
                  className="ml-4 text-gray-400 hover:text-red-600 transition-colors"
                  aria-label="Delete search"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      </main>
    </>
  );
}
