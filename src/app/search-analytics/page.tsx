'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { SearchAnalytics } from '@/types';

export default function SearchAnalyticsPage() {
  const [analytics, setAnalytics] = useState<SearchAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch(`/api/search-analytics?days=${days}`);
        const json = await res.json();
        if (!json.success) throw new Error(json.message || 'Failed to fetch analytics');
        setAnalytics(json.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [days]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-500 font-medium">Loading analytics...</p>
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

  if (!analytics) return null;

  const shortageColors: Record<string, string> = {
    high: 'bg-red-100 text-red-800 border-red-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-green-100 text-green-800 border-green-200',
  };

  const shortageLabels: Record<string, string> = {
    high: 'High shortage',
    medium: 'Moderate',
    low: 'Sufficient',
  };

  const sortedDemand = [...analytics.bloodGroupDemand].sort((a, b) => b.searchCount - a.searchCount);

  return (
    <div className="min-h-screen bg-white py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-1">Demand & Availability Insights</h1>
            <p className="text-gray-600">See what blood groups people need most versus available donors.</p>
          </div>
          <Link href="/search" className="text-sm font-semibold text-oxblood hover:text-oxblood-hover transition-colors">
            ← Back to Search
          </Link>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <label className="text-sm font-medium text-slate-700">Period:</label>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="rounded-md border border-ivory-border bg-white px-3 py-1.5 text-sm text-slate-700 focus:border-oxblood focus:outline-none"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white border-2 border-black rounded-xl p-6">
            <p className="text-sm text-gray-500 mb-1">Total Searches</p>
            <p className="text-3xl font-bold text-slate-800">{analytics.totalSearches}</p>
          </div>
          <div className="bg-white border border-ivory-border rounded-xl p-6">
            <p className="text-sm text-gray-500 mb-1">Most Searched Blood Group</p>
            <p className="text-2xl font-bold text-oxblood">{analytics.mostSearchedBloodGroup || '—'}</p>
          </div>
          <div className="bg-white border border-ivory-border rounded-xl p-6">
            <p className="text-sm text-gray-500 mb-1">Most Searched Location</p>
            <p className="text-2xl font-bold text-slate-800">{analytics.mostSearchedLocation || '—'}</p>
          </div>
        </div>

        <div className="bg-white border border-ivory-border rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Demand vs Availability</h2>
          <p className="text-sm text-gray-500 mb-4">How many people searched for each blood group versus how many available donors exist.</p>
          {sortedDemand.length === 0 ? (
            <p className="text-gray-500 text-sm">No demand data available for this period.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-ivory-border">
                    <th className="px-4 py-2 font-semibold text-slate-700">Blood Group</th>
                    <th className="px-4 py-2 font-semibold text-slate-700">Searches (Demand)</th>
                    <th className="px-4 py-2 font-semibold text-slate-700">Available Donors</th>
                    <th className="px-4 py-2 font-semibold text-slate-700">Total Donors</th>
                    <th className="px-4 py-2 font-semibold text-slate-700">Shortage Level</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedDemand.map((item) => (
                    <tr key={item.bloodGroup} className="border-b border-ivory-border last:border-0">
                      <td className="px-4 py-2 text-slate-800 font-semibold">{item.bloodGroup}</td>
                      <td className="px-4 py-2 text-slate-800">{item.searchCount}</td>
                      <td className="px-4 py-2 text-slate-800">{item.availableDonors}</td>
                      <td className="px-4 py-2 text-slate-800">{item.totalDonors}</td>
                      <td className="px-4 py-2">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${shortageColors[item.shortageLevel]}`}>
                          {shortageLabels[item.shortageLevel]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
