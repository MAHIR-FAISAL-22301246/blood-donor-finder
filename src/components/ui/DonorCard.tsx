import { useState } from 'react';
import { IUserDTO } from '@/types';
import { CheckCircle, MapPin, Phone, User as UserIcon, Droplets } from 'lucide-react';

interface DonorCardProps {
  donor: IUserDTO;
  onVerify?: (id: string) => Promise<void>;
}

export default function DonorCard({ donor, onVerify }: DonorCardProps) {
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerifyClick = async () => {
    if (!onVerify) return;
    setIsVerifying(true);
    await onVerify(donor._id);
    setIsVerifying(false);
  };

  return (
    <div className="group border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 bg-white flex flex-col h-full transform hover:-translate-y-1">
      <div className="flex-grow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500">
              <UserIcon size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">{donor.name}</h3>
              <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                <MapPin size={14} />
                <span>{donor.location.district}, {donor.location.division}</span>
              </div>
            </div>
          </div>
          <span className="flex items-center gap-1 bg-red-100 text-red-600 font-bold text-sm px-3 py-1.5 rounded-full shadow-sm">
            <Droplets size={14} className="fill-current" />
            {donor.bloodGroup}
          </span>
        </div>

        <div className="space-y-3 mt-6">
          <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
            <Phone size={16} className="text-gray-400" />
            <span className="text-sm font-medium">{donor.phone}</span>
          </div>
          
          <div className="flex items-center gap-2 pt-2">
            <span
              className={`text-xs px-3 py-1.5 rounded-full font-semibold border ${
                donor.isAvailable
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-gray-50 text-gray-500 border-gray-200'
              }`}
            >
              <span className="flex items-center gap-1">
                <div className={`w-1.5 h-1.5 rounded-full ${donor.isAvailable ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                {donor.isAvailable ? 'Available Now' : 'Unavailable'}
              </span>
            </span>
            {donor.isVerified ? (
              <span className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                <CheckCircle size={14} className="text-blue-600" />
                Verified
              </span>
            ) : (
              <span className="text-xs px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 font-semibold border border-amber-200">
                Unverified
              </span>
            )}
          </div>
        </div>
      </div>
      
      {!donor.isVerified && onVerify && (
        <div className="mt-6 pt-4 border-t border-gray-100">
          <button
            onClick={handleVerifyClick}
            disabled={isVerifying}
            className="w-full relative flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-2.5 px-4 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isVerifying ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </>
            ) : (
              <>
                <CheckCircle size={18} />
                Verify Donor
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
