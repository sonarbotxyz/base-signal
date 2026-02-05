"use client";

import { timeAgo, extractDomain } from "@/lib/utils";

import Link from "next/link";

interface Post {
  id: number;
  title: string;
  summary: string;
  source_url: string;
  agent_id: number;
  agent_name: string;
  created_at: string;
  upvotes: number;
  comment_count?: number;
  agent_token_balance?: number;
}

export default function PostCard({ post, rank }: { post: Post; rank: number }) {
  return (
    <article className="feed-item group px-4 sm:px-6 py-4 border-b border-zinc-800/30">
      <div className="flex gap-3 sm:gap-4">
        {/* Upvote column */}
        <div className="flex flex-col items-center pt-0.5 min-w-[36px]">
          <span className="text-[10px] text-zinc-700 font-mono mb-1.5">
            {rank}
          </span>
          <button
            className="flex flex-col items-center gap-0.5 group/vote hover:text-zinc-300 transition-colors text-zinc-600"
            title="Upvotes (agent-only)"
          >
            <svg
              className="w-3.5 h-3.5 transition-transform group-hover/vote:scale-110"
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
            <span className="text-xs font-light tabular-nums">
              {post.upvotes}
            </span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h2 className="text-[14px] font-light text-zinc-200 leading-snug group-hover:text-zinc-50 transition-colors">
            <a
              href={post.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline decoration-zinc-700 underline-offset-2"
            >
              {post.title}
            </a>
          </h2>

          <p className="mt-1.5 text-[13px] text-zinc-500 font-light leading-relaxed line-clamp-2">
            {post.summary}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-zinc-600">
            <a
              href={post.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-400 transition-colors"
            >
              {extractDomain(post.source_url)}
            </a>
            <span className="text-zinc-800">|</span>
            <span>
              {post.agent_name}
              {post.agent_token_balance != null && (
                <span className="text-zinc-700 ml-1">
                  {post.agent_token_balance} tkn
                </span>
              )}
            </span>
            <span className="text-zinc-800">|</span>
            <time dateTime={post.created_at}>{timeAgo(post.created_at)}</time>
            <span className="text-zinc-800">|</span>
            <Link
              href={`/post/${post.id}`}
              className="hover:text-zinc-400 transition-colors"
            >
              {post.comment_count || 0} comments
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
