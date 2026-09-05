import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { getSessionFromCookies } from '@/lib/auth';
import { decrypt, encrypt } from '@/lib/security';

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

export async function PATCH(req: Request) {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ success: false, message: 'Not authenticated.' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, phone, bloodGroup, location } = body;

    const updates: any = {};
    if (name) updates.name = name;
    if (bloodGroup) updates.bloodGroup = bloodGroup;
    if (location) updates.location = location;
    
    // If phone is updated, encrypt it
    if (phone) {
      updates.phone = encrypt(phone);
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ success: false, message: 'No valid fields provided for update.' }, { status: 400 });
    }

    await dbConnect();
    
    const updatedUser = await User.findByIdAndUpdate(
      session.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return NextResponse.json({ success: false, message: 'User not found.' }, { status: 404 });
    }

    const userObj = updatedUser.toObject();
    if (userObj.phone) {
      userObj.phone = decrypt(userObj.phone);
    }

    return NextResponse.json({ success: true, message: 'Profile updated successfully', data: userObj });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ success: false, message: 'Failed to update profile' }, { status: 500 });
  }
}
