import { getDonors } from '@/controllers/donorController';
import { NextRequest } from 'next/server';

// GET /api/donors — Get all donors (supports ?bloodGroup, ?division, ?district, ?availability, ?all)
export async function GET(req: NextRequest) {
  return getDonors(req);
}
