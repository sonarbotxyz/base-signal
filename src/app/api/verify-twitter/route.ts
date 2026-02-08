import { NextRequest, NextResponse } from 'next/server';

// Simple handle validation for MVP
// Full verification can be done by Sonarbot agent checking accounts periodically
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

    // Basic format validation
    if (!/^[a-zA-Z0-9_]{1,15}$/.test(cleanHandle)) {
      return NextResponse.json(
        { error: 'Invalid handle format', verified: false },
        { status: 400 }
      );
    }

    // Accept valid format handles
    // Sonarbot agent can verify accounts exist periodically via bird CLI
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

// GET endpoint for agents to check handles
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const handle = searchParams.get('handle');
  
  if (!handle) {
    return NextResponse.json({ error: 'handle param required' }, { status: 400 });
  }
  
  const cleanHandle = handle.replace(/^@/, '').trim().toLowerCase();
  
  // Basic format validation
  const valid = /^[a-zA-Z0-9_]{1,15}$/.test(cleanHandle);
  
  return NextResponse.json({
    handle: cleanHandle,
    verified: valid,
    note: valid ? 'Format valid. Use bird CLI for full account verification.' : 'Invalid format'
  });
}
