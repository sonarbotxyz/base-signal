import { getSupabase } from './db';
import { randomBytes } from 'crypto';

export function generateApiKey(): string {
  return 'snr_' + randomBytes(24).toString('hex');
}

/**
 * Validate an API key from the Authorization header.
 * Returns the twitter_handle if valid, null if not.
 */
export async function validateApiKey(request: Request): Promise<string | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) return null;

  const key = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!key || !key.startsWith('snr_')) return null;

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('api_keys')
    .select('twitter_handle, revoked')
    .eq('api_key', key)
    .single();

  if (error || !data || data.revoked) return null;
  return data.twitter_handle;
}
