'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMomentaiStore } from '@/lib/store';
import PromptScreen from '@/components/PromptScreen';
import Canvas from '@/components/Canvas';
import MomentPanel from '@/components/MomentPanel';
import MomentDetail from '@/components/MomentDetail';
import { DEMO_APP_MAP } from '@/lib/demo-data';

function DemoLoader() {
  const params = useSearchParams();
  const { setAppMap, appMap } = useMomentaiStore();
  useEffect(() => {
    if (params.get('demo') === 'true' && !appMap) {
      setAppMap(DEMO_APP_MAP);
    }
  }, []);
  return null;
}

export default function AppPage() {
  const { appMap, selectedMomentId, detailMomentId, reset } = useMomentaiStore();
  const selectedMoment = appMap?.moments.find((m) => m.id === selectedMomentId) ?? null;
  const detailMoment = appMap?.moments.find((m) => m.id === detailMomentId) ?? null;

  return (
    <div className="h-screen w-screen flex flex-col bg-zinc-950 overflow-hidden">
      <Suspense>
        <DemoLoader />
      </Suspense>

      {/* Header — hidden when in detail view */}
      {!detailMoment && (
        <header className="h-13 border-b border-zinc-800 flex items-center px-5 gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500" />
            <span className="text-white font-semibold text-sm tracking-tight">Momentum</span>
          </div>
          {appMap && (
            <>
              <span className="text-zinc-700">/</span>
              <span className="text-zinc-400 text-sm truncate max-w-xs">{appMap.appName}</span>
              <div className="flex-1" />
              <button
                onClick={reset}
                className="text-zinc-500 hover:text-zinc-300 text-xs border border-zinc-800 hover:border-zinc-600 px-3 py-1.5 rounded-lg transition-all"
              >
                New App
              </button>
            </>
          )}
        </header>
      )}

      {/* Main */}
      <div className="flex-1 flex overflow-hidden">
        {!appMap ? (
          <PromptScreen />
        ) : detailMoment ? (
          <MomentDetail moment={detailMoment} />
        ) : (
          <>
            <div className="flex-1 relative">
              <Canvas />
            </div>
            {selectedMoment && <MomentPanel moment={selectedMoment} />}
          </>
        )}
      </div>
    </div>
  );
}
