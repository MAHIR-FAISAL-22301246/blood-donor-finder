import mongoose from 'mongoose';

const DonorSchema = new mongoose.Schema(
  {
    donorId: {
      type: String,
      unique: true,
      required: true,
      default: function () {
        // Automatically generate a unique donor ID (e.g., D-123456) on instantiation
        const randomNum = Math.floor(100000 + Math.random() * 900000);
        return `D-${randomNum}`;
      },
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      validate: {
        validator: function (v) {
          // Simple validation for Bangladeshi phone numbers: 01xxxxxxxxx, +8801xxxxxxxxx, or 8801xxxxxxxxx
          return /^(?:\+8801|8801|01)[3-9]\d{8}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },
    bloodGroup: {
      type: String,
      required: [true, 'Blood group is required'],
      enum: {
        values: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        message: '{VALUE} is not a valid blood group. Use A+, A-, B+, B-, AB+, AB-, O+, or O-.',
      },
    },
    division: {
      type: String,
      required: [true, 'Division is required'],
      trim: true,
    },
    district: {
      type: String,
      required: [true, 'District is required'],
      trim: true,
    },
    upazilaOrArea: {
      type: String,
      required: [true, 'Upazila or Area is required'],
      trim: true,
    },
    status: {
      type: String,
      required: [true, 'Availability status is required'],
      enum: {
        values: ['Available', 'Unavailable'],
        message: '{VALUE} is not a valid status. Use Available or Unavailable.',
      },
      default: 'Available',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Donor || mongoose.model('Donor', DonorSchema);
