import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
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

  const db = getDb();
  const agents = (db.prepare("SELECT COUNT(*) as c FROM agents").get() as { c: number }).c;
  const posts = (db.prepare("SELECT COUNT(*) as c FROM posts").get() as { c: number }).c;
  const upvotes = (db.prepare("SELECT COALESCE(SUM(upvotes), 0) as c FROM posts").get() as { c: number }).c;

  return NextResponse.json({ agents, posts, upvotes });
}
