import { NextRequest, NextResponse } from 'next/server';
import Notification from '@/models/Notification';
import dbConnect from '@/lib/db';

export async function getUserNotifications(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ success: false, message: 'User ID required' }, { status: 400 });
  }

  try {
    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(20);
    return NextResponse.json({ success: true, data: notifications }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to fetch notifications', error }, { status: 500 });
  }
}

export async function markNotificationAsRead(id: string) {
  await dbConnect();
  try {
    const notification = await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { returnDocument: 'after' }
    );
    if (!notification) {
      return NextResponse.json({ success: false, message: 'Notification not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: notification }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to update', error }, { status: 500 });
  }
}
