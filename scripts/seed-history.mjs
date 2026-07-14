import { config } from 'dotenv';
import mongoose from 'mongoose';

config({ path: new URL('../.env.local', import.meta.url) });

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('MONGODB_URI not found in .env.local');
  process.exit(1);
}

await mongoose.connect(uri);
console.log('Connected to MongoDB');

const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

const donors = await User.find({ role: 'donor' });
console.log(`Found ${donors.length} donors`);

const hospitals = [
  'Dhaka Medical College Hospital',
  'Square Hospital',
  'Apollo Hospitals Dhaka',
  'Chittagong Medical College Hospital',
  'Khulna Medical College Hospital',
  'Rajshahi Medical College Hospital',
  'Sylhet MAG Osmani Medical College',
  'United Hospital',
];

const now = Date.now();
let updated = 0;

for (const donor of donors) {
  if (donor.donationHistory && donor.donationHistory.length > 0) continue;

  const count = 1 + Math.floor(Math.random() * 4);
  const history = [];
  for (let i = 0; i < count; i++) {
    const daysAgo = Math.floor(Math.random() * 540);
    const date = new Date(now - daysAgo * 86400000);
    history.push({
      date,
      hospital: hospitals[Math.floor(Math.random() * hospitals.length)],
      division: donor.location.division,
      district: donor.location.district,
      area: donor.location.area || '',
    });
  }
  history.sort((a, b) => a.date - b.date);

  await User.updateOne(
    { _id: donor._id },
    {
      $set: {
        donationHistory: history,
        lastDonationDate: history[history.length - 1].date,
      },
    }
  );
  updated++;
}

console.log(`Seeded donation history for ${updated} donors`);
await mongoose.disconnect();
