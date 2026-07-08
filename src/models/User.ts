import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'donor' | 'admin' | 'user';
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  phone: string;
  location: {
    division: string;
    district: string;
    area: string;
  };
  isAvailable: boolean;
  lastDonationDate?: Date;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['donor', 'admin', 'user'], default: 'user' },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: true,
    },
    phone: { type: String, required: true },
    location: {
      division: { type: String, required: true },
      district: { type: String, required: true },
      area: { type: String, default: '' },
    },
    isAvailable: { type: Boolean, default: true },
    lastDonationDate: { type: Date },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
