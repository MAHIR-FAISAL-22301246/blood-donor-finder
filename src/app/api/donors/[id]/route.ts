import { NextRequest } from 'next/server';
import { getDonorById } from '@/controllers/donorController';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return getDonorById(id);
}
