import { NextResponse } from "next/server";
import { getLeaderboard } from "@/lib/db";
import { seedDatabase } from "@/lib/seed";

let seeded = false;
async function ensureSeeded() {
  if (!seeded) {
    await seedDatabase();
    seeded = true;
  }
}

export async function GET() {
  await ensureSeeded();

  const leaderboard = await getLeaderboard(20);

  return NextResponse.json({ agents: leaderboard });
}
