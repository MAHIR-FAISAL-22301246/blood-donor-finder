import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBloodRequest extends Document {
  requester: mongoose.Types.ObjectId;
  patientName: string;
  bloodGroup: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  unitsNeeded: number;
  hospital: string;
  location: {
    division: string;
    district: string;
    area: string;
  };
  requiredDate: Date;
  status: 'open' | 'fulfilled' | 'cancelled';
  contactPhone: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BloodRequestSchema: Schema<IBloodRequest> = new Schema(
  {
    requester: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    patientName: { type: String, required: true, trim: true },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: true,
    },
    unitsNeeded: { type: Number, required: true, min: 1 },
    hospital: { type: String, required: true },
    location: {
      division: { type: String, required: true },
      district: { type: String, required: true },
      area: { type: String, default: '' },
    },
    requiredDate: { type: Date, required: true },
    status: { type: String, enum: ['open', 'fulfilled', 'cancelled'], default: 'open' },
    contactPhone: { type: String, required: true },
    description: { type: String },
  },
  { timestamps: true }
);

const BloodRequest: Model<IBloodRequest> =
  mongoose.models.BloodRequest ||
  mongoose.model<IBloodRequest>('BloodRequest', BloodRequestSchema);

export default BloodRequest;
