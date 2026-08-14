import { NextRequest, NextResponse } from 'next/server';
import SelectedDonor from '@/models/SelectedDonor';
import User from '@/models/User';
import dbConnect from '@/lib/db';
import type { ISelectedDonorDTO } from '@/types';

export const dynamic = 'force-dynamic';

function toSelectedDonorDTO(record: any): ISelectedDonorDTO {
  const donor = record.donorId as any;
  return {
    _id: record._id.toString(),
    donorId: donor._id.toString(),
    donor: {
      _id: donor._id.toString(),
      name: donor.name,
      email: donor.email,
      role: donor.role,
      bloodGroup: donor.bloodGroup,
      phone: donor.phone,
      location: donor.location,
      isAvailable: donor.isAvailable,
      isVerified: donor.isVerified,
      lastDonationDate: donor.lastDonationDate?.toString(),
      createdAt: donor.createdAt?.toString(),
    },
    selectedAt: record.selectedAt?.toString() || new Date().toISOString(),
    selectedBy: record.selectedBy,
  };
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const records = await SelectedDonor.find()
      .sort({ selectedAt: -1 })
      .limit(limit)
      .populate('donorId', 'name email role bloodGroup phone location isAvailable isVerified lastDonationDate createdAt');

    const data: ISelectedDonorDTO[] = records.map(toSelectedDonorDTO);

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/selected-donors:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch selected donors', error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { donorId, selectedBy } = body;

    if (!donorId) {
      return NextResponse.json(
        { success: false, message: 'donorId is required' },
        { status: 400 }
      );
    }

    const donor = await User.findById(donorId);
    if (!donor) {
      return NextResponse.json(
        { success: false, message: 'Donor not found' },
        { status: 404 }
      );
    }

    const record = await SelectedDonor.create({ donorId, selectedBy });
    const populated = await SelectedDonor.findById(record._id).populate(
      'donorId',
      'name email role bloodGroup phone location isAvailable isVerified lastDonationDate createdAt'
    );

    return NextResponse.json(
      { success: true, data: toSelectedDonorDTO(populated!) },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/selected-donors:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save selected donor', error: String(error) },
      { status: 500 }
    );
  }
}
