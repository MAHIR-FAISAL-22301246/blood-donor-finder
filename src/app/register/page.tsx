'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function RegisterPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    bloodGroup: '',
    phone: '',
    division: '',
    district: '',
    area: '',
    role: 'user',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();

      if (!json.success) {
        setError(json.message || 'Registration failed.');
        return;
      }

      await refresh();
      router.push('/');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 transition';
  const labelClass = 'block text-sm font-semibold text-slate-700 mb-1';

  return (
    <>
      {/* Hero */}
      <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <span className="text-red-400">🩸</span>
            Join Blood Donor Finder
          </h1>
          <p className="text-slate-300 text-lg">Create your account and start saving lives.</p>
        </div>
      </div>

      <main className="flex-grow container mx-auto px-4 pt-8 flex items-start justify-center -mt-16 relative z-10 pb-16">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Create Account</h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Account type */}
            <div>
              <label className={labelClass}>I am registering as</label>
              <div className="grid grid-cols-2 gap-3">
                {(['user', 'donor'] as const).map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => set('role', r)}
                    className={`py-2.5 rounded-lg border text-sm font-semibold transition ${
                      form.role === r
                        ? 'bg-red-500 text-white border-red-500'
                        : 'border-slate-200 text-slate-600 hover:border-red-300'
                    }`}
                  >
                    {r === 'user' ? '🏥 Patient / Requester' : '🩸 Blood Donor'}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Full Name</label>
                <input id="reg-name" type="text" required value={form.name} onChange={e => set('name', e.target.value)} placeholder="John Doe" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Blood Group</label>
                <select id="reg-bloodgroup" required value={form.bloodGroup} onChange={e => set('bloodGroup', e.target.value)} className={inputClass}>
                  <option value="">Select...</option>
                  {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>Email</label>
              <input id="reg-email" type="email" required value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Phone</label>
              <input id="reg-phone" type="tel" required value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="01XXXXXXXXX" className={inputClass} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>Division</label>
                <input id="reg-division" type="text" required value={form.division} onChange={e => set('division', e.target.value)} placeholder="Dhaka" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>District</label>
                <input id="reg-district" type="text" required value={form.district} onChange={e => set('district', e.target.value)} placeholder="Dhaka" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Area (optional)</label>
                <input id="reg-area" type="text" value={form.area} onChange={e => set('area', e.target.value)} placeholder="Mirpur" className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Password</label>
                <input id="reg-password" type="password" required value={form.password} onChange={e => set('password', e.target.value)} placeholder="Min. 6 characters" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Confirm Password</label>
                <input id="reg-confirm-password" type="password" required value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} placeholder="Repeat password" className={inputClass} />
              </div>
            </div>

            <button
              id="reg-submit"
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-red-600 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </>
  );
}
