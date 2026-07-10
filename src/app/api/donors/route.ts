import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/User';
import dbConnect from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const bloodGroup = searchParams.get('bloodGroup');

    const query: Record<string, unknown> = { role: 'donor', isAvailable: true };

    if (bloodGroup) {
      query.bloodGroup = bloodGroup;
    }

    const donors = await User.find(query).select('-password');
    return NextResponse.json({ success: true, data: donors }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/donors:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch donors', error: String(error) },
      { status: 500 }
    );
  }
}
