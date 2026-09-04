import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { getSessionFromCookies } from '@/lib/auth';
import { decrypt } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Not authenticated.' }, { status: 401 });
  }

  await dbConnect();
  const user = await User.findById(session.id).select('-password');
  if (!user) {
    return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 });
  }

  // Decrypt phone number before returning to the client
  const userObj = user.toObject();
  if (userObj.phone) {
    userObj.phone = decrypt(userObj.phone);
  }

  return NextResponse.json({ success: true, data: userObj });
}
