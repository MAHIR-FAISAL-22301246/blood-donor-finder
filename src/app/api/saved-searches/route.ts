import { NextRequest, NextResponse } from 'next/server';
import SavedSearch from '@/models/SavedSearch';
import dbConnect from '@/lib/db';
import type { ISavedSearchDTO } from '@/types';

export const dynamic = 'force-dynamic';

function toDTO(record: any): ISavedSearchDTO {
  return {
    _id: record._id.toString(),
    bloodGroup: record.bloodGroup,
    division: record.division,
    district: record.district,
    availability: record.availability,
    sortBy: record.sortBy,
    searchedAt: record.searchedAt?.toString() || new Date().toISOString(),
  };
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const records = await SavedSearch.find()
      .sort({ searchedAt: -1 })
      .limit(limit);

    const data: ISavedSearchDTO[] = records.map(toDTO);

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/saved-searches:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch saved searches', error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { bloodGroup, division, district, availability, sortBy } = body;

    const record = await SavedSearch.create({
      bloodGroup,
      division,
      district,
      availability,
      sortBy,
    });

    return NextResponse.json({ success: true, data: toDTO(record) }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/saved-searches:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save search', error: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Missing id' },
        { status: 400 }
      );
    }

    await SavedSearch.findByIdAndDelete(id);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error in DELETE /api/saved-searches:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete saved search', error: String(error) },
      { status: 500 }
    );
  }
}
