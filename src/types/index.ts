// Shared TypeScript types for the Blood Donor Finder app

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type UserRole = 'donor' | 'admin' | 'user';

export type RequestStatus = 'open' | 'fulfilled' | 'cancelled';

export interface Location {
  division: string;
  district: string;
  area?: string;
}

export interface IUserDTO {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  bloodGroup: BloodGroup;
  phone: string;
  location: Location;
  isAvailable: boolean;
  isVerified: boolean;
  lastDonationDate?: string;
  createdAt: string;
}

export interface IBloodRequestDTO {
  _id: string;
  requester: IUserDTO | string;
  patientName: string;
  bloodGroup: BloodGroup;
  unitsNeeded: number;
  hospital: string;
  location: Location;
  requiredDate: string;
  status: RequestStatus;
  contactPhone: string;
  description?: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: unknown;
}
