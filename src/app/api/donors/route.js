import { donorController } from '@/controllers/donorController';

// GET: List/Search donors
export async function GET(request) {
  return donorController.getDonors(request);
}

// POST: Register a new donor
export async function POST(request) {
  return donorController.registerDonor(request);
}

