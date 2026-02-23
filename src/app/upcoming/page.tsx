'use client';

import Header from '@/components/Header';

export default function UpcomingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <Header />
      <main className="max-w-5xl mx-auto px-5 pt-32 pb-20 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Coming Soon</h1>
        <p className="text-[var(--text-muted)] text-lg">
          Upcoming product launches will appear here.
        </p>
      </main>
    </div>
  );
}
