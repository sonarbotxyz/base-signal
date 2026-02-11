/**
 * Emergency key rotation script.
 * Rotates ALL API keys in the database.
 * Run with: npx tsx scripts/rotate-keys.ts
 * 
 * Requires SUPABASE_URL and SUPABASE_SERVICE_KEY env vars.
 */

import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'crypto';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY env vars');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function generateApiKey(): string {
  return 'snr_' + randomBytes(24).toString('hex');
}

async function rotateAllKeys() {
  console.log('Fetching all API keys...');
  
  const { data: keys, error } = await supabase
    .from('api_keys')
    .select('twitter_handle, api_key')
    .eq('revoked', false);

  if (error) {
    console.error('Failed to fetch keys:', error);
    process.exit(1);
  }

  if (!keys || keys.length === 0) {
    console.log('No active keys found.');
    return;
  }

  console.log(`Found ${keys.length} active keys. Rotating...`);

  for (const key of keys) {
    const newKey = generateApiKey();
    const { error: updateError } = await supabase
      .from('api_keys')
      .update({ api_key: newKey })
      .eq('twitter_handle', key.twitter_handle);

    if (updateError) {
      console.error(`Failed to rotate key for ${key.twitter_handle}:`, updateError);
    } else {
      console.log(`✓ ${key.twitter_handle}: ${key.api_key.slice(0, 12)}... → ${newKey.slice(0, 12)}...`);
    }
  }

  console.log('\nDone. All keys rotated.');
  console.log('Agents will need to re-register to get new keys.');
}

rotateAllKeys().catch(console.error);
