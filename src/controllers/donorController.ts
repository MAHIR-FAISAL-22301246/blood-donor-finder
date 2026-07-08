import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/User';
import dbConnect from '@/lib/db';

// GET /api/donors — Get all available donors (optionally filter by blood group/location)
export async function getDonors(req: NextRequest) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const bloodGroup = searchParams.get('bloodGroup');
  const district = searchParams.get('district');
  const division = searchParams.get('division');

  const query: Record<string, unknown> = { role: 'donor', isAvailable: true };
  if (bloodGroup) query.bloodGroup = bloodGroup;
  if (district) query['location.district'] = district;
  if (division) query['location.division'] = division;

  try {
    const donors = await User.find(query).select('-password');
    return NextResponse.json({ success: true, data: donors }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch donors', error },
      { status: 500 }
    );
  }
}

// GET /api/donors/:id — Get a single donor by ID
export async function getDonorById(id: string) {
  await dbConnect();
  try {
    const donor = await User.findById(id).select('-password');
    if (!donor) {
      return NextResponse.json({ success: false, message: 'Donor not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: donor }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Error fetching donor', error },
      { status: 500 }
    );
  }
}

// PATCH /api/donors/:id/verify — Admin verifies a donor
export async function verifyDonor(id: string) {
  await dbConnect();
  try {
    const donor = await User.findByIdAndUpdate(
      id,
      { isVerified: true },
      { new: true }
    ).select('-password');
    if (!donor) {
      return NextResponse.json({ success: false, message: 'Donor not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: donor }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Verification failed', error },
      { status: 500 }
    );
  }
}

// PATCH /api/donors/:id/availability — Toggle donor availability
export async function toggleAvailability(id: string, isAvailable: boolean) {
  await dbConnect();
  try {
    const donor = await User.findByIdAndUpdate(
      id,
      { isAvailable },
      { new: true }
    ).select('-password');
    return NextResponse.json({ success: true, data: donor }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Update failed', error },
      { status: 500 }
    );
  }
}
