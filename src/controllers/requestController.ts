import { NextRequest, NextResponse } from 'next/server';
import BloodRequest from '@/models/BloodRequest';
import dbConnect from '@/lib/db';

// GET /api/requests — Get all blood requests
export async function getBloodRequests(req: NextRequest) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const bloodGroup = searchParams.get('bloodGroup');
  const status = searchParams.get('status') || 'open';
  const district = searchParams.get('district');

  const query: Record<string, unknown> = { status };
  if (bloodGroup) query.bloodGroup = bloodGroup;
  if (district) query['location.district'] = district;

  try {
    const requests = await BloodRequest.find(query)
      .populate('requester', 'name email phone')
      .sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: requests }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch requests', error },
      { status: 500 }
    );
  }
}

// POST /api/requests — Create a new blood request
export async function createBloodRequest(req: NextRequest) {
  await dbConnect();
  try {
    const body = await req.json();
    const request = await BloodRequest.create(body);
    return NextResponse.json({ success: true, data: request }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to create request', error },
      { status: 400 }
    );
  }
}

// PATCH /api/requests/:id — Update request status
export async function updateRequestStatus(
  id: string,
  status: 'open' | 'fulfilled' | 'cancelled'
) {
  await dbConnect();
  try {
    const request = await BloodRequest.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!request) {
      return NextResponse.json({ success: false, message: 'Request not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: request }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Update failed', error },
      { status: 500 }
    );
  }
}
