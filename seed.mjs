import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: String, email: String, password: String, role: String,
  bloodGroup: String, phone: String, location: Object,
  isAvailable: Boolean, isVerified: Boolean
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  await User.create({
    name: "Mahir Faisal",
    email: "mahir@example.com",
    password: "hashedpassword123",
    role: "donor",
    bloodGroup: "A+",
    phone: "+8801711223344",
    location: { division: "Dhaka", district: "Banani", area: "Block C" },
    isAvailable: true,
    isVerified: false
  });
  console.log("Mock donor inserted.");
  process.exit(0);
}
seed();
