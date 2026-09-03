"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Toaster, toast } from 'react-hot-toast';
import { User, MapPin, Droplet, Phone, Mail, Shield, Clock, ToggleLeft, ToggleRight } from 'lucide-react';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: 'donor' | 'admin' | 'user';
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
  createdAt: string;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/auth/profile');
        const data = await res.json();
        if (data.success) {
          setProfile(data.data);
        } else {
          toast.error('Failed to load profile');
        }
      } catch {
        toast.error('Network error');
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchProfile();
    else setLoading(false);
  }, [user]);

  const handleToggleAvailability = async () => {
    if (!profile) return;
    setToggling(true);
    try {
      const res = await fetch(`/api/donors/${profile._id}/availability`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: !profile.isAvailable }),
      });
      const data = await res.json();
      if (data.success) {
        setProfile({ ...profile, isAvailable: !profile.isAvailable });
        toast.success(
          !profile.isAvailable
            ? 'You are now marked as Available! Patients can find you.'
            : 'You are now Unavailable. You won\'t appear in search results.',
          { icon: !profile.isAvailable ? '🟢' : '🔴' }
        );
      } else {
        toast.error('Failed to update availability');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setToggling(false);
    }
  };

  if (!user) {
    return (
      <>
        <Navbar />
        <main className="flex-grow container mx-auto px-4 pt-24 pb-16 text-center">
          <h1 className="text-2xl font-bold text-gray-700">Please log in to view your profile.</h1>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Toaster position="top-center" />
      <Navbar />

      <main className="flex-grow container mx-auto px-4 pt-8 pb-16 max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3">
          <User className="text-red-500" size={32} />
          My Profile
        </h1>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : profile ? (
          <div className="space-y-6">

            {/* Basic Info Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-700 mb-4">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <User size={18} className="text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Name</p>
                    <p className="text-gray-800 font-semibold">{profile.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Email</p>
                    <p className="text-gray-800 font-semibold">{profile.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Phone</p>
                    <p className="text-gray-800 font-semibold">{profile.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Droplet size={18} className="text-red-400" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">Blood Group</p>
                    <p className="text-red-600 font-bold text-lg">{profile.bloodGroup}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Location Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                <MapPin size={18} className="text-red-400" />
                Location
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Division</p>
                  <p className="text-gray-800 font-semibold">{profile.location.division}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">District</p>
                  <p className="text-gray-800 font-semibold">{profile.location.district}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Area</p>
                  <p className="text-gray-800 font-semibold">{profile.location.area || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Status & Availability Card — Only for donors */}
            {profile.role === 'donor' && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                  <Shield size={18} className="text-blue-400" />
                  Donor Status
                </h2>

                <div className="space-y-5">
                  {/* Verification Badge */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">Verification:</span>
                    {profile.isVerified ? (
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <Shield size={12} /> Verified ✓
                      </span>
                    ) : (
                      <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">
                        Pending Verification
                      </span>
                    )}
                  </div>

                  {/* Availability Toggle */}
                  <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                    <div>
                      <p className="font-semibold text-gray-800">Donation Availability</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {profile.isAvailable
                          ? 'You are currently visible to patients searching for donors.'
                          : 'You are hidden from search results. Toggle to become available again.'}
                      </p>
                    </div>
                    <button
                      onClick={handleToggleAvailability}
                      disabled={toggling}
                      className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
                        profile.isAvailable
                          ? 'bg-green-500 hover:bg-green-600 text-white shadow-green-200 shadow-lg'
                          : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {toggling ? (
                        'Updating...'
                      ) : profile.isAvailable ? (
                        <>
                          <ToggleRight size={20} />
                          Available
                        </>
                      ) : (
                        <>
                          <ToggleLeft size={20} />
                          Unavailable
                        </>
                      )}
                    </button>
                  </div>

                  {/* Last Donation */}
                  {profile.lastDonationDate && (
                    <div className="flex items-center gap-3">
                      <Clock size={18} className="text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide">Last Donation</p>
                        <p className="text-gray-800 font-semibold">
                          {new Date(profile.lastDonationDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Account Info */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-700 mb-4">Account</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Role</p>
                  <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-bold capitalize ${
                    profile.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                    profile.role === 'donor' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {profile.role}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Member Since</p>
                  <p className="text-gray-800 font-semibold">
                    {new Date(profile.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div className="text-center text-gray-500 py-12">Could not load profile.</div>
        )}
      </main>

      <Footer />
    </>
  );
}
