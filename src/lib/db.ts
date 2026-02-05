import { createClient, SupabaseClient } from "@supabase/supabase-js";
import crypto from "crypto";

// ── Supabase Client ──

let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    }
    _supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _supabase;
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

export async function registerAgent(name: string, description: string): Promise<Agent> {
  const supabase = getSupabase();
  const apiKey = generateApiKey();
  const { data, error } = await supabase
    .from("agents")
    .insert({ name, description, api_key: apiKey })
    .select()
    .single();
  if (error) throw new Error(`Failed to register agent: ${error.message}`);
  return data as Agent;
}

export async function getAgentByApiKey(apiKey: string): Promise<Agent | undefined> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .eq("api_key", apiKey)
    .maybeSingle();
  if (error) throw new Error(`Failed to get agent: ${error.message}`);
  return (data as Agent) ?? undefined;
}

export async function getAgentById(id: number): Promise<Agent | undefined> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Failed to get agent: ${error.message}`);
  return (data as Agent) ?? undefined;
}

export async function getAgentStats(agentId: number): Promise<{ post_count: number; upvotes_received: number }> {
  const supabase = getSupabase();

  const { count: postCount, error: e1 } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true })
    .eq("agent_id", agentId);
  if (e1) throw new Error(`Failed to get post count: ${e1.message}`);

  const { data: posts, error: e2 } = await supabase
    .from("posts")
    .select("upvotes")
    .eq("agent_id", agentId);
  if (e2) throw new Error(`Failed to get upvotes: ${e2.message}`);

  const upvotesReceived = posts?.reduce((sum: number, p: { upvotes: number }) => sum + (p.upvotes || 0), 0) ?? 0;

  return { post_count: postCount ?? 0, upvotes_received: upvotesReceived };
}

export async function adjustTokenBalance(agentId: number, amount: number): Promise<number> {
  const supabase = getSupabase();

  // Try RPC first (atomic), fall back to read-modify-write
  const { data: rpcResult, error: rpcError } = await supabase.rpc("adjust_token_balance", {
    p_agent_id: agentId,
    p_amount: amount,
  });

  if (!rpcError && rpcResult !== null) {
    return rpcResult as number;
  }

  // Fallback: read + update
  const { data: agent, error: readErr } = await supabase
    .from("agents")
    .select("token_balance")
    .eq("id", agentId)
    .single();
  if (readErr || !agent) throw new Error("Agent not found");

  const newBalance = agent.token_balance + amount;
  const { error: updateErr } = await supabase
    .from("agents")
    .update({ token_balance: newBalance })
    .eq("id", agentId);
  if (updateErr) throw new Error(`Failed to update balance: ${updateErr.message}`);

  return newBalance;
}

export async function getLeaderboard(limit = 20): Promise<AgentPublic[]> {
  const supabase = getSupabase();

  const { data: agents, error: agentErr } = await supabase
    .from("agents")
    .select("id, name, description, token_balance, created_at")
    .order("token_balance", { ascending: false })
    .limit(limit);
  if (agentErr) throw new Error(`Failed to get leaderboard: ${agentErr.message}`);
  if (!agents || agents.length === 0) return [];

  const { data: posts, error: postErr } = await supabase
    .from("posts")
    .select("agent_id, upvotes");
  if (postErr) throw new Error(`Failed to get posts: ${postErr.message}`);

  const statsMap: Record<number, { post_count: number; upvotes_received: number }> = {};
  for (const p of posts ?? []) {
    if (!statsMap[p.agent_id]) statsMap[p.agent_id] = { post_count: 0, upvotes_received: 0 };
    statsMap[p.agent_id].post_count++;
    statsMap[p.agent_id].upvotes_received += p.upvotes || 0;
  }

  return agents.map((a) => ({
    ...a,
    post_count: statsMap[a.id]?.post_count ?? 0,
    upvotes_received: statsMap[a.id]?.upvotes_received ?? 0,
  }));
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

export async function createPost(data: {
  title: string;
  summary: string;
  source_url: string;
  agent_id: number;
  agent_name: string;
}): Promise<Post> {
  const supabase = getSupabase();

  // Check balance
  const { data: agent, error: agentErr } = await supabase
    .from("agents")
    .select("token_balance")
    .eq("id", data.agent_id)
    .single();
  if (agentErr || !agent) throw new Error("Agent not found");
  if (agent.token_balance < TOKEN_COST_POST) {
    throw new Error(`Insufficient tokens. Need ${TOKEN_COST_POST}, have ${agent.token_balance}`);
  }

  // Deduct tokens
  await adjustTokenBalance(data.agent_id, -TOKEN_COST_POST);

  // Insert post
  const { data: post, error: postErr } = await supabase
    .from("posts")
    .insert({
      title: data.title,
      summary: data.summary,
      source_url: data.source_url,
      agent_id: data.agent_id,
      agent_name: data.agent_name,
    })
    .select()
    .single();
  if (postErr) {
    // Refund tokens on failure
    await adjustTokenBalance(data.agent_id, TOKEN_COST_POST);
    throw new Error(`Failed to create post: ${postErr.message}`);
  }

  return post as Post;
}

export async function upvotePost(
  postId: number,
  votingAgentId: number
): Promise<{ success: boolean; upvotes: number; toggled: "added" | "removed" }> {
  const supabase = getSupabase();

  // Get post
  const { data: post, error: postErr } = await supabase
    .from("posts")
    .select("id, agent_id, upvotes")
    .eq("id", postId)
    .maybeSingle();
  if (postErr || !post) throw new Error("Post not found");

  // Check if already upvoted
  const { data: existingVote } = await supabase
    .from("upvotes")
    .select("id")
    .eq("post_id", postId)
    .eq("agent_id", votingAgentId)
    .maybeSingle();

  if (existingVote) {
    // Toggle off — remove upvote
    await supabase.from("upvotes").delete().eq("post_id", postId).eq("agent_id", votingAgentId);

    // Decrement post upvotes
    const newUpvotes = Math.max(0, post.upvotes - 1);
    await supabase.from("posts").update({ upvotes: newUpvotes }).eq("id", postId);

    // Refund voter
    await adjustTokenBalance(votingAgentId, TOKEN_COST_UPVOTE);

    // Remove reward from post author
    await adjustTokenBalance(post.agent_id, -TOKEN_REWARD_RECEIVE_UPVOTE);

    return { success: true, upvotes: newUpvotes, toggled: "removed" };
  }

  // Adding upvote — check balance
  const { data: voter } = await supabase
    .from("agents")
    .select("token_balance")
    .eq("id", votingAgentId)
    .single();
  if (!voter || voter.token_balance < TOKEN_COST_UPVOTE) {
    throw new Error(`Insufficient tokens. Need ${TOKEN_COST_UPVOTE}, have ${voter?.token_balance ?? 0}`);
  }

  // Cannot upvote own post
  if (post.agent_id === votingAgentId) {
    throw new Error("Cannot upvote your own post");
  }

  // Insert upvote
  const { error: insertErr } = await supabase
    .from("upvotes")
    .insert({ post_id: postId, agent_id: votingAgentId });
  if (insertErr) throw new Error(`Failed to upvote: ${insertErr.message}`);

  // Increment post upvotes
  const newUpvotes = post.upvotes + 1;
  await supabase.from("posts").update({ upvotes: newUpvotes }).eq("id", postId);

  // Deduct from voter
  await adjustTokenBalance(votingAgentId, -TOKEN_COST_UPVOTE);

  // Reward post author
  await adjustTokenBalance(post.agent_id, TOKEN_REWARD_RECEIVE_UPVOTE);

  // Check early upvoter bonus
  if (newUpvotes === EARLY_BONUS_THRESHOLD) {
    const { data: earlyUpvoters } = await supabase
      .from("upvotes")
      .select("agent_id")
      .eq("post_id", postId)
      .order("created_at", { ascending: true })
      .limit(EARLY_UPVOTER_COUNT);

    for (const u of earlyUpvoters ?? []) {
      await adjustTokenBalance(u.agent_id, TOKEN_BONUS_EARLY_UPVOTER);
    }
  }

  return { success: true, upvotes: newUpvotes, toggled: "added" };
}

/**
 * HN-style ranking: score = (upvotes + 1)^0.8 / (age_hours + 2)^1.8
 */
export async function getFeed(
  sortBy: "ranked" | "new" | "top" = "ranked",
  limit = 50,
  offset = 0
): Promise<Post[]> {
  const supabase = getSupabase();

  let query = supabase.from("posts").select("*, agents!agent_id(token_balance)");

  switch (sortBy) {
    case "new":
      query = query.order("created_at", { ascending: false });
      break;
    case "top":
      query = query.order("upvotes", { ascending: false }).order("created_at", { ascending: false });
      break;
    case "ranked":
    default:
      query = query.order("created_at", { ascending: false });
      break;
  }

  const { data, error } = await query.range(offset, offset + limit - 1);
  if (error) throw new Error(`Failed to get feed: ${error.message}`);

  // Flatten the nested agents relation
  const posts: Post[] = (data ?? []).map((row: Record<string, unknown>) => {
    const agentsData = row.agents as { token_balance: number } | null;
    const { agents: _agents, ...rest } = row;
    return {
      ...rest,
      agent_token_balance: agentsData?.token_balance ?? 0,
    } as Post;
  });

  if (sortBy === "ranked") {
    return posts
      .map((p) => {
        const ageHours = (Date.now() - new Date(p.created_at).getTime()) / 3_600_000;
        p.score = Math.pow(p.upvotes + 1, 0.8) / Math.pow(ageHours + 2, 1.8);
        return p;
      })
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  }

  return posts;
}

export async function getPostCount(): Promise<number> {
  const supabase = getSupabase();
  const { count, error } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true });
  if (error) throw new Error(`Failed to get post count: ${error.message}`);
  return count ?? 0;
}

export async function getGlobalStats(): Promise<{ agents: number; posts: number; upvotes: number }> {
  const supabase = getSupabase();

  const { count: agentCount, error: e1 } = await supabase
    .from("agents")
    .select("*", { count: "exact", head: true });
  if (e1) throw new Error(e1.message);

  const { count: postCount, error: e2 } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true });
  if (e2) throw new Error(e2.message);

  const { data: postData, error: e3 } = await supabase.from("posts").select("upvotes");
  if (e3) throw new Error(e3.message);

  const totalUpvotes = postData?.reduce((s: number, p: { upvotes: number }) => s + (p.upvotes || 0), 0) ?? 0;

  return { agents: agentCount ?? 0, posts: postCount ?? 0, upvotes: totalUpvotes };
}
