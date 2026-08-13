import { NextRequest } from 'next/server';
import { getUserNotifications } from '@/controllers/notificationController';

export async function GET(req: NextRequest) {
  return getUserNotifications(req);
}
