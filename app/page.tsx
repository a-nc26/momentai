'use client';

import Link from 'next/link';

const FEATURES = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="2" width="7" height="7" rx="2" fill="currentColor" opacity="0.3" />
        <rect x="11" y="2" width="7" height="7" rx="2" fill="currentColor" />
        <rect x="2" y="11" width="7" height="7" rx="2" fill="currentColor" />
        <rect x="11" y="11" width="7" height="7" rx="2" fill="currentColor" opacity="0.3" />
      </svg>
    ),
    title: 'Journey Map',
    desc: 'Describe your app and get an interactive flow map of every screen and step — generated in seconds.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="5" y="2" width="10" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <rect x="7.5" y="5" width="5" height="1.5" rx="0.75" fill="currentColor" opacity="0.5" />
        <rect x="7.5" y="8" width="5" height="1.5" rx="0.75" fill="currentColor" opacity="0.5" />
        <rect x="7.5" y="11" width="3" height="1.5" rx="0.75" fill="currentColor" opacity="0.5" />
      </svg>
    ),
    title: 'Live Mockups',
    desc: 'Every Moment renders a pixel-perfect mobile screen. Loading, error, and empty states included.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 3v2M10 15v2M3 10h2M15 10h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="10" cy="10" r="4" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="10" cy="10" r="1.5" fill="currentColor" />
      </svg>
    ),
    title: 'Edit Moments',
    desc: 'Change any screen with plain English. Add new steps, rewire flows — the map updates automatically.',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M4 10h12M10 4l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'AI-Powered Flows',
    desc: 'AI moments show you the exact prompt, inputs, outputs, and model call — ready for engineering handoff.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col overflow-x-hidden">

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-zinc-900 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-indigo-500" />
          <span className="text-white font-semibold text-sm tracking-tight">Momentum</span>
        </div>
        <Link
          href="/app"
          className="text-sm text-zinc-400 hover:text-white transition-colors"
        >
          Open App →
        </Link>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 pt-24 pb-16 relative">
        {/* Background glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(99,102,241,0.15) 0%, transparent 70%)',
          }}
        />

        <div className="relative max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-1.5 text-xs text-zinc-400 mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Powered by Claude Sonnet &amp; Haiku
          </div>

          <h1 className="text-5xl font-bold tracking-tight leading-tight mb-6">
            Turn an idea into a{' '}
            <span className="text-indigo-400">visual app map</span>
            {' '}in seconds
          </h1>

          <p className="text-zinc-400 text-lg leading-relaxed mb-10 max-w-lg mx-auto">
            Describe your app. Momentum generates every screen, flow, and AI integration — with live mockups you can edit with plain English.
          </p>

          <Link
            href="/app"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30"
          >
            Start Building
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <p className="text-zinc-600 text-xs mt-4">No account needed · Free to try</p>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-4xl mx-auto w-full px-6 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex gap-4"
            >
              <div className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0 text-indigo-400">
                {f.icon}
              </div>
              <div>
                <p className="text-white text-sm font-semibold mb-1">{f.title}</p>
                <p className="text-zinc-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 px-6 py-5 flex items-center justify-between text-zinc-600 text-xs shrink-0">
        <span>© 2026 Momentum</span>
        <span>Built with Claude</span>
      </footer>
    </div>
  );
}
