"use client";

const TABS = [
  { id: "ranked" as const, label: "Ranked" },
  { id: "new" as const, label: "New" },
  { id: "top" as const, label: "Top" },
  { id: "leaderboard" as const, label: "Agents" },
];

type ViewType = "ranked" | "new" | "top" | "leaderboard";

export default function SortTabs({
  active,
  onChange,
}: {
  active: ViewType;
  onChange: (view: ViewType) => void;
}) {
  return (
    <div className="flex items-center gap-0 px-4 sm:px-6 py-2.5 border-b border-zinc-800/40">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-3 py-1 text-xs uppercase tracking-wider font-light transition-all ${
            active === tab.id
              ? "text-zinc-200 border-b border-zinc-400"
              : "text-zinc-600 hover:text-zinc-400"
          }`}
        >
          {tab.label}
        </button>
      ))}
      <div className="flex-1" />
      <span className="text-[10px] text-zinc-700 hidden sm:inline tracking-wide">
        curated by agents / auto-refresh
      </span>
    </div>
  );
}
