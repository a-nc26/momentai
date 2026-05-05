'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PromptScreen from '@/components/PromptScreen';
import BuildAccessGate from '@/components/BuildAccessGate';
import OutOfBuilderCredits from '@/components/OutOfBuilderCredits';

type AccessPayload = {
  hasSession: boolean;
  credits: number | null;
  canUseBuilder: boolean;
  mode: 'credits' | 'legacy';
};

function AppPreMapInner() {
  const params = useSearchParams();
  const isDemo = params.get('demo') === 'true';
  const [payload, setPayload] = useState<AccessPayload | null>(isDemo ? { hasSession: true, credits: null, canUseBuilder: true, mode: 'legacy' } : null);

  useEffect(() => {
    if (isDemo) {
      setPayload({ hasSession: true, credits: null, canUseBuilder: true, mode: 'legacy' });
      return;
    }
    let cancelled = false;
    fetch('/api/build-access')
      .then((r) => r.json())
      .then((d: AccessPayload) => {
        if (cancelled) return;
        setPayload({
          hasSession: d.hasSession === true,
          credits: typeof d.credits === 'number' ? d.credits : null,
          canUseBuilder: d.canUseBuilder === true,
          mode: d.mode === 'credits' ? 'credits' : 'legacy',
        });
      })
      .catch(() => {
        if (!cancelled) {
          setPayload({ hasSession: false, credits: null, canUseBuilder: false, mode: 'legacy' });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [isDemo]);

  if (!payload) {
    return (
      <div className="h-full w-full min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="flex items-center gap-3 text-zinc-400 text-sm">
          <span className="w-4 h-4 rounded-full border-2 border-zinc-700 border-t-indigo-400 animate-spin" />
          Loading…
        </div>
      </div>
    );
  }

  if (isDemo) {
    return <PromptScreen />;
  }

  if (!payload.hasSession) {
    return (
      <BuildAccessGate
        onUnlocked={async () => {
          const r = await fetch('/api/build-access');
          const d = (await r.json()) as AccessPayload;
          setPayload({
            hasSession: d.hasSession === true,
            credits: typeof d.credits === 'number' ? d.credits : null,
            canUseBuilder: d.canUseBuilder === true,
            mode: d.mode === 'credits' ? 'credits' : 'legacy',
          });
        }}
      />
    );
  }

  if (payload.mode === 'credits' && !payload.canUseBuilder) {
    return <OutOfBuilderCredits />;
  }

  return <PromptScreen />;
}

export default function AppPreMapGate() {
  return (
    <Suspense
      fallback={
        <div className="h-full w-full min-h-screen flex items-center justify-center bg-zinc-950">
          <div className="flex items-center gap-3 text-zinc-400 text-sm">
            <span className="w-4 h-4 rounded-full border-2 border-zinc-700 border-t-indigo-400 animate-spin" />
            Loading…
          </div>
        </div>
      }
    >
      <AppPreMapInner />
    </Suspense>
  );
}
