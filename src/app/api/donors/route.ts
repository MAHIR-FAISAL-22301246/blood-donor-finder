import { NextRequest, NextResponse } from 'next/server';
import User, { IUser } from '@/models/User';
import dbConnect from '@/lib/db';
import type { BloodGroup, CompatibleDonorGroup } from '@/types';

const COMPATIBLE_DONORS: Record<BloodGroup, BloodGroup[]> = {
  'O-': [],
  'O+': ['O-'],
  'A-': ['O-'],
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'B-': ['O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'AB-': ['AB-', 'A-', 'B-', 'O-'],
  'AB+': ['AB+', 'AB-', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-'],
};

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

    let compatibleDonors: CompatibleDonorGroup[] = [];
    const shouldShowCompatibility =
      bloodGroup &&
      (availability !== 'unavailable') &&
      (donors.length === 0 || !donors.some((d) => d.isAvailable));

    if (shouldShowCompatibility) {
      const compatibleGroups = COMPATIBLE_DONORS[bloodGroup as BloodGroup]?.filter(
        (g) => g !== bloodGroup
      ) ?? [];

      if (compatibleGroups.length > 0) {
        const compatibleQuery: Record<string, unknown> = { role: 'donor', isAvailable: true };
        if (division) {
          compatibleQuery['location.division'] = division;
        }
        if (district) {
          compatibleQuery['location.district'] = district;
        }
        compatibleQuery.bloodGroup = { $in: compatibleGroups };

        const compatibleResults = await User.find(compatibleQuery).select('-password');

        const grouped = new Map<BloodGroup, IUser[]>();
        for (const donor of compatibleResults) {
          const group = donor.bloodGroup as BloodGroup;
          if (!grouped.has(group)) {
            grouped.set(group, []);
          }
          grouped.get(group)!.push(donor);
        }

        compatibleDonors = Array.from(grouped.entries())
          .map(([group, donors]) => ({
            bloodGroup: group,
            donors,
            count: donors.length,
          }))
          .sort((a, b) => b.count - a.count);
      }
    }

    return NextResponse.json(
      { success: true, data: donors, compatibleDonors },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/donors:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch donors', error: String(error) },
      { status: 500 }
    );
  }
}
