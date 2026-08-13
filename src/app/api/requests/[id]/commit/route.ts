import { NextRequest } from 'next/server';
import { commitToRequest } from '@/controllers/requestController';

// PATCH /api/requests/[id]/commit
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { donorId } = body;
  return commitToRequest(id, donorId);
}
