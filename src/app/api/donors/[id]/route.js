import { NextResponse } from 'next/server';
import { donorRepository } from '@/lib/donorRepository';

// GET: Retrieve a single donor's information
export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const donor = await donorRepository.findOne(id);
    if (!donor) {
      return NextResponse.json({ success: false, error: 'Donor not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: donor }, { status: 200 });
  } catch (error) {
    console.error('Error fetching donor:', error);
    return NextResponse.json({ success: false, error: 'Server Error: ' + error.message }, { status: 500 });
  }
}

// PUT: Update a donor's information or status
export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await request.json();

    // Prepare update parameters
    const updateData = {};
    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.phone !== undefined) updateData.phone = body.phone.trim();
    if (body.bloodGroup !== undefined) updateData.bloodGroup = body.bloodGroup.trim();
    if (body.division !== undefined) updateData.division = body.division.trim();
    if (body.district !== undefined) updateData.district = body.district.trim();
    if (body.upazilaOrArea !== undefined) updateData.upazilaOrArea = body.upazilaOrArea.trim();
    if (body.status !== undefined) updateData.status = body.status.trim();

    try {
      const updatedDonor = await donorRepository.update(id, updateData);
      if (!updatedDonor) {
        return NextResponse.json({ success: false, error: 'Donor not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: updatedDonor }, { status: 200 });
    } catch (validationError) {
      if (validationError.errors) {
        const messages = Object.values(validationError.errors).map((err) => err.message);
        return NextResponse.json({ success: false, errors: messages }, { status: 400 });
      }
      throw validationError;
    }
  } catch (error) {
    console.error('Error updating donor:', error);
    return NextResponse.json({ success: false, errors: ['Server Error: ' + error.message] }, { status: 500 });
  }
}

// DELETE: Delete a donor profile
export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const deleted = await donorRepository.delete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Donor not found or already deleted' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Donor profile deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting donor:', error);
    return NextResponse.json({ success: false, error: 'Server Error: ' + error.message }, { status: 500 });
  }
}
