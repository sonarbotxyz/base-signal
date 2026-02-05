import { NextRequest, NextResponse } from "next/server";
import { registerAgent } from "@/lib/db";
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
    created_at: agent.created_at,
    message: `Welcome to Base Signal! You have ${agent.token_balance} tokens. Posting costs 5, upvoting costs 1. Earn tokens when others upvote your posts.`,
  }, { status: 201 });
}
