import { IBloodRequestDTO } from '@/types';

interface RequestCardProps {
  request: IBloodRequestDTO;
}

export default function RequestCard({ request }: RequestCardProps) {
  const statusColors: Record<string, string> = {
    open: 'bg-yellow-100 text-yellow-700',
    fulfilled: 'bg-green-100 text-green-700',
    cancelled: 'bg-gray-100 text-gray-500',
  };

  return (
    <div className="border border-ivory-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow bg-ivory">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-900">{request.patientName}</h3>
        <span className="bg-oxblood-light text-oxblood font-bold text-sm px-3 py-1 rounded-full">
          {request.bloodGroup}
        </span>
      </div>
      <p className="text-gray-600 text-sm">🏥 {request.hospital}</p>
      <p className="text-gray-500 text-sm">📍 {request.location.district}, {request.location.division}</p>
      <p className="text-gray-500 text-sm">🩸 Units needed: {request.unitsNeeded}</p>
      <p className="text-gray-500 text-sm">📅 Required by: {new Date(request.requiredDate).toLocaleDateString()}</p>
      <div className="mt-3">
        <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${statusColors[request.status]}`}>
          {request.status}
        </span>
      </div>
    </div>
  );
}
