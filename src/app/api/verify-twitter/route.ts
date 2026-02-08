import { NextRequest, NextResponse } from 'next/server';

// Simplified verification - just accept the handle
// Real verification would be done by Sonarbot agent checking the account
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { handle } = body;

    if (!handle) {
      return NextResponse.json(
        { error: 'X handle is required', verified: false },
        { status: 400 }
      );
    }

    // Clean the handle
    const cleanHandle = handle.replace(/^@/, '').trim().toLowerCase();

    // Basic validation
    if (!/^[a-zA-Z0-9_]{1,15}$/.test(cleanHandle)) {
      return NextResponse.json(
        { error: 'Invalid X handle format', verified: false },
        { status: 400 }
      );
    }

    // For now, we trust the user's handle
    // Sonarbot can verify accounts asynchronously if needed
    return NextResponse.json({
      verified: true,
      handle: cleanHandle,
      message: 'Handle accepted'
    });
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: 'Verification failed', verified: false },
      { status: 500 }
    );
  }
}
