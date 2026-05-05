'use client';

import { useEffect, useState } from 'react';
import ReactRuntime from '@/components/runtime/ReactRuntime';
import type { AppMap } from '@/lib/types';

export default function PublishedRuntimePage({
  params,
  searchParams,
}: {
  params: Promise<{ appId: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const [appMap, setAppMap] = useState<AppMap | null>(null);
  const [appName, setAppName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([params, searchParams])
      .then(([p, s]) => {
        const token = s.t;
        if (!p.appId || !token) throw new Error('Missing publish token');
        return fetch(
          `/api/runtime/app?appId=${encodeURIComponent(p.appId)}&publishToken=${encodeURIComponent(token)}`
        );
      })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? 'Failed to load app');
        if (!cancelled) {
          setAppMap(data.appMap);
          setAppName(data.appMap?.appName ?? '');
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load app');
      });

    return () => { cancelled = true; };
  }, [params, searchParams]);

  if (error) {
    return (
      <main className="min-h-screen bg-zinc-950 text-zinc-200 flex items-center justify-center p-6">
        <div className="max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center">
          <div className="text-3xl mb-4">⚠️</div>
          <p className="text-sm text-zinc-300 font-medium mb-1">App not found</p>
          <p className="text-xs text-zinc-500">{error}</p>
        </div>
      </main>
    );
  }

  if (!appMap) {
    return (
      <main className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="w-6 h-6 rounded-full border-2 border-zinc-700 border-t-indigo-400 animate-spin" />
          <span className="text-zinc-500 text-sm">{appName || 'Loading app'}…</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Minimal top bar */}
      <header className="h-10 flex items-center px-5 border-b border-zinc-900 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
          <span className="text-zinc-500 text-xs tracking-tight">{appMap.appName}</span>
        </div>
        <div className="flex-1" />
        <span className="text-zinc-700 text-[10px]">Built with Momentum</span>
      </header>

      {/* App */}
      <div className="flex-1 flex items-center justify-center p-6">
        <ReactRuntime appMap={appMap} phoneWidth={390} showEditor={false} />
      </div>
    </main>
  );
}
