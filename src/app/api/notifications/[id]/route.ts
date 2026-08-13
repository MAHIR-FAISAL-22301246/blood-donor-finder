import { NextRequest } from 'next/server';
import { markNotificationAsRead } from '@/controllers/notificationController';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return markNotificationAsRead(id);
}
