import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: String, email: String, password: String, role: String,
  bloodGroup: String, phone: String, location: Object,
  isAvailable: Boolean, isVerified: Boolean
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const newDonors = [
    {
      name: "Tariqul Islam",
      email: "tariqul@example.com",
      password: "hashedpassword123",
      role: "donor",
      bloodGroup: "B+",
      phone: "+8801811223344",
      location: { division: "Rajshahi", district: "Rajshahi", area: "Motihar" },
      isAvailable: true,
      isVerified: false
    },
    {
      name: "Nusrat Jahan",
      email: "nusrat@example.com",
      password: "hashedpassword123",
      role: "donor",
      bloodGroup: "AB+",
      phone: "+8801911223344",
      location: { division: "Sylhet", district: "Sylhet", area: "Zindabazar" },
      isAvailable: true,
      isVerified: false
    },
    {
      name: "Kamrul Hasan",
      email: "kamrul@example.com",
      password: "hashedpassword123",
      role: "donor",
      bloodGroup: "O+",
      phone: "+8801511223344",
      location: { division: "Khulna", district: "Khulna", area: "Daulatpur" },
      isAvailable: true,
      isVerified: false
    }
  ];

  await User.insertMany(newDonors);
  console.log(`Inserted ${newDonors.length} mock donors.`);
  process.exit(0);
}
seed();
