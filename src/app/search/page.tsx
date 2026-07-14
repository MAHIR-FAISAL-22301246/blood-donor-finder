'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

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
  location: {
    division: string;
    district: string;
    area: string;
  };
  isAvailable: boolean;
  isVerified: boolean;
  lastDonationDate?: string;
  updatedAt: string;
  donationHistory: DonationRecord[];
}

type SortKey = 'default' | 'nearest' | 'recent' | 'name';
type AvailabilityKey = '' | 'available' | 'unavailable';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'default', label: 'Default' },
  { value: 'nearest', label: 'Nearest location' },
  { value: 'recent', label: 'Most recently active' },
  { value: 'name', label: 'Name (A–Z)' },
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const DIVISIONS = [
  'Dhaka',
  'Chittagong',
  'Khulna',
  'Rajshahi',
  'Barisal',
  'Sylhet',
  'Rangpur',
  'Mymensingh',
];

const RECENT_DAYS = 90;
const NOW = Date.now();
const STORAGE_KEY = 'bloodDonorSearch';

export default function SearchPage() {
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string>('');
  const [selectedDivision, setSelectedDivision] = useState<string>('');
  const [district, setDistrict] = useState<string>('');
  const [availability, setAvailability] = useState<AvailabilityKey>('');
  const [sortBy, setSortBy] = useState<SortKey>('default');
  const [donors, setDonors] = useState<Donor[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const saved = JSON.parse(raw);
      setSelectedBloodGroup(saved.selectedBloodGroup ?? '');
      setSelectedDivision(saved.selectedDivision ?? '');
      setDistrict(saved.district ?? '');
      setAvailability(saved.availability ?? '');
      setSortBy(saved.sortBy ?? 'default');
      setDonors(saved.donors ?? []);
      setHasSearched(Boolean(saved.hasSearched));
    } catch {
      /* ignore corrupted state */
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const saved = {
      selectedBloodGroup,
      selectedDivision,
      district,
      availability,
      sortBy,
      donors,
      hasSearched,
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  }, [selectedBloodGroup, selectedDivision, district, availability, sortBy, donors, hasSearched]);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setDonors([]);

    try {
      const params = new URLSearchParams();
      if (selectedBloodGroup) params.set('bloodGroup', selectedBloodGroup);
      if (selectedDivision) params.set('division', selectedDivision);
      if (district.trim()) params.set('district', district.trim());
      if (availability) params.set('availability', availability);
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
      setHasSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedBloodGroup('');
    setSelectedDivision('');
    setDistrict('');
    setAvailability('');
    setSortBy('default');
    setDonors([]);
    setHasSearched(false);
    setError(null);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  const sortedDonors = useMemo(() => {
    const list = [...donors];
    const qDistrict = district.trim().toLowerCase();
    const qDivision = selectedDivision.toLowerCase();

    switch (sortBy) {
      case 'name':
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'recent':
        list.sort(
          (a, b) =>
            new Date(b.lastDonationDate ?? 0).getTime() -
            new Date(a.lastDonationDate ?? 0).getTime()
        );
        break;
      case 'nearest':
        list.sort((a, b) => {
          const rank = (d: Donor) =>
            d.location.district.toLowerCase() === qDistrict
              ? 0
              : d.location.division.toLowerCase() === qDivision
                ? 1
                : 2;
          const diff = rank(a) - rank(b);
          return diff !== 0 ? diff : a.name.localeCompare(b.name);
        });
        break;
      case 'default':
      default:
        break;
    }
    return list;
  }, [donors, sortBy, district, selectedDivision]);

  const summary = useMemo(() => {
    let available = 0;
    let unavailable = 0;
    let recentlyActive = 0;
    let notRecentlyActive = 0;

    for (const d of sortedDonors) {
      if (d.isAvailable) available++;
      else unavailable++;

      const last = d.lastDonationDate ? new Date(d.lastDonationDate).getTime() : 0;
      if (last && NOW - last <= RECENT_DAYS * 86400000) recentlyActive++;
      else notRecentlyActive++;
    }

    return { available, unavailable, recentlyActive, notRecentlyActive };
  }, [sortedDonors]);

  const selectClass =
    'w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-sky-button focus:ring-2 focus:ring-sky-hover/30 focus:outline-none transition-colors';

  const thinSelectClass =
    'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-sky-button focus:ring-2 focus:ring-sky-hover/30 focus:outline-none transition-colors';

  return (
    <div className="min-h-screen bg-sky-bg py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-3 tracking-tight">
            Find Blood Donors
          </h1>
          <p className="text-lg text-slate-600 max-w-xl mx-auto">
            Filter by blood group, location and availability, then sort the results
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-end">
            <div className="w-full">
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
                className={selectClass}
              >
                <option value="">None</option>
                {BLOOD_GROUPS.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full">
              <label
                htmlFor="division"
                className="block text-sm font-semibold text-slate-700 mb-2.5"
              >
                Division
              </label>
              <select
                id="division"
                value={selectedDivision}
                onChange={(e) => setSelectedDivision(e.target.value)}
                className={selectClass}
              >
                <option value="">None</option>
                {DIVISIONS.map((division) => (
                  <option key={division} value={division}>
                    {division}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full">
              <label
                htmlFor="district"
                className="block text-sm font-semibold text-slate-700 mb-2.5"
              >
                District
              </label>
              <input
                id="district"
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="None"
                className={selectClass + ' placeholder:text-slate-400'}
              />
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <div className="bg-white rounded-lg border border-slate-200 p-3">
            <label
              htmlFor="availability"
              className="block text-xs font-medium text-slate-500 mb-1.5"
            >
              Availability
            </label>
            <select
              id="availability"
              value={availability}
              onChange={(e) => setAvailability(e.target.value as AvailabilityKey)}
              className={thinSelectClass}
            >
              <option value="">None</option>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-3">
            <label
              htmlFor="sort"
              className="block text-xs font-medium text-slate-500 mb-1.5"
            >
              Sort by
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              className={thinSelectClass}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleReset}
            className="bg-white rounded-lg border border-slate-200 p-3 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors text-left"
          >
            Reset All
          </button>
        </div>

        {loading && (
          <p className="text-center text-slate-500 font-medium">Searching...</p>
        )}

        {!loading && hasSearched && donors.length === 0 && !error && (
          <p className="text-center text-slate-500">
            No donors match your filters.
          </p>
        )}

        {sortedDonors.length > 0 && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <p className="text-sm font-medium text-slate-600">
                {sortedDonors.length} donor{sortedDonors.length !== 1 && 's'} found
              </p>
              <div className="flex flex-wrap gap-2 text-xs font-medium">
                <span className="px-3 py-1.5 rounded-full bg-green-100 text-green-700">
                  Available: {summary.available}
                </span>
                <span className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-600">
                  Unavailable: {summary.unavailable}
                </span>
                <span className="px-3 py-1.5 rounded-full bg-sky-bg text-slate-700 border border-sky-hover/20">
                  Recently active: {summary.recentlyActive}
                </span>
                <span className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-600">
                  Not recently active: {summary.notRecentlyActive}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {sortedDonors.map((donor) => (
                <div
                  key={donor._id}
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(`/donors/${donor._id}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      router.push(`/donors/${donor._id}`);
                    }
                  }}
                  className="block cursor-pointer bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md hover:border-sky-hover/40 transition-all"
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
                        onClick={(e) => e.stopPropagation()}
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
                        <span className="font-medium text-slate-700">Location:</span>{' '}
                        {donor.location.area}, {donor.location.district},{' '}
                        {donor.location.division}
                      </span>
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          donor.isAvailable
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {donor.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                      {donor.isVerified && (
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                          ✓ Verified
                        </span>
                      )}
                      <span className="text-xs text-slate-400 ml-auto">
                        {donor.donationHistory.length} donation
                        {donor.donationHistory.length !== 1 && 's'} · View history
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
