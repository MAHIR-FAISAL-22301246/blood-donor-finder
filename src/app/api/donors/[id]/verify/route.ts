import { NextRequest } from 'next/server';
import { verifyDonor } from '@/controllers/donorController';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return verifyDonor(id);
}
