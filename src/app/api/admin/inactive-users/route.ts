import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { getSessionFromCookies } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Inactive = donor who hasn't donated in 6+ months AND is marked unavailable
// OR a user who registered but never donated and account is >6 months old

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  // Find users who are:
  // 1. Role is 'donor' or 'user'
  // 2. isAvailable is false AND
  // 3. Either no lastDonationDate or lastDonationDate older than 6 months
  // 4. Account created more than 6 months ago
  const inactiveUsers = await User.find({
    role: { $in: ['donor', 'user'] },
    isAvailable: false,
    $or: [
      { lastDonationDate: { $lt: sixMonthsAgo } },
      { lastDonationDate: { $exists: false } },
    ],
    createdAt: { $lt: sixMonthsAgo },
  }).select('-password');

  return NextResponse.json({ success: true, data: inactiveUsers, count: inactiveUsers.length });
}

export async function DELETE(req: NextRequest) {
  const session = await getSessionFromCookies();
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  const body = await req.json();
  const { userIds } = body as { userIds: string[] };

  if (!userIds || userIds.length === 0) {
    return NextResponse.json({ success: false, message: 'No user IDs provided' }, { status: 400 });
  }

  const result = await User.deleteMany({ _id: { $in: userIds }, role: { $ne: 'admin' } });

  return NextResponse.json({
    success: true,
    message: `${result.deletedCount} inactive account(s) removed successfully.`,
    deletedCount: result.deletedCount,
  });
}
