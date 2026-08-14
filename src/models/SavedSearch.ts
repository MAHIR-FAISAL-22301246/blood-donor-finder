import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISavedSearch extends Document {
  bloodGroup?: string;
  division?: string;
  district?: string;
  availability?: string;
  sortBy?: string;
  searchedAt: Date;
}

const SavedSearchSchema: Schema<ISavedSearch> = new Schema(
  {
    bloodGroup: { type: String },
    division: { type: String },
    district: { type: String },
    availability: { type: String },
    sortBy: { type: String },
    searchedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const SavedSearch: Model<ISavedSearch> =
  mongoose.models.SavedSearch ||
  mongoose.model<ISavedSearch>('SavedSearch', SavedSearchSchema);

export default SavedSearch;
