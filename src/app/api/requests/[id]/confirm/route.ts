import { NextRequest } from 'next/server';
import { confirmDonation } from '@/controllers/requestController';

// PATCH /api/requests/[id]/confirm
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { donorId } = body;
  return confirmDonation(id, donorId);
}
