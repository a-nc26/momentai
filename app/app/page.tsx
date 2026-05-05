'use client';

import { useEffect, Suspense, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { useMomentaiStore } from '@/lib/store';
import AppPreMapGate from '@/components/AppPreMapGate';
import Canvas from '@/components/Canvas';
import MomentPanel from '@/components/MomentPanel';
import ReactRuntime from '@/components/runtime/ReactRuntime';
import CascadeReviewPanel from '@/components/edit/CascadeReviewPanel';
import SessionLogDialog from '@/components/SessionLogDialog';
import { createFreshDemoMap } from '@/lib/demo';
import { initSessionLog, sessionLog } from '@/lib/session-log';
import { tryLogBuildUsageFromSsePayload } from '@/lib/build-usage-log';
import { createProject, updateProject } from '@/lib/projects';
import { clearDemoEditConsumed } from '@/lib/demo-edit-session';

function DemoLoader() {
  const params = useSearchParams();
  const demo = params.get('demo');
  const hasHydrated = useMomentaiStore((s) => s.hasHydrated);
  const setAppMap = useMomentaiStore((s) => s.setAppMap);
  // Persisted `appMap` rehydrates after first paint; applying the demo before that would be
  // overwritten by zustand-persist, so the canvas stayed empty / Prompt until refresh.
  useEffect(() => {
    if (!hasHydrated) return;
    if (demo === 'true') {
      setAppMap(createFreshDemoMap());
    }
  }, [hasHydrated, demo, setAppMap]);
  return null;
}

function ShareModal({
  url,
  onClose,
}: {
  url: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(() => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [url]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-400 font-medium mb-1">Live</p>
            <h2 className="text-lg font-semibold text-white">Your app is ready</h2>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 text-xl leading-none">×</button>
        </div>

        <p className="text-sm text-zinc-400 mb-4">
          Share this link with anyone. They can open and use the app immediately — no login required.
        </p>

        <div className="flex gap-2">
          <input
            readOnly
            value={url}
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-300 font-mono truncate"
          />
          <button
            onClick={copy}
            className="shrink-0 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-700 hover:border-zinc-500 px-4 py-2.5 text-sm text-zinc-300 hover:text-white transition-all"
        >
          Open app
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  );
}

export default function AppPage() {
  const router = useRouter();
  const {
    appMap,
    selectedMomentId,
    reset,
    setAppMap,
    hasHydrated,
    builtAppUrl,
    setBuiltAppUrl,
    activeProjectId,
    setActiveProjectId,
    setMomentComponentCode,
    setMomentBuildStatus,
  } = useMomentaiStore();

  const [isBuilding, setIsBuilding] = useState(false);
  const [buildError, setBuildError] = useState<string | null>(null);
  const [buildProgress, setBuildProgress] = useState({ done: 0, total: 0 });
  const [showShareModal, setShowShareModal] = useState(false);
  const [savedPulse, setSavedPulse] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  /** Large live preview column — hidden by default to reduce clutter; toggle via header. */
  const [showDemoPanel, setShowDemoPanel] = useState(false);
  const [sessionLogOpen, setSessionLogOpen] = useState(false);
  const [builderCredits, setBuilderCredits] = useState<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    initSessionLog();
  }, []);

  const validAppMap =
    appMap &&
    Array.isArray(appMap.journeys) &&
    Array.isArray(appMap.moments) &&
    Array.isArray(appMap.edges)
      ? appMap
      : null;
  const selectedMoment = validAppMap?.moments.find((m) => m.id === selectedMomentId) ?? null;
  const isDemoMap = !!validAppMap?.demoMode;

  useEffect(() => {
    if (!validAppMap || isDemoMap) {
      setBuilderCredits(null);
      return;
    }
    let cancelled = false;
    fetch('/api/build-access')
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (d.mode === 'credits' && typeof d.credits === 'number') {
          setBuilderCredits(d.credits);
        } else {
          setBuilderCredits(null);
        }
      })
      .catch(() => {
        if (!cancelled) setBuilderCredits(null);
      });
    return () => {
      cancelled = true;
    };
  }, [validAppMap, isDemoMap]);

  const handleSave = useCallback(() => {
    if (!validAppMap) return;
    if (activeProjectId) {
      updateProject(activeProjectId, { appMap: validAppMap, builtAppUrl: builtAppUrl ?? undefined });
    } else {
      const project = createProject(validAppMap, builtAppUrl ?? undefined);
      setActiveProjectId(project.id);
    }
    setSavedPulse(true);
    setTimeout(() => setSavedPulse(false), 2000);
  }, [validAppMap, activeProjectId, builtAppUrl, setActiveProjectId]);

  const handleBuild = useCallback(async () => {
    if (!validAppMap || isBuilding || validAppMap.demoMode) return;
    setIsBuilding(true);
    setBuildError(null);

    const screensToGenerate = validAppMap.moments.filter((m) => !m.parentMomentId);
    setBuildProgress({ done: 0, total: screensToGenerate.length });

    for (const moment of screensToGenerate) {
      setMomentBuildStatus(moment.id, 'building');
    }

    try {
      abortRef.current = new AbortController();
      const res = await fetch('/api/build-app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appMap: validAppMap }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const data = await res.json();
        const err = data.error ?? 'Build failed';
        setBuildError(err);
        sessionLog('build', 'build-app failed', { error: err }, 'error');
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let completedCount = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const payload = JSON.parse(line.slice(6)) as Record<string, unknown>;
            if (payload.status === 'usage') {
              tryLogBuildUsageFromSsePayload(payload);
            } else if (payload.status === 'done' && payload.momentId) {
              if (payload.componentCode) {
                setMomentComponentCode(String(payload.momentId), String(payload.componentCode));
              } else {
                setMomentBuildStatus(String(payload.momentId), 'error');
              }
            } else if (payload.status === 'error' && payload.momentId) {
              setMomentBuildStatus(String(payload.momentId), 'error');
            }
            if (payload.status === 'done' || payload.status === 'error') {
              completedCount++;
            }
            setBuildProgress({ done: completedCount, total: screensToGenerate.length });
          } catch {
            // skip malformed SSE line
          }
        }
      }

      const tail = buffer + decoder.decode();
      for (const line of tail.split('\n')) {
        const t = line.trim();
        if (!t.startsWith('data: ')) continue;
        try {
          const payload = JSON.parse(t.slice(6)) as Record<string, unknown>;
          if (payload.status === 'usage') {
            tryLogBuildUsageFromSsePayload(payload);
          } else if (payload.status === 'done' && payload.momentId) {
            if (payload.componentCode) {
              setMomentComponentCode(String(payload.momentId), String(payload.componentCode));
            } else {
              setMomentBuildStatus(String(payload.momentId), 'error');
            }
            completedCount++;
            setBuildProgress({ done: completedCount, total: screensToGenerate.length });
          } else if (payload.status === 'error' && payload.momentId) {
            setMomentBuildStatus(String(payload.momentId), 'error');
            completedCount++;
            setBuildProgress({ done: completedCount, total: screensToGenerate.length });
          }
        } catch {
          /* skip */
        }
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        const msg = err instanceof Error ? err.message : 'Build failed';
        setBuildError(msg);
        sessionLog('build', 'build-app exception', { message: msg }, 'error');
      }
    } finally {
      // Stuck "Building" on cards when HTTP fails, stream drops, or a screen has no result payload.
      const { appMap: m, setMomentBuildStatus: setStatus } = useMomentaiStore.getState();
      if (m) {
        for (const s of m.moments) {
          if (s.buildStatus === 'building') setStatus(s.id, 'error');
        }
      }
      setIsBuilding(false);
      abortRef.current = null;
      void fetch('/api/build-access')
        .then((r) => r.json())
        .then((d) => {
          if (d.mode === 'credits' && typeof d.credits === 'number') {
            setBuilderCredits(d.credits);
          }
        })
        .catch(() => {});
    }
  }, [validAppMap, isBuilding, setMomentComponentCode, setMomentBuildStatus]);

  const handlePublish = useCallback(async () => {
    if (!validAppMap || isPublishing) return;
    setIsPublishing(true);
    setPublishError(null);
    try {
      const res = await fetch('/api/runtime/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appMap: validAppMap }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Publish failed');

      const backend = data.backend as NonNullable<typeof validAppMap.backend>;
      const nextMap = { ...validAppMap, backend };
      const url = `${window.location.origin}/run/${backend.appId}?t=${encodeURIComponent(backend.publishToken ?? '')}`;

      setAppMap(nextMap);
      setBuiltAppUrl(url);
      if (activeProjectId) {
        updateProject(activeProjectId, { appMap: nextMap, builtAppUrl: url });
      }
      setShowShareModal(true);
    } catch (err) {
      setPublishError(err instanceof Error ? err.message : 'Publish failed');
    } finally {
      setIsPublishing(false);
    }
  }, [activeProjectId, isPublishing, setAppMap, setBuiltAppUrl, validAppMap]);

  const handleExport = useCallback(async () => {
    if (!validAppMap || isExporting) return;
    setIsExporting(true);
    try {
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appMap: validAppMap }),
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const slug = validAppMap.appName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'my-app';
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${slug}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('[export]', err);
    } finally {
      setIsExporting(false);
    }
  }, [validAppMap, isExporting]);

  if (!hasHydrated) {
    return (
      <div className="h-screen w-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-zinc-400 text-sm">
          <span className="w-4 h-4 rounded-full border-2 border-zinc-700 border-t-indigo-400 animate-spin" />
          Restoring your project...
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-zinc-950 overflow-hidden">
      <Suspense>
        <DemoLoader />
      </Suspense>

      {showShareModal && builtAppUrl && (
        <ShareModal url={builtAppUrl} onClose={() => setShowShareModal(false)} />
      )}

      <SessionLogDialog open={sessionLogOpen} onOpenChange={setSessionLogOpen} />

      {/* Header */}
      <header className="h-13 border-b border-zinc-800 flex items-center px-5 gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-indigo-500" />
          <span className="text-white font-semibold text-sm tracking-tight">Momentum</span>
        </div>
        {validAppMap && (
          <>
            <span className="text-zinc-700">/</span>
            <span className="text-zinc-400 text-sm truncate max-w-xs">{validAppMap.appName}</span>
            {builderCredits != null && (
              <span className="text-[10px] text-zinc-500 border border-zinc-800 rounded-full px-2 py-0.5 shrink-0">
                {builderCredits} credits
              </span>
            )}
            <div className="flex-1" />

            {(buildError || publishError) && (
              <span className="text-xs text-red-400 max-w-xs truncate">{buildError || publishError}</span>
            )}

            {isBuilding && (
              <span className="text-xs text-zinc-500">
                {buildProgress.done}/{buildProgress.total} screens
              </span>
            )}

            <button
              type="button"
              onClick={() => setShowDemoPanel((v) => !v)}
              className={`text-xs px-3 py-1.5 rounded-lg transition-all border ${
                showDemoPanel
                  ? 'border-indigo-500 bg-indigo-500/15 text-indigo-200'
                  : 'border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {showDemoPanel ? 'Hide demo' : 'Demo'}
            </button>

            {isDemoMap && (
              <button
                type="button"
                onClick={() => {
                  clearDemoEditConsumed();
                  setAppMap(createFreshDemoMap());
                }}
                className="text-xs px-3 py-1.5 rounded-lg border border-amber-700/60 bg-amber-500/10 text-amber-200/90 hover:bg-amber-500/15 hover:border-amber-600"
                title="Restore the original Pulse demo map (removes demo edit, AI Debrief node, and cascade changes)"
              >
                Reset demo
              </button>
            )}

            <button
              type="button"
              onClick={() => setSessionLogOpen(true)}
              className="text-xs border border-zinc-700 hover:border-zinc-500 px-3 py-1.5 rounded-lg transition-all text-zinc-400 hover:text-zinc-200"
            >
              Session log
            </button>

            <button
              onClick={handleSave}
              className="text-xs border border-zinc-700 hover:border-zinc-500 px-3 py-1.5 rounded-lg transition-all"
              style={{ color: savedPulse ? '#34d399' : undefined }}
            >
              {savedPulse ? 'Saved' : 'Save'}
            </button>

            {builtAppUrl && !isBuilding && (
              <button
                onClick={() => setShowShareModal(true)}
                className="text-emerald-400 hover:text-emerald-300 text-xs border border-emerald-800 hover:border-emerald-600 px-3 py-1.5 rounded-lg transition-all"
              >
                View live app
              </button>
            )}

            {!isDemoMap && (
              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="text-emerald-300 text-xs border border-emerald-700 bg-emerald-500/10 hover:bg-emerald-500/15 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
              >
                {isPublishing && (
                  <span className="w-3 h-3 rounded-full border-2 border-emerald-200/30 border-t-emerald-200 animate-spin" />
                )}
                {validAppMap.backend?.appId ? 'Republish backend' : 'Publish backend'}
              </button>
            )}

            {!isDemoMap && (
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="text-zinc-300 text-xs border border-zinc-600 hover:border-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
                title="Download a Next.js project you own"
              >
                {isExporting && (
                  <span className="w-3 h-3 rounded-full border-2 border-zinc-400/30 border-t-zinc-300 animate-spin" />
                )}
                {isExporting ? 'Exporting…' : 'Export code'}
              </button>
            )}

            {!isDemoMap && (
              <button
                onClick={handleBuild}
                disabled={isBuilding}
                className="text-white text-xs border border-indigo-600 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
              >
                {isBuilding && (
                  <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                )}
                {isBuilding ? 'Building…' : validAppMap.moments.some((m) => m.componentCode) ? 'Rebuild' : 'Build & Share'}
              </button>
            )}

            <button
              onClick={() => router.push('/projects')}
              className="text-zinc-500 hover:text-zinc-300 text-xs border border-zinc-800 hover:border-zinc-600 px-3 py-1.5 rounded-lg transition-all"
            >
              My Projects
            </button>
            <button
              onClick={() => { reset(); router.push('/app'); }}
              className="text-zinc-500 hover:text-zinc-300 text-xs border border-zinc-800 hover:border-zinc-600 px-3 py-1.5 rounded-lg transition-all"
            >
              New App
            </button>
          </>
        )}
      </header>

      {/* Main */}
      <div className="flex-1 flex overflow-hidden">
        {!validAppMap ? (
          <AppPreMapGate />
        ) : (
          <>
            <div className="flex-1 min-w-0 relative">
              <Canvas />
            </div>
            {showDemoPanel && <ReactRuntime appMap={validAppMap} />}
            {selectedMoment && <MomentPanel moment={selectedMoment} />}
            <CascadeReviewPanel />
          </>
        )}
      </div>
    </div>
  );
}
