import { NextRequest } from 'next/server';
import { getBloodRequests, createBloodRequest } from '@/controllers/requestController';

// GET /api/requests — Fetch blood requests (supports ?status=all|open|fulfilled|cancelled)
export async function GET(req: NextRequest) {
  return getBloodRequests(req);
}

// POST /api/requests — Submit a new blood request
export async function POST(req: NextRequest) {
  return createBloodRequest(req);
}
