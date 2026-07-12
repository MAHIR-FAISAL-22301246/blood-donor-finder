import { NextResponse } from 'next/server';
import { donorRepository } from '@/lib/donorRepository';

// GET: List/Search donors
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // Build filter object based on query parameters
    const filter = {};

    const bloodGroup = searchParams.get('bloodGroup');
    if (bloodGroup) {
      filter.bloodGroup = bloodGroup;
    }

    const division = searchParams.get('division');
    if (division) {
      filter.division = division;
    }

    const district = searchParams.get('district');
    if (district) {
      filter.district = district;
    }

    const upazilaOrArea = searchParams.get('upazilaOrArea');
    if (upazilaOrArea) {
      filter.upazilaOrArea = upazilaOrArea;
    }

    const status = searchParams.get('status');
    if (status) {
      filter.status = status;
    }

    const donors = await donorRepository.find(filter);

    return NextResponse.json({ success: true, count: donors.length, data: donors }, { status: 200 });
  } catch (error) {
    console.error('Error fetching donors:', error);
    return NextResponse.json({ success: false, error: 'Server Error: ' + error.message }, { status: 500 });
  }
}

// POST: Register a new donor
export async function POST(request) {
  try {
    const body = await request.json();

    // Standard input sanitization/trimming
    const sanitizedData = {
      name: body.name ? body.name.trim() : '',
      phone: body.phone ? body.phone.trim() : '',
      bloodGroup: body.bloodGroup ? body.bloodGroup.trim() : '',
      division: body.division ? body.division.trim() : '',
      district: body.district ? body.district.trim() : '',
      upazilaOrArea: body.upazilaOrArea ? body.upazilaOrArea.trim() : '',
      status: body.status ? body.status.trim() : 'Available',
    };

    try {
      const newDonor = await donorRepository.create(sanitizedData);
      return NextResponse.json({ success: true, data: newDonor }, { status: 201 });
    } catch (validationError) {
      if (validationError.errors) {
        const messages = Object.values(validationError.errors).map((err) => err.message);
        return NextResponse.json({ success: false, errors: messages }, { status: 400 });
      }
      throw validationError;
    }
  } catch (error) {
    console.error('Error registering donor:', error);
    if (error.code === 11000) {
      return NextResponse.json({ success: false, errors: ['A donor with this ID or phone number already exists.'] }, { status: 400 });
    }
    return NextResponse.json({ success: false, errors: ['Server Error: ' + error.message] }, { status: 500 });
  }
}
