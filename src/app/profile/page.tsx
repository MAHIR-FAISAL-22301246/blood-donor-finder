"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';
import { User, MapPin, Droplet, Phone, Mail, Shield, Clock, ToggleLeft, ToggleRight, Edit2, Check, X } from 'lucide-react';

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

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    bloodGroup: '',
    division: '',
    district: '',
    area: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/auth/profile');
        const data = await res.json();
        if (data.success) {
          setProfile(data.data);
          setEditForm({
            name: data.data.name,
            phone: data.data.phone,
            bloodGroup: data.data.bloodGroup,
            division: data.data.location.division,
            district: data.data.location.district,
            area: data.data.location.area || ''
          });
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

  const handleSaveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name,
          phone: editForm.phone,
          bloodGroup: editForm.bloodGroup,
          location: {
            division: editForm.division,
            district: editForm.district,
            area: editForm.area,
          }
        }),
      });
      const data = await res.json();
      if (data.success) {
        setProfile(data.data);
        setIsEditing(false);
        toast.success('Profile updated successfully');
      } else {
        toast.error(data.message || 'Failed to update profile');
      }
    } catch {
      toast.error('Network error while saving');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (profile) {
      setEditForm({
        name: profile.name,
        phone: profile.phone,
        bloodGroup: profile.bloodGroup,
        division: profile.location.division,
        district: profile.location.district,
        area: profile.location.area || ''
      });
    }
    setIsEditing(false);
  };

  if (!user) {
    return (
      <main className="flex-grow container mx-auto px-4 pt-24 pb-16 text-center">
        <h1 className="text-2xl font-bold text-gray-700">Please log in to view your profile.</h1>
      </main>
    );
  }

  return (
      <main className="flex-grow container mx-auto px-4 pt-8 pb-16 max-w-3xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <User className="text-red-500" size={32} />
            My Profile
          </h1>
          {profile && (
            isEditing ? (
              <div className="flex gap-2">
                <button
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 transition"
                >
                  <X size={18} /> Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm bg-red-600 hover:bg-red-700 text-white transition disabled:opacity-50"
                >
                  <Check size={18} /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 transition"
              >
                <Edit2 size={18} /> Edit Profile
              </button>
            )
          )}
        </div>

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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <User size={18} className="text-gray-400 mt-1" />
                  <div className="w-full">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Name</p>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={editForm.name} 
                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                        className="w-full border border-gray-300 rounded px-3 py-1 focus:outline-none focus:border-red-500 text-gray-800"
                      />
                    ) : (
                      <p className="text-gray-800 font-semibold">{profile.name}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail size={18} className="text-gray-400 mt-1" />
                  <div className="w-full">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Email</p>
                    <p className="text-gray-500 font-semibold cursor-not-allowed" title="Email cannot be changed">{profile.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone size={18} className="text-gray-400 mt-1" />
                  <div className="w-full">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Phone</p>
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={editForm.phone} 
                        onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                        className="w-full border border-gray-300 rounded px-3 py-1 focus:outline-none focus:border-red-500 text-gray-800"
                      />
                    ) : (
                      <p className="text-gray-800 font-semibold">{profile.phone}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Droplet size={18} className="text-red-400 mt-1" />
                  <div className="w-full">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Blood Group</p>
                    {isEditing ? (
                      <select
                        value={editForm.bloodGroup}
                        onChange={(e) => setEditForm({...editForm, bloodGroup: e.target.value})}
                        className="w-full border border-gray-300 rounded px-3 py-1 focus:outline-none focus:border-red-500 text-gray-800 bg-white"
                      >
                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-red-600 font-bold text-lg">{profile.bloodGroup}</p>
                    )}
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Division</p>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={editForm.division} 
                      onChange={(e) => setEditForm({...editForm, division: e.target.value})}
                      className="w-full border border-gray-300 rounded px-3 py-1 focus:outline-none focus:border-red-500 text-gray-800"
                    />
                  ) : (
                    <p className="text-gray-800 font-semibold">{profile.location.division}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">District</p>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={editForm.district} 
                      onChange={(e) => setEditForm({...editForm, district: e.target.value})}
                      className="w-full border border-gray-300 rounded px-3 py-1 focus:outline-none focus:border-red-500 text-gray-800"
                    />
                  ) : (
                    <p className="text-gray-800 font-semibold">{profile.location.district}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Area</p>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={editForm.area} 
                      onChange={(e) => setEditForm({...editForm, area: e.target.value})}
                      className="w-full border border-gray-300 rounded px-3 py-1 focus:outline-none focus:border-red-500 text-gray-800"
                      placeholder="Optional"
                    />
                  ) : (
                    <p className="text-gray-800 font-semibold">{profile.location.area || 'N/A'}</p>
                  )}
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
                      disabled={toggling || isEditing} // Disable during edit mode
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
  );
}
