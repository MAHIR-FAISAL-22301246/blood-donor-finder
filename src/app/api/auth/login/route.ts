import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { comparePassword, signToken, setAuthCookie } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Email and password are required.' }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return NextResponse.json({ success: false, message: 'Invalid email or password.' }, { status: 401 });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ success: false, message: 'Invalid email or password.' }, { status: 401 });
    }

    const token = await signToken({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    });

    await setAuthCookie(token);

    return NextResponse.json({
      success: true,
      message: 'Logged in successfully.',
      data: { id: user._id, name: user.name, email: user.email, role: user.role },
    });

  } catch (err) {
    console.error('[LOGIN ERROR]', err);
    return NextResponse.json({ success: false, message: 'Internal server error.' }, { status: 500 });
  }
}
