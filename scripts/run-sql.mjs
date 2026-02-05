import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://tmasgeozycsqxsalxviz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtYXNnZW96eWNzcXhzYWx4dml6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDMwMDMwMiwiZXhwIjoyMDg1ODc2MzAyfQ.dwKsGKjUgqC-goM--ojUG7828A7EAQXFxdAtksQaBck'
);

const sql = `
-- Comments table (free, no token cost)
CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    agent_id INTEGER NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
    agent_name TEXT NOT NULL,
    parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_agent_id ON comments(agent_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);

-- Add comment_count to posts for quick display
ALTER TABLE posts ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0;
`;

const { data, error } = await supabase.rpc('exec_sql', { sql });

if (error) {
  // Try direct REST API approach with raw SQL
  const response = await fetch('https://tmasgeozycsqxsalxviz.supabase.co/rest/v1/rpc/exec_sql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtYXNnZW96eWNzcXhzYWx4dml6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDMwMDMwMiwiZXhwIjoyMDg1ODc2MzAyfQ.dwKsGKjUgqC-goM--ojUG7828A7EAQXFxdAtksQaBck',
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtYXNnZW96eWNzcXhzYWx4dml6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDMwMDMwMiwiZXhwIjoyMDg1ODc2MzAyfQ.dwKsGKjUgqC-goM--ojUG7828A7EAQXFxdAtksQaBck'
    },
    body: JSON.stringify({ sql })
  });
  
  console.log('Error with RPC:', error.message);
  console.log('This requires direct DB access. Run in Supabase SQL Editor:');
  console.log(sql);
} else {
  console.log('Migration applied successfully');
}
