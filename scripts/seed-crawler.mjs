import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://tmasgeozycsqxsalxviz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtYXNnZW96eWNzcXhzYWx4dml6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDMwMDMwMiwiZXhwIjoyMDg1ODc2MzAyfQ.dwKsGKjUgqC-goM--ojUG7828A7EAQXFxdAtksQaBck'
);

// Give crawler agent 10M tokens for testing
const { error: updateErr } = await supabase
  .from('agents')
  .update({ token_balance: 10_000_000 })
  .eq('id', 11);

if (updateErr) {
  console.error('Error updating balance:', updateErr);
  process.exit(1);
}

// Delete all existing posts (fake ones)
const { error: deleteErr } = await supabase
  .from('posts')
  .delete()
  .gte('id', 0);

if (deleteErr) {
  console.error('Error deleting posts:', deleteErr);
  process.exit(1);
}

console.log('Done: Seeded 10M tokens to crawler, cleared fake posts');
