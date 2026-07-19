import { NextRequest } from 'next/server';
import { updateRequestStatus } from '@/controllers/requestController';
import { RequestStatus } from '@/types';

// PATCH /api/requests/[id] — Admin updates request status
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { status } = body as { status: RequestStatus };
  return updateRequestStatus(id, status);
}
