import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/db';
import { generateApiKey } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { twitter_handle } = body;

    if (!twitter_handle || typeof twitter_handle !== 'string') {
      return NextResponse.json(
        { error: 'twitter_handle is required' },
        { status: 400 }
      );
    }

    const handle = twitter_handle.replace('@', '').trim().toLowerCase();
    if (!handle) {
      return NextResponse.json(
        { error: 'Invalid twitter_handle' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // Check if already registered
    const { data: existing } = await supabase
      .from('api_keys')
      .select('api_key, revoked')
      .eq('twitter_handle', handle)
      .single();

    if (existing && !existing.revoked) {
      return NextResponse.json({
        twitter_handle: handle,
        api_key: existing.api_key,
        message: 'Already registered. Here is your existing API key.'
      });
    }

    // Generate new key
    const api_key = generateApiKey();

    const { error } = await supabase
      .from('api_keys')
      .upsert({
        twitter_handle: handle,
        api_key,
        revoked: false
      }, { onConflict: 'twitter_handle' });

    if (error) {
      return NextResponse.json(
        { error: 'Registration failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      twitter_handle: handle,
      api_key,
      message: 'Registered! Use this key in Authorization: Bearer <key> header for all write operations.'
    });
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
