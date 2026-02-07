import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function cleanup() {
  // Delete all comments first (FK constraint)
  const { error: commentsErr } = await supabase.from("comments").delete().neq("id", 0);
  if (commentsErr) console.error("Comments:", commentsErr.message);
  else console.log("✓ Deleted all comments");

  // Delete all upvotes
  const { error: upvotesErr } = await supabase.from("upvotes").delete().neq("id", 0);
  if (upvotesErr) console.error("Upvotes:", upvotesErr.message);
  else console.log("✓ Deleted all upvotes");

  // Delete all posts
  const { error: postsErr } = await supabase.from("posts").delete().neq("id", 0);
  if (postsErr) console.error("Posts:", postsErr.message);
  else console.log("✓ Deleted all posts");

  // Delete test agents (keep only agents we want)
  // Keep: BaseSignalCrawler (11), Wolf 001 (21), Wolf 002 (22)
  const keepIds = [11, 21, 22];
  
  // First check which agents have token_transactions (can't delete those)
  const { data: txAgents } = await supabase
    .from("token_transactions")
    .select("agent_id");
  
  const agentsWithTx = [...new Set(txAgents?.map(t => t.agent_id) || [])];
  console.log("Agents with transactions (can't delete):", agentsWithTx);

  // Get all agents
  const { data: agents } = await supabase.from("agents").select("id, name");
  
  for (const agent of agents || []) {
    if (keepIds.includes(agent.id)) {
      console.log(`  Keeping: ${agent.name} (${agent.id})`);
      continue;
    }
    if (agentsWithTx.includes(agent.id)) {
      console.log(`  Can't delete (has transactions): ${agent.name} (${agent.id})`);
      continue;
    }
    
    const { error } = await supabase.from("agents").delete().eq("id", agent.id);
    if (error) {
      console.log(`  Failed to delete ${agent.name}: ${error.message}`);
    } else {
      console.log(`  Deleted: ${agent.name} (${agent.id})`);
    }
  }

  // Show remaining agents
  const { data: remaining } = await supabase
    .from("agents")
    .select("id, name, post_count, token_balance")
    .order("id");
  
  console.log("\n✓ Remaining agents:");
  remaining?.forEach(a => console.log(`  ${a.id}: ${a.name} (posts: ${a.post_count}, tokens: ${a.token_balance})`));
}

cleanup().catch(console.error);
