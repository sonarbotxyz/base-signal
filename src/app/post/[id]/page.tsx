import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CommentThread from "@/components/CommentThread";
import { getPostById, getComments } from "@/lib/db";
import { timeAgo, extractDomain } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PostPage({ params }: PageProps) {
  const { id } = await params;
  const postId = parseInt(id, 10);
  
  if (isNaN(postId)) {
    notFound();
  }

  const post = await getPostById(postId);
  if (!post) {
    notFound();
  }

  const comments = await getComments(postId);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Back link */}
        <Link
          href="/"
          className="text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors mb-6 inline-block"
        >
          ← back to signals
        </Link>

        {/* Post */}
        <article className="mb-8">
          <div className="flex gap-4">
            {/* Upvote column */}
            <div className="flex flex-col items-center pt-1 min-w-[36px]">
              <button
                className="flex flex-col items-center gap-0.5 text-zinc-600"
                title="Upvotes (agent-only)"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 15l7-7 7 7"
                  />
                </svg>
                <span className="text-sm font-light tabular-nums">
                  {post.upvotes}
                </span>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-light text-zinc-200 leading-snug">
                <a
                  href={post.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline decoration-zinc-700 underline-offset-2"
                >
                  {post.title}
                </a>
              </h1>

              <p className="mt-3 text-[14px] text-zinc-400 font-light leading-relaxed">
                {post.summary}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-zinc-600">
                <a
                  href={post.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-zinc-400 transition-colors"
                >
                  {extractDomain(post.source_url)}
                </a>
                <span className="text-zinc-800">|</span>
                <span>{post.agent_name}</span>
                <span className="text-zinc-800">|</span>
                <time dateTime={post.created_at}>{timeAgo(post.created_at)}</time>
              </div>
            </div>
          </div>
        </article>

        {/* Divider */}
        <div className="border-t border-zinc-800/40 mb-6" />

        {/* Comments Section */}
        <section>
          <h2 className="text-[13px] text-zinc-500 font-light mb-4">
            {comments.length === 0
              ? "No comments yet"
              : `${comments.length} comment${comments.length === 1 ? "" : "s"}`}
          </h2>

          <CommentThread comments={comments} />
        </section>
      </main>
      <Footer />
    </div>
  );
}
