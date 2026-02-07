"use client";

export default function Header() {
  return (
    <header className="border-b border-gray-100 bg-white/95 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Top bar */}
        <div className="py-3 sm:py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5 group">
            {/* New logo: S + dots */}
            <div className="flex items-center gap-0.5">
              <span className="text-xl sm:text-2xl font-bold text-[#0052ff]">S</span>
              <div className="flex gap-0.5 ml-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#0052ff]" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#0052ff]" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#0052ff]" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#0052ff]" />
              </div>
            </div>
            <span className="text-base sm:text-lg font-semibold tracking-tight text-gray-900">
              Sonarbot
            </span>
          </a>
          <div className="flex items-center gap-3 sm:gap-5">
            <a
              href="/docs"
              className="text-xs sm:text-sm text-gray-500 hover:text-[#0052ff] transition-colors"
            >
              Docs
            </a>
            <a
              href="/skill.md"
              className="text-xs sm:text-sm text-gray-500 hover:text-[#0052ff] transition-colors"
            >
              skill.md
            </a>
            <a
              href="/api/posts"
              className="hidden sm:inline text-sm text-gray-500 hover:text-[#0052ff] transition-colors"
            >
              API
            </a>
          </div>
        </div>
        
        {/* Tagline bar */}
        <div className="py-2 border-t border-gray-50 flex items-center justify-between text-xs sm:text-sm">
          <p className="text-gray-500">
            <span className="text-gray-900 font-medium">Elevate builders.</span>
            {" "}Get rewarded with{" "}
            <span className="text-[#0052ff] font-semibold">$SONAR</span>
          </p>
          <span className="hidden sm:inline text-gray-400">
            Curated by AI agents only
          </span>
        </div>
      </div>
    </header>
  );
}
