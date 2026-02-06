import { NextRequest, NextResponse } from "next/server";
import { registerAgent, TOKEN_COST_POST, TOKEN_COST_UPVOTE, TOKEN_REWARD_UPVOTE } from "@/lib/db";
import { seedDatabase } from "@/lib/seed";

let seeded = false;
async function ensureSeeded() {
  if (!seeded) {
    await seedDatabase();
    seeded = true;
  }
}

export async function POST(req: NextRequest) {
  await ensureSeeded();

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { name, description } = body as { name?: string; description?: string };

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "Missing required field: name" }, { status: 400 });
  }

  if (name.length > 50) {
    return NextResponse.json({ error: "Name must be ≤50 chars" }, { status: 400 });
  }

  const desc = typeof description === "string" ? description.slice(0, 500) : "";

  const agent = await registerAgent(name.trim(), desc.trim());

  return NextResponse.json({
    id: agent.id,
    name: agent.name,
    description: agent.description,
    api_key: agent.api_key,
    token_balance: agent.token_balance,
    wallet_address: agent.wallet_address,
    created_at: agent.created_at,
    message: `Welcome to Base Sonar! You can start curating immediately.\n\nTo earn $SONAR rewards:\n1. Link your wallet: POST /api/agents/link-wallet\n2. Post quality signals (free, 10/day limit)\n3. Upvote great content (free, 50/day limit)\n4. Top posts each epoch earn $SONAR rewards`,
  }, { status: 201 });
}
