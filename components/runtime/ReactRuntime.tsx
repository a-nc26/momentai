'use client';

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { AppMap } from '@/lib/types';
import { useMomentaiStore } from '@/lib/store';
import { buildSrcdoc } from '@/lib/buildSrcdoc';

function EditBar({
  appMap,
  currentMomentId,
}: {
  appMap: AppMap;
  currentMomentId: string;
}) {
  const [editText, setEditText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const { setMomentComponentCode } = useMomentaiStore();

  const currentMoment = appMap.moments.find((m) => m.id === currentMomentId);
  const journey = appMap.journeys.find((j) => j.id === currentMoment?.journeyId);

  const handleSubmit = useCallback(async () => {
    if (!editText.trim() || isEditing || !currentMoment || !journey) return;
    setIsEditing(true);
    const change = editText;
    setEditText('');
    try {
      const res = await fetch('/api/edit-moment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moment: currentMoment, change, journey, appMap }),
      });
      const result = await res.json();
      if (result.componentCode) {
        setMomentComponentCode(currentMomentId, result.componentCode);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsEditing(false);
    }
  }, [editText, isEditing, currentMoment, journey, appMap, currentMomentId, setMomentComponentCode]);

  if (!currentMoment?.componentCode) return null;

  return (
    <div className="shrink-0 border-t border-zinc-800 bg-zinc-900/95 backdrop-blur-sm px-4 py-3">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
        <span className="text-zinc-400 text-[11px] font-medium truncate">
          {currentMoment.label}
        </span>
        {journey && (
          <span className="text-zinc-600 text-[10px]">in {journey.name}</span>
        )}
      </div>
      <div className="flex gap-2">
        <input
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
          placeholder="Describe a change to this screen..."
          disabled={isEditing}
          className="flex-1 bg-zinc-800 border border-zinc-700 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 text-white text-sm rounded-lg px-3 py-2 outline-none placeholder:text-zinc-600 disabled:opacity-50 transition-all"
        />
        <button
          onClick={handleSubmit}
          disabled={!editText.trim() || isEditing}
          className="shrink-0 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium px-4 py-2 rounded-lg transition-all flex items-center gap-1.5"
        >
          {isEditing ? (
            <>
              <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Editing...
            </>
          ) : (
            'Apply'
          )}
        </button>
      </div>
    </div>
  );
}

export default function ReactRuntime({
  appMap,
  phoneWidth = 320,
}: {
  appMap: AppMap;
  phoneWidth?: number;
}) {
  const platform = appMap.appPlatform ?? 'mobile';
  const { activeMomentId, setActiveMomentId } = useMomentaiStore();

  const [currentMomentId, setCurrentMomentId] = useState<string>(
    () => activeMomentId ?? appMap.moments[0]?.id ?? ''
  );
  const [sharedState, setSharedState] = useState<Record<string, unknown>>(
    () => (appMap.initialState as Record<string, unknown>) ?? {}
  );

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const suppressSyncRef = useRef(false);

  const currentMoment = useMemo(
    () => appMap.moments.find((m) => m.id === currentMomentId),
    [appMap.moments, currentMomentId]
  );

  useEffect(() => {
    if (activeMomentId && activeMomentId !== currentMomentId) {
      const exists = appMap.moments.some((m) => m.id === activeMomentId);
      if (exists) {
        suppressSyncRef.current = true;
        setCurrentMomentId(activeMomentId);
      }
    }
  }, [activeMomentId, appMap.moments]);

  useEffect(() => {
    if (suppressSyncRef.current) {
      suppressSyncRef.current = false;
      return;
    }
    if (currentMomentId !== activeMomentId) {
      setActiveMomentId(currentMomentId);
    }
  }, [currentMomentId]);

  useEffect(() => {
    function handler(e: MessageEvent) {
      if (!e.data) return;
      if (e.data.type === 'navigate' && e.data.momentId) {
        setCurrentMomentId(e.data.momentId);
      }
      if (e.data.type === 'stateChange' && e.data.key) {
        setSharedState((prev) => ({ ...prev, [e.data.key]: e.data.value }));
      }
    }
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  const srcdoc = useMemo(() => {
    if (!currentMoment?.componentCode) return null;
    return buildSrcdoc(currentMoment.componentCode, sharedState);
  }, [currentMoment?.componentCode, sharedState]);

  const hasCode = appMap.moments.some((m) => m.componentCode);
  const isBuilding = currentMoment?.buildStatus === 'building';

  if (!hasCode) {
    return platform === 'web' ? (
      <WebEmptyState isBuilding={false} />
    ) : (
      <MobileEmptyState isBuilding={false} phoneWidth={phoneWidth} />
    );
  }

  if (platform === 'web') {
    return (
      <div className="flex-[3] min-w-0 border-l border-zinc-800 flex flex-col bg-zinc-950">
        <div className="h-9 bg-zinc-900 border-b border-zinc-800 flex items-center px-3 gap-2 shrink-0">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
          </div>
          <div className="flex-1 bg-zinc-800 rounded-md h-5 flex items-center px-2 mx-2">
            <span className="text-zinc-600 text-[10px] font-mono truncate">
              {appMap.appName.toLowerCase().replace(/\s+/g, '-')}.momentai.app
            </span>
          </div>
        </div>
        <div className="flex-1 relative">
          {isBuilding || !srcdoc ? (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-950">
              <div className="flex flex-col items-center gap-3">
                <span className="w-5 h-5 rounded-full border-2 border-zinc-700 border-t-indigo-400 animate-spin" />
                <p className="text-zinc-500 text-xs">
                  {isBuilding ? 'Building screen...' : 'No component code yet'}
                </p>
              </div>
            </div>
          ) : (
            <iframe
              ref={iframeRef}
              key={currentMomentId}
              srcDoc={srcdoc}
              className="w-full h-full border-0 bg-white"
              sandbox="allow-scripts"
              title="App Runtime"
            />
          )}
        </div>
        <EditBar appMap={appMap} currentMomentId={currentMomentId} />
      </div>
    );
  }

  // Mobile
  return (
    <div className="w-[420px] shrink-0 border-l border-zinc-800 flex flex-col bg-zinc-950">
      <div className="flex-1 flex items-center justify-center py-6">
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <div
              className="bg-zinc-900 rounded-[40px] border-[3px] border-zinc-700 shadow-2xl overflow-hidden"
              style={{ width: phoneWidth }}
            >
              <div className="h-8 bg-zinc-900 flex items-center justify-center">
                <div className="w-20 h-4 bg-zinc-800 rounded-b-xl" />
              </div>
              <div
                className="bg-white overflow-hidden relative"
                style={{ height: Math.round(phoneWidth * 1.875) }}
              >
                {isBuilding || !srcdoc ? (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-950">
                    <div className="flex flex-col items-center gap-3 px-6">
                      <span className="w-5 h-5 rounded-full border-2 border-zinc-700 border-t-indigo-400 animate-spin" />
                      <p className="text-zinc-500 text-xs text-center">
                        {isBuilding ? 'Building screen...' : 'No component code yet'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <iframe
                    ref={iframeRef}
                    key={currentMomentId}
                    srcDoc={srcdoc}
                    className="w-full h-full border-0"
                    sandbox="allow-scripts"
                    title="App Runtime"
                    style={{
                      transform: 'scale(0.82)',
                      transformOrigin: 'top left',
                      width: '122%',
                      height: '122%',
                    }}
                  />
                )}
              </div>
              <div className="h-6 bg-zinc-900 flex items-center justify-center">
                <div className="w-24 h-1 bg-zinc-600 rounded-full" />
              </div>
            </div>
          </div>

          {currentMoment && (
            <p className="text-zinc-500 text-xs text-center truncate max-w-[280px]">
              {currentMoment.label}
            </p>
          )}
        </div>
      </div>
      <EditBar appMap={appMap} currentMomentId={currentMomentId} />
    </div>
  );
}

function MobileEmptyState({ isBuilding, phoneWidth }: { isBuilding: boolean; phoneWidth: number }) {
  return (
    <div className="w-[420px] shrink-0 border-l border-zinc-800 flex items-center justify-center bg-zinc-950 py-6">
      <div
        className="bg-zinc-900 rounded-[40px] border-[3px] border-zinc-800 overflow-hidden"
        style={{ width: phoneWidth }}
      >
        <div className="h-8 bg-zinc-900 flex items-center justify-center">
          <div className="w-20 h-4 bg-zinc-800 rounded-b-xl" />
        </div>
        <div
          className="bg-zinc-950 flex flex-col items-center justify-center gap-4 px-8"
          style={{ height: Math.round(phoneWidth * 1.875) }}
        >
          {isBuilding ? (
            <>
              <span className="w-6 h-6 rounded-full border-2 border-zinc-700 border-t-indigo-400 animate-spin" />
              <p className="text-zinc-400 text-sm font-medium">Building your app...</p>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-2xl bg-zinc-900 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <rect x="1.5" y="1.5" width="6" height="6" rx="1" stroke="#52525b" strokeWidth="1.4"/>
                  <rect x="10.5" y="1.5" width="6" height="6" rx="1" stroke="#52525b" strokeWidth="1.4"/>
                  <rect x="1.5" y="10.5" width="6" height="6" rx="1" stroke="#52525b" strokeWidth="1.4"/>
                  <rect x="10.5" y="10.5" width="6" height="6" rx="1" stroke="#52525b" strokeWidth="1.4"/>
                </svg>
              </div>
              <p className="text-zinc-600 text-xs text-center">Click Build &amp; Share to generate screens</p>
            </>
          )}
        </div>
        <div className="h-6 bg-zinc-900 flex items-center justify-center">
          <div className="w-24 h-1 bg-zinc-800 rounded-full" />
        </div>
      </div>
    </div>
  );
}

function WebEmptyState({ isBuilding }: { isBuilding: boolean }) {
  return (
    <div className="flex-[3] min-w-0 border-l border-zinc-800 flex flex-col bg-zinc-950">
      <div className="h-9 bg-zinc-900 border-b border-zinc-800 flex items-center px-3 gap-2 shrink-0">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
          <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        {isBuilding ? (
          <div className="flex flex-col items-center gap-3">
            <span className="w-6 h-6 rounded-full border-2 border-zinc-700 border-t-indigo-400 animate-spin" />
            <p className="text-zinc-400 text-sm font-medium">Building your app...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-900 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="1.5" y="1.5" width="6" height="6" rx="1" stroke="#52525b" strokeWidth="1.4"/>
                <rect x="10.5" y="1.5" width="6" height="6" rx="1" stroke="#52525b" strokeWidth="1.4"/>
                <rect x="1.5" y="10.5" width="6" height="6" rx="1" stroke="#52525b" strokeWidth="1.4"/>
                <rect x="10.5" y="10.5" width="6" height="6" rx="1" stroke="#52525b" strokeWidth="1.4"/>
              </svg>
            </div>
            <p className="text-zinc-600 text-xs">Click Build &amp; Share to generate screens</p>
          </div>
        )}
      </div>
    </div>
  );
}
