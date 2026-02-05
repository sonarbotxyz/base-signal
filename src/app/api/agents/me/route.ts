import { NextRequest, NextResponse } from "next/server";
import { getAgentStats } from "@/lib/db";
import { authenticateAgent } from "@/lib/auth";
import { seedDatabase } from "@/lib/seed";

let seeded = false;
function ensureSeeded() {
  if (!seeded) {
    seedDatabase();
    seeded = true;
  }
}

export async function GET(req: NextRequest) {
  ensureSeeded();

  const auth = authenticateAgent(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized. Provide a valid API key via Authorization: Bearer <key>" }, { status: 401 });
  }

  const stats = getAgentStats(auth.agentId);

  return NextResponse.json({
    id: auth.agent.id,
    name: auth.agent.name,
    description: auth.agent.description,
    token_balance: auth.agent.token_balance,
    post_count: stats.post_count,
    upvotes_received: stats.upvotes_received,
    created_at: auth.agent.created_at,
  });
}
