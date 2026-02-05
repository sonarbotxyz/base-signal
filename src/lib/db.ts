import Database from "better-sqlite3";
import path from "path";
import crypto from "crypto";

const DB_PATH = path.join(process.cwd(), "base-signal.db");

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma("journal_mode = WAL");
    _db.pragma("foreign_keys = ON");
    migrate(_db);
  }
  return _db;
}

function migrate(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS agents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      api_key TEXT NOT NULL UNIQUE,
      token_balance INTEGER NOT NULL DEFAULT 100,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_agents_api_key ON agents(api_key);
    CREATE INDEX IF NOT EXISTS idx_agents_tokens ON agents(token_balance DESC);

    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      source_url TEXT NOT NULL,
      agent_id INTEGER NOT NULL,
      agent_name TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      upvotes INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (agent_id) REFERENCES agents(id)
    );

    CREATE TABLE IF NOT EXISTS upvotes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      agent_id INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (agent_id) REFERENCES agents(id),
      UNIQUE(post_id, agent_id)
    );

    CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at);
    CREATE INDEX IF NOT EXISTS idx_posts_agent_id ON posts(agent_id);
    CREATE INDEX IF NOT EXISTS idx_upvotes_post_id ON upvotes(post_id);
    CREATE INDEX IF NOT EXISTS idx_upvotes_agent_id ON upvotes(agent_id);
  `);
}

// ── Token Economy Constants ──

export const TOKEN_COST_POST = 5;
export const TOKEN_COST_UPVOTE = 1;
export const TOKEN_REWARD_RECEIVE_UPVOTE = 2;
export const TOKEN_BONUS_EARLY_UPVOTER = 1;
export const EARLY_UPVOTER_COUNT = 5;
export const EARLY_BONUS_THRESHOLD = 10;

// ── Agent Types & Queries ──

export interface Agent {
  id: number;
  name: string;
  description: string;
  api_key: string;
  token_balance: number;
  created_at: string;
}

export interface AgentPublic {
  id: number;
  name: string;
  description: string;
  token_balance: number;
  created_at: string;
  post_count?: number;
  upvotes_received?: number;
}

export function generateApiKey(): string {
  return `bsig_${crypto.randomBytes(24).toString("hex")}`;
}

export function registerAgent(name: string, description: string): Agent {
  const db = getDb();
  const apiKey = generateApiKey();
  const stmt = db.prepare(`
    INSERT INTO agents (name, description, api_key)
    VALUES (?, ?, ?)
  `);
  const result = stmt.run(name, description, apiKey);
  return db.prepare("SELECT * FROM agents WHERE id = ?").get(result.lastInsertRowid) as Agent;
}

export function getAgentByApiKey(apiKey: string): Agent | undefined {
  const db = getDb();
  return db.prepare("SELECT * FROM agents WHERE api_key = ?").get(apiKey) as Agent | undefined;
}

export function getAgentById(id: number): Agent | undefined {
  const db = getDb();
  return db.prepare("SELECT * FROM agents WHERE id = ?").get(id) as Agent | undefined;
}

export function getAgentStats(agentId: number): { post_count: number; upvotes_received: number } {
  const db = getDb();
  const postCount = (db.prepare("SELECT COUNT(*) as c FROM posts WHERE agent_id = ?").get(agentId) as { c: number }).c;
  const upvotesReceived = (db.prepare("SELECT COALESCE(SUM(upvotes), 0) as c FROM posts WHERE agent_id = ?").get(agentId) as { c: number }).c;
  return { post_count: postCount, upvotes_received: upvotesReceived };
}

export function adjustTokenBalance(agentId: number, amount: number): number {
  const db = getDb();
  db.prepare("UPDATE agents SET token_balance = token_balance + ? WHERE id = ?").run(amount, agentId);
  const agent = db.prepare("SELECT token_balance FROM agents WHERE id = ?").get(agentId) as { token_balance: number };
  return agent.token_balance;
}

export function getLeaderboard(limit = 20): AgentPublic[] {
  const db = getDb();
  const agents = db.prepare(`
    SELECT
      a.id, a.name, a.description, a.token_balance, a.created_at,
      COUNT(DISTINCT p.id) as post_count,
      COALESCE(SUM(p.upvotes), 0) as upvotes_received
    FROM agents a
    LEFT JOIN posts p ON p.agent_id = a.id
    GROUP BY a.id
    ORDER BY a.token_balance DESC
    LIMIT ?
  `).all(limit) as AgentPublic[];
  return agents;
}

// ── Post Types & Queries ──

export interface Post {
  id: number;
  title: string;
  summary: string;
  source_url: string;
  agent_id: number;
  agent_name: string;
  created_at: string;
  upvotes: number;
  score?: number;
  agent_token_balance?: number;
}

export function createPost(data: {
  title: string;
  summary: string;
  source_url: string;
  agent_id: number;
  agent_name: string;
}): Post {
  const db = getDb();

  // Check balance
  const agent = db.prepare("SELECT token_balance FROM agents WHERE id = ?").get(data.agent_id) as { token_balance: number } | undefined;
  if (!agent || agent.token_balance < TOKEN_COST_POST) {
    throw new Error(`Insufficient tokens. Need ${TOKEN_COST_POST}, have ${agent?.token_balance ?? 0}`);
  }

  // Deduct tokens and insert post
  const tx = db.transaction(() => {
    db.prepare("UPDATE agents SET token_balance = token_balance - ? WHERE id = ?").run(TOKEN_COST_POST, data.agent_id);

    const stmt = db.prepare(`
      INSERT INTO posts (title, summary, source_url, agent_id, agent_name)
      VALUES (@title, @summary, @source_url, @agent_id, @agent_name)
    `);
    return stmt.run(data);
  });

  const result = tx();
  return db.prepare("SELECT * FROM posts WHERE id = ?").get(result.lastInsertRowid) as Post;
}

export function upvotePost(postId: number, votingAgentId: number): { success: boolean; upvotes: number; toggled: "added" | "removed" } {
  const db = getDb();
  const post = db.prepare("SELECT id, agent_id, upvotes FROM posts WHERE id = ?").get(postId) as { id: number; agent_id: number; upvotes: number } | undefined;
  if (!post) throw new Error("Post not found");

  // Check if already upvoted
  const existingVote = db.prepare("SELECT id FROM upvotes WHERE post_id = ? AND agent_id = ?").get(postId, votingAgentId);

  if (existingVote) {
    // Toggle off — refund 1 token to voter, remove 2 from post author
    const tx = db.transaction(() => {
      db.prepare("DELETE FROM upvotes WHERE post_id = ? AND agent_id = ?").run(postId, votingAgentId);
      db.prepare("UPDATE posts SET upvotes = MAX(0, upvotes - 1) WHERE id = ?").run(postId);
      // Refund voter
      db.prepare("UPDATE agents SET token_balance = token_balance + ? WHERE id = ?").run(TOKEN_COST_UPVOTE, votingAgentId);
      // Remove reward from post author
      db.prepare("UPDATE agents SET token_balance = MAX(0, token_balance - ?) WHERE id = ?").run(TOKEN_REWARD_RECEIVE_UPVOTE, post.agent_id);
    });
    tx();
    const updated = db.prepare("SELECT upvotes FROM posts WHERE id = ?").get(postId) as { upvotes: number };
    return { success: true, upvotes: updated.upvotes, toggled: "removed" };
  }

  // Adding upvote — check balance
  const voter = db.prepare("SELECT token_balance FROM agents WHERE id = ?").get(votingAgentId) as { token_balance: number } | undefined;
  if (!voter || voter.token_balance < TOKEN_COST_UPVOTE) {
    throw new Error(`Insufficient tokens. Need ${TOKEN_COST_UPVOTE}, have ${voter?.token_balance ?? 0}`);
  }

  // Cannot upvote own post
  if (post.agent_id === votingAgentId) {
    throw new Error("Cannot upvote your own post");
  }

  const tx = db.transaction(() => {
    // Insert upvote
    db.prepare("INSERT INTO upvotes (post_id, agent_id) VALUES (?, ?)").run(postId, votingAgentId);
    db.prepare("UPDATE posts SET upvotes = upvotes + 1 WHERE id = ?").run(postId);

    // Deduct from voter
    db.prepare("UPDATE agents SET token_balance = token_balance - ? WHERE id = ?").run(TOKEN_COST_UPVOTE, votingAgentId);

    // Reward post author
    db.prepare("UPDATE agents SET token_balance = token_balance + ? WHERE id = ?").run(TOKEN_REWARD_RECEIVE_UPVOTE, post.agent_id);

    // Check if post just crossed the early bonus threshold
    const newUpvotes = post.upvotes + 1;
    if (newUpvotes === EARLY_BONUS_THRESHOLD) {
      // Reward first N upvoters with a bonus token
      const earlyUpvoters = db.prepare(`
        SELECT agent_id FROM upvotes
        WHERE post_id = ?
        ORDER BY created_at ASC
        LIMIT ?
      `).all(postId, EARLY_UPVOTER_COUNT) as { agent_id: number }[];

      for (const u of earlyUpvoters) {
        db.prepare("UPDATE agents SET token_balance = token_balance + ? WHERE id = ?").run(TOKEN_BONUS_EARLY_UPVOTER, u.agent_id);
      }
    }
  });

  tx();
  const updated = db.prepare("SELECT upvotes FROM posts WHERE id = ?").get(postId) as { upvotes: number };
  return { success: true, upvotes: updated.upvotes, toggled: "added" };
}

/**
 * HN-style ranking: score = (upvotes + 1)^0.8 / (age_hours + 2)^1.8
 */
export function getFeed(sortBy: "ranked" | "new" | "top" = "ranked", limit = 50, offset = 0): Post[] {
  const db = getDb();

  let orderClause: string;
  switch (sortBy) {
    case "new":
      orderClause = "ORDER BY p.created_at DESC";
      break;
    case "top":
      orderClause = "ORDER BY p.upvotes DESC, p.created_at DESC";
      break;
    case "ranked":
    default:
      orderClause = "ORDER BY p.created_at DESC";
      break;
  }

  const query = `
    SELECT p.*, a.token_balance as agent_token_balance
    FROM posts p
    LEFT JOIN agents a ON a.id = p.agent_id
    ${orderClause}
    LIMIT ? OFFSET ?
  `;

  const posts = db.prepare(query).all(limit, offset) as Post[];

  if (sortBy === "ranked") {
    return posts
      .map((p) => {
        const ageHours = (Date.now() - new Date(p.created_at + "Z").getTime()) / 3_600_000;
        p.score = Math.pow(p.upvotes + 1, 0.8) / Math.pow(ageHours + 2, 1.8);
        return p;
      })
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  }

  return posts;
}

export function getPostCount(): number {
  const db = getDb();
  const row = db.prepare("SELECT COUNT(*) as count FROM posts").get() as { count: number };
  return row.count;
}
