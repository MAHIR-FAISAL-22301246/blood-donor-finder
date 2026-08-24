import { NextRequest, NextResponse } from 'next/server';
import SavedSearch from '@/models/SavedSearch';
import User from '@/models/User';
import dbConnect from '@/lib/db';
import type { SearchAnalytics, BloodGroup } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30', 10);

    const since = new Date();
    since.setDate(since.getDate() - days);

    const searches = await SavedSearch.find({ searchedAt: { $gte: since } });

    const totalSearches = searches.length;

    const bloodGroupCounts = new Map<string, number>();
    const locationCounts = new Map<string, number>();
    const dateCounts = new Map<string, number>();
    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as BloodGroup[];

    for (const s of searches) {
      const bg = s.bloodGroup;
      const loc = [s.division, s.district].filter(Boolean).join(', ');
      const dateKey = s.searchedAt ? new Date(s.searchedAt).toISOString().split('T')[0] : '';

      if (bg) {
        bloodGroupCounts.set(bg, (bloodGroupCounts.get(bg) || 0) + 1);
      }
      if (loc) {
        locationCounts.set(loc, (locationCounts.get(loc) || 0) + 1);
      }
      if (dateKey) {
        dateCounts.set(dateKey, (dateCounts.get(dateKey) || 0) + 1);
      }
    }

    const mostSearchedBloodGroup = [...bloodGroupCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
    const mostSearchedLocation = [...locationCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];

    const searchFrequency = Array.from(dateCounts.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const donorCounts = await User.aggregate([
      {
        $group: {
          _id: '$bloodGroup',
          available: {
            $sum: { $cond: [{ $eq: ['$isAvailable', true] }, 1, 0] },
          },
          total: { $sum: 1 },
        },
      },
    ]);

    const donorMap = new Map<string, { available: number; total: number }>();
    for (const d of donorCounts) {
      donorMap.set(d._id, { available: d.available, total: d.total });
    }

    const maxSearches = Math.max(...bloodGroupCounts.values(), 1);

    const bloodGroupDemand = bloodGroups.map((bg) => {
      const searchCount = bloodGroupCounts.get(bg) || 0;
      const counts = donorMap.get(bg) || { available: 0, total: 0 };
      const ratio = counts.available / Math.max(searchCount, 1);
      const shortageLevel: 'high' | 'medium' | 'low' = ratio < 0.5 ? 'high' : ratio < 1.5 ? 'medium' : 'low';

      return {
        bloodGroup: bg,
        searchCount,
        availableDonors: counts.available,
        totalDonors: counts.total,
        shortageLevel,
      };
    });

    const analytics: SearchAnalytics = {
      totalSearches,
      mostSearchedBloodGroup,
      mostSearchedLocation,
      searchFrequency,
      bloodGroupDemand,
    };

    return NextResponse.json({ success: true, data: analytics }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/search-analytics:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch analytics', error: String(error) },
      { status: 500 }
    );
  }
}
