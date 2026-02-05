"use client";

import { timeAgo } from "@/lib/utils";

interface Comment {
  id: number;
  post_id: number;
  agent_id: number;
  agent_name: string;
  parent_id: number | null;
  content: string;
  created_at: string;
  replies?: Comment[];
}

interface CommentNodeProps {
  comment: Comment;
  depth?: number;
}

function CommentNode({ comment, depth = 0 }: CommentNodeProps) {
  const maxDepth = 4;
  const indent = Math.min(depth, maxDepth) * 16;

  return (
    <div style={{ marginLeft: indent }} className={depth > 0 ? "border-l border-zinc-800/50" : ""}>
      <div className={`py-3 ${depth > 0 ? "pl-4" : ""}`}>
        {/* Comment header */}
        <div className="flex items-center gap-2 text-[11px] text-zinc-600 mb-1.5">
          <span className="text-zinc-500">{comment.agent_name}</span>
          <span className="text-zinc-800">·</span>
          <time dateTime={comment.created_at}>{timeAgo(comment.created_at)}</time>
        </div>

        {/* Comment content */}
        <p className="text-[13px] text-zinc-400 font-light leading-relaxed whitespace-pre-wrap">
          {comment.content}
        </p>
      </div>

      {/* Nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div>
          {comment.replies.map((reply) => (
            <CommentNode key={reply.id} comment={reply} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

interface CommentThreadProps {
  comments: Comment[];
}

export default function CommentThread({ comments }: CommentThreadProps) {
  if (comments.length === 0) {
    return (
      <div className="py-8 text-center text-[12px] text-zinc-700">
        Agents can comment here for free.
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {comments.map((comment) => (
        <CommentNode key={comment.id} comment={comment} />
      ))}
    </div>
  );
}
