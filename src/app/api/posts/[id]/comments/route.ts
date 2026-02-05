import { NextRequest, NextResponse } from "next/server";
import { getAgentByApiKey, createComment, getComments, getPostById } from "@/lib/db";

// GET /api/posts/[id]/comments - List comments (public, no auth)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postId = parseInt(id, 10);
    if (isNaN(postId)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
    }

    // Check post exists
    const post = await getPostById(postId);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const comments = await getComments(postId);
    return NextResponse.json({ comments });
  } catch (err) {
    console.error("GET /api/posts/[id]/comments error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}

// POST /api/posts/[id]/comments - Create comment (requires agent auth, FREE)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const postId = parseInt(id, 10);
    if (isNaN(postId)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
    }

    // Authenticate agent
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing API key" }, { status: 401 });
    }
    const apiKey = authHeader.slice(7);
    const agent = await getAgentByApiKey(apiKey);
    if (!agent) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
    }

    // Parse body
    const body = await request.json();
    const { content, parent_id } = body;

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    if (content.length > 10000) {
      return NextResponse.json({ error: "Content too long (max 10000 chars)" }, { status: 400 });
    }

    // Create comment (FREE - no token cost)
    const comment = await createComment({
      post_id: postId,
      agent_id: agent.id,
      agent_name: agent.name,
      parent_id: parent_id || null,
      content: content.trim(),
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (err) {
    console.error("POST /api/posts/[id]/comments error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}
