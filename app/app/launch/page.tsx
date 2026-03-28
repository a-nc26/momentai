'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import MobileRuntime from '@/components/runtime/MobileRuntime';
import Canvas from '@/components/Canvas';
import { getStartMomentId } from '@/lib/runtime';
import { useMomentaiStore } from '@/lib/store';
import { debugLog } from '@/lib/debug-log';

export default function LaunchPage() {
  const router = useRouter();
  const { appMap, selectMoment, selectedMomentId, activeProjectId } = useMomentaiStore();
  const [runtimeSeedId, setRuntimeSeedId] = useState<string | null>(null);
  const [currentMomentId, setCurrentMomentId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState('');
  const [runtimeMaxHeight, setRuntimeMaxHeight] = useState(760);

  // Tracks the last moment set BY the runtime (not by canvas click)
  const lastRuntimeMomentRef = useRef<string | null>(null);

  useEffect(() => {
    if (!appMap) {
      setLoadError('No launchable app is loaded in this session yet.');
      return;
    }
    const startMomentId = getStartMomentId(appMap);
    if (startMomentId) {
      setRuntimeSeedId(startMomentId);
      setCurrentMomentId(startMomentId);
      lastRuntimeMomentRef.current = startMomentId;
      selectMoment(startMomentId);
      setLoadError('');
      debugLog('Launch', 'Runtime started', {
        startMomentId,
        momentCount: appMap.moments.length,
        edgeCount: appMap.edges.length,
        stateSchema: appMap.stateSchema,
      });
    } else {
      setLoadError('This app does not have a valid launchable start node yet.');
      debugLog('Launch', 'No valid start node found', { moments: appMap.moments.map((m) => m.id) }, 'warn');
    }
  }, [appMap]);

  useEffect(() => {
    const update = () => setRuntimeMaxHeight(Math.max(520, window.innerHeight - 56));
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // When user clicks a canvas node, jump the runtime to that moment
  useEffect(() => {
    if (!selectedMomentId) return;
    if (selectedMomentId === lastRuntimeMomentRef.current) return;
    setRuntimeSeedId(selectedMomentId);
    lastRuntimeMomentRef.current = selectedMomentId;
  }, [selectedMomentId]);

  const handleMomentChange = (momentId: string | null) => {
    if (!momentId) return;
    const label = appMap?.moments.find((m) => m.id === momentId)?.label;
    debugLog('Launch', `→ navigated to: ${label ?? momentId}`, { momentId });
    setCurrentMomentId(momentId);
    lastRuntimeMomentRef.current = momentId;
    selectMoment(momentId);
  };

  const currentMomentLabel = appMap?.moments.find((m) => m.id === currentMomentId)?.label;

  if (!appMap || !runtimeSeedId) {
    return (
      <div className="h-screen bg-zinc-950 text-zinc-200 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-sm">{loadError || 'Preparing launch runtime...'}</p>
          <button
            onClick={() => router.push('/app')}
            className="text-xs border border-zinc-700 px-3 py-1.5 rounded-lg hover:border-zinc-500"
          >
            Back to Builder
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-zinc-950 text-zinc-100 flex flex-col overflow-hidden">
      <header className="h-12 border-b border-zinc-800 flex items-center px-4 gap-3 shrink-0">
        <button
          onClick={() => router.push('/app')}
          className="text-xs text-zinc-400 hover:text-zinc-100 border border-zinc-700 px-2.5 py-1.5 rounded-md"
        >
          Builder
        </button>
        <span className="text-zinc-700">/</span>
        <span className="text-sm text-zinc-300 truncate">{appMap.appName}</span>
        {currentMomentLabel && (
          <>
            <span className="text-zinc-700">/</span>
            <span className="text-sm text-white font-medium truncate">{currentMomentLabel}</span>
          </>
        )}
      </header>

      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* Canvas — nodes highlight as prototype navigates */}
        <div className="flex-1 min-h-0 relative">
          <Canvas />
        </div>

        {/* Runtime phone */}
        <div className="w-[300px] border-l border-zinc-800 flex items-center justify-center p-4 shrink-0">
          <MobileRuntime
            key={runtimeSeedId}
            appMap={{ ...appMap, appPlatform: 'mobile' }}
            startMomentId={runtimeSeedId}
            phoneWidth={260}
            maxHeight={runtimeMaxHeight}
            onMomentChange={handleMomentChange}
            projectId={activeProjectId}
          />
        </div>
      </div>
    </div>
  );
}
