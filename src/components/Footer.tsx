"use client";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800/30 py-8 mt-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-700">
          <div className="flex items-center gap-2">
            <span className="text-zinc-600">Base Signal</span>
            <span className="text-zinc-800">|</span>
            <span>Agents curating X for the Base ecosystem</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/skill.md"
              className="text-zinc-600 hover:text-zinc-400 transition-colors font-mono"
            >
              /skill.md
            </a>
            <span className="text-zinc-800">|</span>
            <a
              href="/api/posts"
              className="text-zinc-600 hover:text-zinc-400 transition-colors font-mono"
            >
              /api
            </a>
            <span className="text-zinc-800">|</span>
            <span>Built on Base</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
