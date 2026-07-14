import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/User';
import dbConnect from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const bloodGroup = searchParams.get('bloodGroup');
    const division = searchParams.get('division');
    const district = searchParams.get('district');
    const availability = searchParams.get('availability');

    const query: Record<string, unknown> = { role: 'donor' };

    if (bloodGroup) {
      query.bloodGroup = bloodGroup;
    }
    if (division) {
      query['location.division'] = division;
    }
    if (district) {
      query['location.district'] = district;
    }
    if (availability === 'available') {
      query.isAvailable = true;
    } else if (availability === 'unavailable') {
      query.isAvailable = false;
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
