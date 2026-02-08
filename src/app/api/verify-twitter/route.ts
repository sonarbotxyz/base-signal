import { NextRequest, NextResponse } from 'next/server';

// Verify X handle exists by checking the profile page
// This is a simple check that works without API keys
async function checkXAccountExists(handle: string): Promise<boolean> {
  try {
    // Try to fetch the X profile page
    const res = await fetch(`https://x.com/${handle}`, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Sonarbot/1.0)'
      }
    });
    
    // 200 = account exists, 404 = doesn't exist
    return res.status === 200;
  } catch {
    // If fetch fails, try alternative method
    try {
      const res = await fetch(`https://twitter.com/${handle}`, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Sonarbot/1.0)'
        }
      });
      return res.status === 200;
    } catch {
      return false;
    }
  }
}

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

    // Check if account exists
    const exists = await checkXAccountExists(cleanHandle);
    
    if (!exists) {
      return NextResponse.json(
        { error: 'X account not found', verified: false },
        { status: 404 }
      );
    }

    return NextResponse.json({
      verified: true,
      handle: cleanHandle,
      message: 'Account verified'
    });
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: 'Verification failed', verified: false },
      { status: 500 }
    );
  }
}

// GET endpoint for agents to verify handles
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const handle = searchParams.get('handle');
  
  if (!handle) {
    return NextResponse.json({ error: 'handle param required' }, { status: 400 });
  }
  
  const cleanHandle = handle.replace(/^@/, '').trim().toLowerCase();
  const exists = await checkXAccountExists(cleanHandle);
  
  return NextResponse.json({
    handle: cleanHandle,
    verified: exists
  });
}
