'use client';

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { AppMap, RuntimeActionSpec, RuntimeValue } from '@/lib/types';
import { useMomentaiStore } from '@/lib/store';
import { buildShellSrcdoc } from '@/lib/buildSrcdoc';
import MobileRuntime from '@/components/runtime/MobileRuntime';
import MomentScreenPicker from '@/components/MomentScreenPicker';
import EditComposeTab from '@/components/edit/EditComposeTab';
import { useMomentEdit } from '@/lib/hooks/useMomentEdit';
import { buildRuntimeApiActionPayload } from '@/lib/runtime';
import {
  ensureRuntimeSession,
  executePublishedRuntimeAction,
  getRuntimeBackend,
  loadPublishedRuntimeState,
} from '@/lib/runtime-client';

function EditBar({
  appMap,
  currentMomentId,
  onEditTargetChange,
}: {
  appMap: AppMap;
  currentMomentId: string;
  onEditTargetChange: (momentId: string) => void;
}) {
  const { editingMomentIds } = useMomentaiStore();
  const { canUndo, canRedo, undo, redo, isEditingMoment } = useMomentEdit();

  const currentMoment = appMap.moments.find((m) => m.id === currentMomentId);
  if (!currentMoment?.componentCode) return null;

  const busy = isEditingMoment(currentMomentId) || editingMomentIds.length > 0;

  return (
    <div className="shrink-0 border-t border-zinc-800 bg-zinc-900/95 backdrop-blur-sm px-4 py-3 space-y-3">
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <MomentScreenPicker
            appMap={appMap}
            value={currentMomentId}
            onChange={onEditTargetChange}
            disabled={busy}
            id="runtime-edit-screen-picker"
            className="w-full"
          />
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={undo}
            disabled={!canUndo || busy}
            className="text-[10px] text-zinc-400 hover:text-white disabled:text-zinc-700"
          >
            Undo
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={!canRedo || busy}
            className="text-[10px] text-zinc-400 hover:text-white disabled:text-zinc-700"
          >
            Redo
          </button>
        </div>
      </div>
      <EditComposeTab moment={currentMoment} compact />
    </div>
  );
}

