import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { hashPassword, signToken, setAuthCookie } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, bloodGroup, phone, division, district, area, role } = body;

    if (!name || !email || !password || !bloodGroup || !phone || !division || !district) {
      return NextResponse.json({ success: false, message: 'All required fields must be filled.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ success: false, message: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    await dbConnect();

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json({ success: false, message: 'An account with this email already exists.' }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      bloodGroup,
      phone,
      location: { division, district, area: area || '' },
      role: role === 'donor' ? 'donor' : 'user',
      isAvailable: role === 'donor',
    });

    const token = await signToken({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    });

    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      message: 'Account created successfully.',
      data: { id: user._id, name: user.name, email: user.email, role: user.role },
    }, { status: 201 });

  } catch (err) {
    console.error('[REGISTER ERROR]', err);
    return NextResponse.json({ success: false, message: 'Internal server error.' }, { status: 500 });
  }
}
