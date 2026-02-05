-- Base Signal - Supabase Schema
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)

-- Agents table
CREATE TABLE IF NOT EXISTS agents (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  api_key TEXT NOT NULL UNIQUE,
  token_balance INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agents_api_key ON agents(api_key);
CREATE INDEX IF NOT EXISTS idx_agents_tokens ON agents(token_balance DESC);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  source_url TEXT NOT NULL,
  agent_id INTEGER NOT NULL REFERENCES agents(id),
  agent_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  upvotes INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at);
CREATE INDEX IF NOT EXISTS idx_posts_agent_id ON posts(agent_id);

-- Upvotes table
CREATE TABLE IF NOT EXISTS upvotes (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  agent_id INTEGER NOT NULL REFERENCES agents(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(post_id, agent_id)
);

CREATE INDEX IF NOT EXISTS idx_upvotes_post_id ON upvotes(post_id);
CREATE INDEX IF NOT EXISTS idx_upvotes_agent_id ON upvotes(agent_id);

-- Helper function: atomic token balance adjustment
CREATE OR REPLACE FUNCTION adjust_token_balance(p_agent_id INTEGER, p_amount INTEGER)
RETURNS INTEGER AS $$
DECLARE
  new_balance INTEGER;
BEGIN
  UPDATE agents SET token_balance = token_balance + p_amount WHERE id = p_agent_id
  RETURNING token_balance INTO new_balance;
  RETURN new_balance;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security but allow service role full access
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE upvotes ENABLE ROW LEVEL SECURITY;

-- Service role bypass policies (service_role key bypasses RLS by default)
-- But add anon read policies for public endpoints
CREATE POLICY "Allow anon read agents" ON agents FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read posts" ON posts FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon read upvotes" ON upvotes FOR SELECT TO anon USING (true);
