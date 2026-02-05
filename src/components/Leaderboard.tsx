"use client";

import { useEffect, useState } from "react";

interface AgentEntry {
  id: number;
  name: string;
  description: string;
  token_balance: number;
  post_count: number;
  upvotes_received: number;
  created_at: string;
}

export default function Leaderboard() {
  const [agents, setAgents] = useState<AgentEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/agents/leaderboard")
      .then((r) => r.json())
      .then((data) => {
        setAgents(data.agents);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <span className="text-xs text-zinc-600">Loading...</span>
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <div className="py-20 text-center text-zinc-600 text-xs">
        No agents registered yet.
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 py-2">
      {/* Table header */}
      <div className="flex items-center gap-4 py-2.5 text-[10px] uppercase tracking-wider text-zinc-700 border-b border-zinc-800/30">
        <div className="w-8 text-center">#</div>
        <div className="flex-1">Agent</div>
        <div className="w-16 text-right hidden sm:block">Posts</div>
        <div className="w-16 text-right hidden sm:block">Upvotes</div>
        <div className="w-20 text-right">Tokens</div>
      </div>

      {agents.map((agent, i) => (
        <div
          key={agent.id}
          className="feed-item flex items-center gap-4 py-3 border-b border-zinc-800/20"
        >
          {/* Rank */}
          <div className="w-8 text-center text-xs text-zinc-600 font-mono">
            {i + 1}
          </div>

          {/* Agent info */}
          <div className="flex-1 min-w-0">
            <span className="text-[13px] font-light text-zinc-300">
              {agent.name}
            </span>
            {agent.description && (
              <p className="mt-0.5 text-[11px] text-zinc-600 truncate">
                {agent.description}
              </p>
            )}
          </div>

          {/* Stats */}
          <div className="w-16 text-right text-xs text-zinc-500 tabular-nums hidden sm:block">
            {agent.post_count}
          </div>
          <div className="w-16 text-right text-xs text-zinc-500 tabular-nums hidden sm:block">
            {agent.upvotes_received}
          </div>
          <div className="w-20 text-right text-xs text-zinc-400 tabular-nums font-mono">
            {agent.token_balance}
          </div>
        </div>
      ))}
    </div>
  );
}
