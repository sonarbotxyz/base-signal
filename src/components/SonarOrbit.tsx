"use client";

interface OrbitingIconProps {
  radius: number;
  duration: number;
  delay?: number;
  reverse?: boolean;
  children: React.ReactNode;
}

function OrbitingIcon({ radius, duration, delay = 0, reverse = false, children }: OrbitingIconProps) {
  return (
    <div
      className="absolute flex items-center justify-center"
      style={{
        width: radius * 2,
        height: radius * 2,
        left: `calc(50% - ${radius}px)`,
        top: `calc(50% - ${radius}px)`,
        animation: `orbit ${duration}s linear infinite ${reverse ? 'reverse' : ''}`,
        animationDelay: `${delay}s`,
      }}
    >
      <div 
        className="absolute"
        style={{
          left: '50%',
          top: 0,
          transform: 'translateX(-50%)',
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default function SonarOrbit() {
  return (
    <div className="relative w-[280px] h-[280px] sm:w-[340px] sm:h-[340px]">
      {/* Orbit rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="absolute w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] rounded-full border border-gray-200/60" />
        <div className="absolute w-[200px] h-[200px] sm:w-[240px] sm:h-[240px] rounded-full border border-gray-200/40" />
        <div className="absolute w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] rounded-full border border-gray-200/20" />
      </div>

      {/* Center - Base Sonar logo */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          {/* Pulse effect */}
          <div className="absolute inset-0 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#0052ff]/20 animate-sonar-ping" />
          <div className="absolute inset-0 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#0052ff]/10 animate-sonar-ping-delayed" />
          {/* Core */}
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#0052ff] flex items-center justify-center shadow-lg shadow-[#0052ff]/20">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white" />
          </div>
        </div>
      </div>

      {/* Inner orbit - fast */}
      <OrbitingIcon radius={60} duration={15} delay={0}>
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-[#0052ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
      </OrbitingIcon>

      <OrbitingIcon radius={60} duration={15} delay={7.5}>
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-sm font-bold text-[#0052ff]">
          AI
        </div>
      </OrbitingIcon>

      {/* Middle orbit - medium */}
      <OrbitingIcon radius={100} duration={25} delay={0} reverse>
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center">
          <span className="text-base sm:text-lg">🔵</span>
        </div>
      </OrbitingIcon>

      <OrbitingIcon radius={100} duration={25} delay={8} reverse>
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
      </OrbitingIcon>

      <OrbitingIcon radius={100} duration={25} delay={16} reverse>
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center">
          <svg className="w-5 h-5 text-[#0052ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </OrbitingIcon>

      {/* Outer orbit - slow */}
      <OrbitingIcon radius={140} duration={35} delay={0}>
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        </div>
      </OrbitingIcon>

      <OrbitingIcon radius={140} duration={35} delay={17.5}>
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        </div>
      </OrbitingIcon>
    </div>
  );
}
