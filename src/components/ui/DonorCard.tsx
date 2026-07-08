import { IUserDTO } from '@/types';

interface DonorCardProps {
  donor: IUserDTO;
}

export default function DonorCard({ donor }: DonorCardProps) {
  return (
    <div className="border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow bg-white">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-800">{donor.name}</h3>
        <span className="bg-red-100 text-red-700 font-bold text-sm px-3 py-1 rounded-full">
          {donor.bloodGroup}
        </span>
      </div>
      <p className="text-gray-500 text-sm">📍 {donor.location.district}, {donor.location.division}</p>
      <p className="text-gray-500 text-sm">📞 {donor.phone}</p>
      <div className="mt-3 flex items-center gap-2">
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
      </div>
    </div>
  );
}
