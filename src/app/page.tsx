'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const STATS = [
  { value: '10,000+', label: 'Registered Donors', icon: '🩸' },
  { value: '5,000+', label: 'Lives Saved', icon: '❤️' },
  { value: '64', label: 'Districts Covered', icon: '📍' },
  { value: '24/7', label: 'Emergency Support', icon: '🏥' },
];

const FEATURES = [
  {
    icon: '🔍',
    title: 'Smart Donor Search',
    desc: 'Filter donors by blood group, location, and availability in seconds.',
    href: '/search',
    color: 'from-red-500 to-rose-600',
  },
  {
    icon: '📋',
    title: 'Blood Request Board',
    desc: 'Post urgent blood requests and get matched with nearby donors instantly.',
    href: '/requests',
    color: 'from-orange-500 to-red-500',
  },
  {
    icon: '📊',
    title: 'Demand Analytics',
    desc: 'See real-time blood group demand vs available donors across Bangladesh.',
    href: '/search-analytics',
    color: 'from-pink-500 to-rose-500',
  },
  {
    icon: '⚖️',
    title: 'Compare Donors',
    desc: 'Compare multiple donors side-by-side and choose the best match for your need.',
    href: '/search',
    color: 'from-red-600 to-pink-600',
  },
  {
    icon: '💾',
    title: 'Saved Searches',
    desc: 'Save your search filters and reuse them anytime — no need to start over.',
    href: '/saved-searches',
    color: 'from-rose-500 to-red-600',
  },
  {
    icon: '⭐',
    title: 'Donor Feedback',
    desc: 'Rate your experience to help others find the most reliable donors.',
    href: '/feedback',
    color: 'from-orange-400 to-red-500',
  },
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-full">

      {/* ─── Hero ─── */}
      <section className="relative bg-[#1e293b] text-white overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-red-600/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-pink-600/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

        <div className="container mx-auto px-4 py-20 md:py-28 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block bg-red-500/20 text-red-300 border border-red-500/30 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
              🩸 Bangladesh&apos;s #1 Blood Donor Network
            </span>
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
              Find a{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-pink-400">
                Blood Donor
              </span>
              <br />in Minutes
            </h1>
            <p className="text-slate-300 text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
              Connecting patients in urgent need with verified blood donors — fast, safe, and completely free.
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/search"
                className="group bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:scale-105"
              >
                🔍 Find a Donor
              </Link>
              <Link
                href="/requests"
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-8 py-4 rounded-xl text-lg transition-all hover:scale-105 backdrop-blur-sm"
              >
                🏥 Request Blood
              </Link>
              {!user && (
                <Link
                  href="/register"
                  className="bg-white text-red-600 hover:bg-red-50 font-bold px-8 py-4 rounded-xl text-lg transition-all hover:scale-105 shadow-lg"
                >
                  🩸 Become a Donor
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Wave bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60L60 50C120 40 240 20 360 15C480 10 600 20 720 28C840 36 960 42 1080 40C1200 38 1320 28 1380 23L1440 18V60H0Z" fill="#f8fafc" />
          </svg>
        </div>
      </section>

      {/* ─── Stats Bar ─── */}
      <section className="bg-slate-50 pt-8 pb-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 -mt-6">
            {STATS.map(stat => (
              <div key={stat.label} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 text-center hover:shadow-md transition-shadow">
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-3xl font-extrabold text-slate-800">{stat.value}</div>
                <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Quick Blood Group Search ─── */}
      <section className="bg-slate-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Quick Search by Blood Group</h2>
            <p className="text-slate-500">Click your blood type to find donors immediately</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
            {BLOOD_GROUPS.map(bg => (
              <Link
                key={bg}
                href={`/search?bloodGroup=${encodeURIComponent(bg)}`}
                className="group relative bg-white border-2 border-slate-200 hover:border-red-400 text-slate-700 hover:text-red-600 font-bold text-lg w-20 h-20 rounded-2xl flex items-center justify-center transition-all hover:scale-110 hover:shadow-lg shadow-sm"
              >
                <span className="absolute inset-0 bg-gradient-to-br from-red-500 to-pink-500 opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity" />
                {bg}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features Grid ─── */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-3">Everything You Need</h2>
            <p className="text-slate-500 max-w-lg mx-auto">A complete platform built to make blood donation faster, smarter, and more accessible.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {FEATURES.map(f => (
              <Link
                key={f.title}
                href={f.href}
                className="group bg-slate-50 hover:bg-white border border-slate-100 hover:border-red-100 rounded-2xl p-6 transition-all hover:shadow-lg hover:-translate-y-1"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-2xl mb-4 shadow-md group-hover:scale-110 transition-transform`}>
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="bg-slate-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-3">How It Works</h2>
            <p className="text-slate-500">Three simple steps to find or donate blood</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: '01', icon: '📝', title: 'Register', desc: 'Create a free account as a donor or patient in under a minute.' },
              { step: '02', icon: '🔍', title: 'Search & Match', desc: 'Search by blood group and location to find the right donor instantly.' },
              { step: '03', icon: '🤝', title: 'Connect & Save Lives', desc: 'Contact the donor directly and coordinate the donation.' },
            ].map(s => (
              <div key={s.step} className="relative text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-pink-500 text-white text-2xl shadow-lg shadow-red-200 mb-4">
                  {s.icon}
                </div>
                <div className="absolute top-0 right-0 text-6xl font-black text-red-50 select-none leading-none -z-0">{s.step}</div>
                <h3 className="text-xl font-bold text-slate-800 mb-2 relative z-10">{s.title}</h3>
                <p className="text-slate-500 text-sm relative z-10">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ─── */}
      {!user && (
        <section className="bg-gradient-to-r from-red-600 to-pink-600 py-16 text-white text-center">
          <div className="container mx-auto px-4">
            <div className="text-5xl mb-4">🩸</div>
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Ready to Save a Life?</h2>
            <p className="text-red-100 text-lg mb-8 max-w-lg mx-auto">
              Join thousands of donors across Bangladesh. Your blood can save up to 3 lives.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/register"
                className="bg-white text-red-600 font-bold px-8 py-4 rounded-xl text-lg hover:bg-red-50 transition-all hover:scale-105 shadow-lg"
              >
                Become a Donor →
              </Link>
              <Link
                href="/requests/board"
                className="bg-white/10 border border-white/30 text-white font-bold px-8 py-4 rounded-xl text-lg hover:bg-white/20 transition-all hover:scale-105"
              >
                View Blood Requests
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
