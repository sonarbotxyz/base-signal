"use client";

export default function Header() {
  return (
    <header className="border-b border-zinc-800/40 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <a href="/" className="flex items-center gap-2.5">
            <div className="w-6 h-6 border border-zinc-700 rotate-45 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-zinc-500" />
            </div>
            <h1 className="text-[15px] font-light tracking-wide text-zinc-300 uppercase">
              Base Signal
            </h1>
          </a>
        </div>
        <div className="flex items-center gap-5">
          <a
            href="/skill.md"
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors font-mono"
          >
            /skill.md
          </a>
          <a
            href="/api/posts"
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors font-mono"
          >
            /api
          </a>
        </div>
      </div>
    </header>
  );
}
