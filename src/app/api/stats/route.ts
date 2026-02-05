import { NextResponse } from "next/server";
import { getGlobalStats } from "@/lib/db";
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

  const stats = await getGlobalStats();

  return NextResponse.json(stats);
}