export default function ReactRuntime({
  appMap,
  phoneWidth = 320,
  showEditor = true,
}: {
  appMap: AppMap;
  phoneWidth?: number;
  showEditor?: boolean;
}) {
  const platform = appMap.appPlatform ?? 'mobile';
  const { activeMomentId, setActiveMomentId, selectMoment } = useMomentaiStore();

  const [currentMomentId, setCurrentMomentId] = useState<string>(
    () => activeMomentId ?? appMap.moments[0]?.id ?? ''
  );
  const [sharedState, setSharedState] = useState<Record<string, unknown>>(
    () => (appMap.initialState as Record<string, unknown>) ?? {}
  );
  const [iframeReady, setIframeReady] = useState(false);
  const [runtimeGuestId, setRuntimeGuestId] = useState<string | null>(null);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const suppressSyncRef = useRef(false);
  const shellReadyRef = useRef(false);
  const sharedStateRef = useRef(sharedState);
  sharedStateRef.current = sharedState;

  const handleEditTargetChange = useCallback(
    (id: string) => {
      if (!appMap.moments.some((m) => m.id === id)) return;
      suppressSyncRef.current = true;
      setCurrentMomentId(id);
      setActiveMomentId(id);
      selectMoment(id);
    },
    [appMap.moments, setActiveMomentId, selectMoment]
  );

  const currentMoment = useMemo(
    () => appMap.moments.find((m) => m.id === currentMomentId),
    [appMap.moments, currentMomentId]
  );
  const currentMomentRef = useRef(currentMoment);
  currentMomentRef.current = currentMoment;

  const shellSrcdoc = useMemo(() => buildShellSrcdoc(), []);

  useEffect(() => {
    const backend = getRuntimeBackend(appMap);
    if (!backend) return;
    let cancelled = false;

    ensureRuntimeSession(appMap)
      .then(async (guestId) => {
        if (!guestId || cancelled) return;
        setRuntimeGuestId(guestId);
        const persistedState = await loadPublishedRuntimeState(appMap, guestId);
        if (!cancelled) {
          setSharedState((prev) => ({ ...prev, ...persistedState }));
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [appMap]);

  const sendComponent = useCallback(() => {
    const win = iframeRef.current?.contentWindow;
    const code = currentMomentRef.current?.componentCode;
    if (!win || !code) return;
    win.postMessage({ type: 'loadComponent', code, state: sharedStateRef.current }, '*');
    setIframeReady(false);
  }, []);

  // When shell signals ready, load the current component
  useEffect(() => {
    function handler(e: MessageEvent) {
      if (!e.data) return;
      const win = iframeRef.current?.contentWindow;
      if (win && e.source !== win) return;

      if (e.data.type === 'shellReady') {
        shellReadyRef.current = true;
        sendComponent();
      }
      if (e.data.type === 'iframeReady' || e.data.type === 'iframePreviewError') {
        setIframeReady(true);
      }
      if (e.data.type === 'navigate' && e.data.momentId) {
        setCurrentMomentId(e.data.momentId);
      }
      if (e.data.type === 'stateChange' && e.data.key) {
        setSharedState((prev) => ({ ...prev, [e.data.key]: e.data.value }));
      }
      if (e.data.type === 'runtimeAction' && e.data.requestId) {
        const requestId = String(e.data.requestId);
        const action = e.data.action as RuntimeActionSpec;
        void (async () => {
          try {
            const payload = buildRuntimeApiActionPayload(
              action,
              sharedStateRef.current as Record<string, RuntimeValue>
            );
            if (!payload || !runtimeGuestId) {
              throw new Error('Publish this app before running backend actions.');
            }
            const statePatch = await executePublishedRuntimeAction(appMap, runtimeGuestId, payload);
            setSharedState({ ...payload.nextValues, ...statePatch });
            win?.postMessage({ type: 'runtimeActionResult', requestId, statePatch }, '*');
            if (action.target) {
              setCurrentMomentId(action.target);
            }
          } catch (err) {
            win?.postMessage(
              {
                type: 'runtimeActionResult',
                requestId,
                error: err instanceof Error ? err.message : 'Runtime action failed',
              },
              '*'
            );
          }
        })();
      }
    }
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [appMap, runtimeGuestId, sendComponent]);

  // When screen changes, send new component to the persistent shell
  useEffect(() => {
    if (shellReadyRef.current) {
      sendComponent();
    }
  }, [currentMomentId, sendComponent]);

  // When shared state changes (from stateChange message), push update into iframe
  useEffect(() => {
    const win = iframeRef.current?.contentWindow;
    if (!win || !shellReadyRef.current) return;
    win.postMessage({ type: 'updateState', state: sharedState }, '*');
  }, [sharedState]);

  // Sync canvas activeMomentId → runtime current screen
  useEffect(() => {
    if (activeMomentId && activeMomentId !== currentMomentId) {
      const exists = appMap.moments.some((m) => m.id === activeMomentId);
      if (exists) {
        suppressSyncRef.current = true;
        setCurrentMomentId(activeMomentId);
      }
    }
  }, [activeMomentId, appMap.moments]);

  // Sync runtime navigation → canvas activeMomentId
  useEffect(() => {
    if (suppressSyncRef.current) {
      suppressSyncRef.current = false;
      return;
    }
    if (currentMomentId !== activeMomentId) {
      setActiveMomentId(currentMomentId);
    }
  }, [currentMomentId]);

  // Show preview column if any moment has generated code, static mock, or declarative screenSpec (Pulse demo).
  const hasRuntimePreview = appMap.moments.some(
    (m) => m.componentCode || m.mockHtml || m.screenSpec
  );
  const isBuilding = currentMoment?.buildStatus === 'building';
  // Use direct srcDoc for moments that have mockHtml but no built componentCode
  const useMockHtml = !currentMoment?.componentCode && !!currentMoment?.mockHtml;
  // Never show the spinner over a mockHtml screen — it renders instantly
  const showSpinner = !useMockHtml && (isBuilding || (!iframeReady && !!currentMoment?.componentCode));

  const useScreenSpecFallback =
    !!currentMoment &&
    !currentMoment.componentCode &&
    !currentMoment.mockHtml &&
    !!currentMoment.screenSpec;

  if (!hasRuntimePreview) {
    return platform === 'web' ? (
      <WebEmptyState isBuilding={false} />
    ) : (
      <MobileEmptyState isBuilding={false} phoneWidth={phoneWidth} />
    );
  }

  // After mockHtml navigation (e.g. Start My Plan → foundation), render declarative runtime
  if (useScreenSpecFallback) {
    return (
      <div
        className={
          platform === 'web'
            ? 'flex-[3] min-w-0 border-l border-zinc-800 flex flex-col bg-zinc-950'
            : 'w-[420px] shrink-0 border-l border-zinc-800 flex flex-col bg-zinc-950'
        }
      >
        <div className="flex-1 flex min-h-0 items-center justify-center py-6 overflow-auto">
          <MobileRuntime
            appMap={appMap}
            startMomentId={currentMomentId}
            phoneWidth={platform === 'web' ? 420 : phoneWidth}
            onMomentChange={(id) => {
              if (!id) return;
              suppressSyncRef.current = true;
              setCurrentMomentId(id);
              setActiveMomentId(id);
            }}
          />
        </div>
      </div>
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
          {isBuilding && (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-950 z-10">
              <div className="flex flex-col items-center gap-3">
                <span className="w-5 h-5 rounded-full border-2 border-zinc-700 border-t-indigo-400 animate-spin" />
                <p className="text-zinc-500 text-xs">Building screen...</p>
              </div>
            </div>
          )}
          {useMockHtml ? (
            <iframe
              key={currentMomentId}
              srcDoc={currentMoment!.mockHtml}
              className="w-full h-full border-0 bg-white"
              sandbox="allow-scripts allow-same-origin"
              title="App Runtime"
            />
          ) : (
            <iframe
              ref={iframeRef}
              srcDoc={shellSrcdoc}
              className="w-full h-full border-0 bg-white"
              sandbox="allow-scripts"
              title="App Runtime"
            />
          )}
        </div>
        {showEditor && (
          <EditBar
            appMap={appMap}
            currentMomentId={currentMomentId}
            onEditTargetChange={handleEditTargetChange}
          />
        )}
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
                style={{ height: Math.round(844 * (phoneWidth / 390)) }}
              >
                {showSpinner && (
                  <div className="absolute inset-0 flex items-center justify-center bg-zinc-950 z-10">
                    <div className="flex flex-col items-center gap-3 px-6">
                      <span className="w-5 h-5 rounded-full border-2 border-zinc-700 border-t-indigo-400 animate-spin" />
                      <p className="text-zinc-500 text-xs text-center">
                        {isBuilding ? 'Building screen...' : 'Loading...'}
                      </p>
                    </div>
                  </div>
                )}
                {useMockHtml ? (
                  <iframe
                    key={currentMomentId}
                    srcDoc={currentMoment!.mockHtml}
                    className="border-0 bg-white"
                    sandbox="allow-scripts allow-same-origin"
                    title="App Runtime"
                    style={{
                      width: 390,
                      height: 844,
                      transform: `scale(${phoneWidth / 390})`,
                      transformOrigin: 'top left',
                    }}
                  />
                ) : (
                  <iframe
                    ref={iframeRef}
                    srcDoc={shellSrcdoc}
                    className="border-0 bg-white"
                    sandbox="allow-scripts"
                    title="App Runtime"
                    style={{
                      width: 390,
                      height: 844,
                      transform: `scale(${phoneWidth / 390})`,
                      transformOrigin: 'top left',
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
      {showEditor && (
        <EditBar
          appMap={appMap}
          currentMomentId={currentMomentId}
          onEditTargetChange={handleEditTargetChange}
        />
      )}
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
