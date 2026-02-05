import { NextResponse } from "next/server";
import { getLeaderboard } from "@/lib/db";
import { seedDatabase } from "@/lib/seed";

let seeded = false;
function ensureSeeded() {
  if (!seeded) {
    seedDatabase();
    seeded = true;
  }
}

export async function GET() {
  ensureSeeded();

  const leaderboard = getLeaderboard(20);

  return NextResponse.json({ agents: leaderboard });
}
