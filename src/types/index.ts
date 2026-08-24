import type { IUser } from '@/models/User';

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type UserRole = 'donor' | 'admin' | 'user';

export type RequestStatus = 'open' | 'fulfilled' | 'cancelled' | 'pending';

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
  committedDonors?: (IUserDTO | string)[];
  confirmedDonors?: (IUserDTO | string)[];
  createdAt: string;
}

export interface INotificationDTO {
  _id: string;
  recipient: string;
  message: string;
  relatedRequest?: string;
  isRead: boolean;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: unknown;
}

export interface CompatibleDonorGroup {
  bloodGroup: BloodGroup;
  donors: IUser[];
  count: number;
}

export interface ISelectedDonorDTO {
  _id: string;
  donorId: string;
  donor: IUserDTO;
  selectedAt: string;
  selectedBy?: string;
}

export interface ISavedSearchDTO {
  _id: string;
  bloodGroup?: string;
  division?: string;
  district?: string;
  availability?: string;
  sortBy?: string;
  searchedAt: string;
}

export interface BloodGroupDemand {
  bloodGroup: BloodGroup;
  searchCount: number;
  availableDonors: number;
  totalDonors: number;
  shortageLevel: 'high' | 'medium' | 'low';
}

export interface SearchAnalytics {
  totalSearches: number;
  mostSearchedBloodGroup?: string;
  mostSearchedLocation?: string;
  searchFrequency: { date: string; count: number }[];
  bloodGroupDemand: BloodGroupDemand[];
}
