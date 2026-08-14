import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISelectedDonor extends Document {
  donorId: mongoose.Types.ObjectId;
  selectedAt: Date;
  selectedBy?: string;
}

const SelectedDonorSchema: Schema<ISelectedDonor> = new Schema(
  {
    donorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    selectedAt: { type: Date, default: Date.now },
    selectedBy: { type: String },
  },
  { timestamps: true }
);

const SelectedDonor: Model<ISelectedDonor> =
  mongoose.models.SelectedDonor ||
  mongoose.model<ISelectedDonor>('SelectedDonor', SelectedDonorSchema);

export default SelectedDonor;
