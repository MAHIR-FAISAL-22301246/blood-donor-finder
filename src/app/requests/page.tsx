"use client";

import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Droplet, CheckCircle, AlertCircle } from 'lucide-react';
import { BloodGroup } from '@/types';

const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const DIVISIONS = ['Dhaka', 'Chattogram', 'Rajshahi', 'Khulna', 'Barishal', 'Sylhet', 'Rangpur', 'Mymensingh'];

interface FormData {
  patientName: string;
  bloodGroup: BloodGroup | '';
  unitsNeeded: string;
  hospital: string;
  division: string;
  district: string;
  area: string;
  requiredDate: string;
  contactPhone: string;
  description: string;
}

const initialForm: FormData = {
  patientName: '',
  bloodGroup: '',
  unitsNeeded: '1',
  hospital: '',
  division: '',
  district: '',
  area: '',
  requiredDate: '',
  contactPhone: '',
  description: '',
};

export default function RequestBloodPage() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: form.patientName,
          bloodGroup: form.bloodGroup,
          unitsNeeded: Number(form.unitsNeeded),
          hospital: form.hospital,
          location: {
            division: form.division,
            district: form.district,
            area: form.area,
          },
          requiredDate: form.requiredDate,
          contactPhone: form.contactPhone,
          description: form.description,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        setForm(initialForm);
      } else {
        setError(data.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Navbar />

      {/* Hero */}
      <div className="bg-[#1e293b] text-white pb-20 pt-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-2">
            <Droplet size={32} className="text-red-400" />
            <h1 className="text-4xl font-bold">Request Blood</h1>
          </div>
          <p className="text-slate-300 text-lg max-w-xl">
            Fill in the details below and our verified donors in your area will be notified immediately.
          </p>
        </div>
      </div>

      <main className="flex-grow container mx-auto px-4 py-8 pb-16 max-w-3xl">

        {/* Success State */}
        {submitted && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center mb-8">
            <CheckCircle size={48} className="text-green-500 mx-auto mb-3" />
            <h2 className="text-2xl font-bold text-green-800 mb-2">Request Submitted!</h2>
            <p className="text-green-700 mb-6">
              Your blood request has been recorded. Our admin team will review it and help connect you with available donors.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
            >
              Submit Another Request
            </button>
          </div>
        )}

        {/* Form */}
        {!submitted && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Patient & Request Details</h2>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Patient Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="patientName"
                    value={form.patientName}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Rahim Uddin"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Blood Group Required <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="bloodGroup"
                    value={form.bloodGroup}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all cursor-pointer"
                  >
                    <option value="">Select blood group</option>
                    {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Units Needed <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="unitsNeeded"
                    value={form.unitsNeeded}
                    onChange={handleChange}
                    min={1}
                    max={20}
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Required By Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="requiredDate"
                    value={form.requiredDate}
                    onChange={handleChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                  />
                </div>
              </div>

              {/* Hospital */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Hospital / Clinic Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="hospital"
                  value={form.hospital}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Dhaka Medical College Hospital"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                />
              </div>

              {/* Location */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Division <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="division"
                    value={form.division}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all cursor-pointer"
                  >
                    <option value="">Select division</option>
                    {DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    District <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="district"
                    value={form.district}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Dhaka"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Area (optional)</label>
                  <input
                    type="text"
                    name="area"
                    value={form.area}
                    onChange={handleChange}
                    placeholder="e.g. Mirpur"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                  />
                </div>
              </div>

              {/* Contact */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Contact Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="contactPhone"
                  value={form.contactPhone}
                  onChange={handleChange}
                  required
                  placeholder="e.g. 01712345678"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Additional Details (optional)
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Any additional context about the patient or urgency..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Droplet size={18} />
                    Submit Blood Request
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
