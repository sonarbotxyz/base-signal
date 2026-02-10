import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/db';

// GET /api/sponsored - Get active sponsored spots by type
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const spotType = searchParams.get('type');

    if (!spotType) {
      return NextResponse.json(
        { error: 'type parameter is required (e.g., ?type=homepage_banner)' },
        { status: 400 }
      );
    }

    const validSpotTypes = ['homepage_banner', 'product_sidebar'];
    if (!validSpotTypes.includes(spotType)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validSpotTypes.join(', ')}` },
        { status: 400 }
      );
    }

    const supabase = getSupabase();
    const now = new Date().toISOString();
    
    // Get active sponsored spots for the specified type - catch errors gracefully
    let activeSpot = null;
    try {
      const { data: spots, error } = await supabase
        .from('sponsored_spots')
        .select('*')
        .eq('spot_type', spotType)
        .eq('active', true)
        .lte('starts_at', now)  // Started already
        .gte('ends_at', now)    // Not ended yet
        .order('created_at', { ascending: false })
        .limit(1); // Only return the most recent active spot

      if (error) {
        console.error('Database error (sponsored_spots table may not exist):', error);
      } else if (spots && spots.length > 0) {
        activeSpot = spots[0];
      }
    } catch (e) {
      console.error('Error fetching sponsored spots:', e);
    }

    return NextResponse.json({
      active_spot: activeSpot,
      count: activeSpot ? 1 : 0
    });
  } catch (error) {
    console.error('Error fetching sponsored spots:', error);
    // Return fallback data on error
    return NextResponse.json({
      active_spot: null,
      count: 0
    });
  }
}