'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useMomentaiStore } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Moment } from '@/lib/types';
import { JOURNEY_COLORS } from '@/lib/colors';
import { buildShellSrcdoc } from '@/lib/buildSrcdoc';
import { useMomentEdit } from '@/lib/hooks/useMomentEdit';
import MockFrame from './MockFrame';
import StreamingMockFrame from './StreamingMockFrame';
import MobileRuntime from './runtime/MobileRuntime';
import MomentScreenPicker from './MomentScreenPicker';
import EditComposeTab from './edit/EditComposeTab';
import EditContextTab from './edit/EditContextTab';
import EditHistoryTab from './edit/EditHistoryTab';
import DeviceShell from './preview/DeviceShell';
import { buildDemoPreviewHtml } from '@/lib/demo-preview-html';
import { isGraphInjectedDemoComponentCode } from '@/lib/demo-moment-components';
import { tryLogBuildUsageFromSsePayload } from '@/lib/build-usage-log';

const TYPE_LABELS: Record<string, string> = {
  ui: 'UI Screen', ai: 'AI-Powered', data: 'Data Layer', auth: 'Auth Step',
};

const PHONE_WIDTH = 390;
const PHONE_HEIGHT = 844;
const WEB_PREVIEW_WIDTH = 1280;
const WEB_PREVIEW_HEIGHT = 800;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function PreviewSkeleton({ scale }: { scale: number }) {
  return (
    <div className="absolute inset-0 bg-white flex flex-col z-10" style={{ padding: Math.round(14 * scale) }}>
      <div className="flex justify-between items-center mb-3" style={{ paddingTop: Math.round(6 * scale) }}>
        <div className="rounded" style={{ height: Math.round(6 * scale), width: Math.round(28 * scale), background: '#e4e4e7' }} />
        <div className="rounded" style={{ height: Math.round(6 * scale), width: Math.round(36 * scale), background: '#e4e4e7' }} />
      </div>
      <div className="rounded mb-2" style={{ height: Math.round(14 * scale), width: '65%', background: '#e4e4e7' }} />
      <div className="rounded mb-4" style={{ height: Math.round(9 * scale), width: '45%', background: '#f0f0f2' }} />
      {[0.85, 0.75, 0.9, 0.6].map((w, i) => (
        <div key={i} className="rounded-lg mb-2" style={{ height: Math.round(38 * scale), width: `${w * 100}%`, background: i % 2 === 0 ? '#f4f4f5' : '#efefef' }} />
      ))}
      <div className="flex-1 flex flex-col items-center justify-end pb-3 gap-2">
        <div
          className="rounded-full border-2 border-zinc-200 animate-spin"
          style={{ width: Math.round(16 * scale), height: Math.round(16 * scale), borderTopColor: '#6366f1' }}
        />
        <span style={{ fontSize: Math.round(9 * scale), color: '#71717a', fontWeight: 600 }}>Loading screen...</span>
      </div>
    </div>
  );
}

const SHELL_READY_TIMEOUT_MS = 15_000;

function ComponentPreview({
  componentCode,
  state,
  previewWidth,
  platform,
}: {
  componentCode: string;
  state: Record<string, unknown>;
  previewWidth: number;
  platform: 'mobile' | 'web';
}) {
  const [ready, setReady] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const shellReadyRef = useRef(false);
  const codeRef = useRef(componentCode);
  const stateRef = useRef(state);

  const shellSrcdoc = useMemo(() => buildShellSrcdoc(), []);

  const sendComponent = useCallback(() => {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    win.postMessage({ type: 'loadComponent', code: codeRef.current, state: stateRef.current }, '*');
  }, []);

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
        setReady(true);
      }
    }

    const fallback = window.setTimeout(() => {
      if (!shellReadyRef.current) setReady(true);
    }, SHELL_READY_TIMEOUT_MS);

    window.addEventListener('message', handler);
    return () => {
      window.clearTimeout(fallback);
      window.removeEventListener('message', handler);
    };
  }, [sendComponent]);

  useEffect(() => {
    codeRef.current = componentCode;
    stateRef.current = state;
  }, [componentCode, state]);

  useEffect(() => {
    if (shellReadyRef.current) {
      sendComponent();
    }
  }, [componentCode, state, sendComponent]);

  const isWeb = platform === 'web';
  const baseWidth = isWeb ? WEB_PREVIEW_WIDTH : PHONE_WIDTH;
  const baseHeight = isWeb ? WEB_PREVIEW_HEIGHT : PHONE_HEIGHT;
  const scale = previewWidth / baseWidth;
  const visibleHeight = Math.max(120, Math.round(baseHeight * scale));

  return (
    <DeviceShell
      mode={platform}
      baseWidth={baseWidth}
      screenWidth={previewWidth}
      screenHeight={visibleHeight}
      screenBackground="#fff"
    >
      <iframe
        ref={iframeRef}
        srcDoc={shellSrcdoc}
        className="border-0 bg-white block"
        sandbox="allow-scripts"
        title="Screen Preview"
        scrolling="yes"
        style={{
          width: baseWidth,
          height: baseHeight,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          display: 'block',
        }}
      />
      {!ready && <PreviewSkeleton scale={Math.max(0.35, scale)} />}
    </DeviceShell>
  );
}

export default function MomentPanel({ moment }: { moment: Moment }) {
  const [layoutMode, setLayoutMode] = useState<'editor' | 'preview'>('editor');
  const [previewPaneSize, setPreviewPaneSize] = useState({ width: 0, height: 0 });
  const [isPropagating, setIsPropagating] = useState(false);
  const [cascadeCount, setCascadeCount] = useState(0);
  const [tab, setTab] = useState<'compose' | 'context' | 'history'>('compose');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const previewPaneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTab('compose');
  }, [moment.id]);

  const {
    appMap,
    selectMoment,
    setActiveMomentId,
    setMomentComponentCode,
    setMomentMock,
    flaggedMoments,
    clearFlag,
  } = useMomentaiStore();
  const { isEditingMoment, canUndo, canRedo, undo, redo } = useMomentEdit();
  const isEditing = isEditingMoment(moment.id);

  const flagReason = flaggedMoments[moment.id];
  const journeyIndex = appMap?.journeys.findIndex((j) => j.id === moment.journeyId) ?? 0;
  const color = JOURNEY_COLORS[journeyIndex % JOURNEY_COLORS.length];
  const journey = appMap?.journeys.find((j) => j.id === moment.journeyId);

  // Handle navigation from the preview iframe — select the target moment
  useEffect(() => {
    function handler(e: MessageEvent) {
      if (!e.data) return;
      if (e.data.type === 'navigate' && e.data.momentId) {
        const targetExists = appMap?.moments.some((m) => m.id === e.data.momentId);
        if (targetExists) {
          selectMoment(e.data.momentId);
          setActiveMomentId(e.data.momentId);
        }
      }
    }
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [appMap?.moments, selectMoment, setActiveMomentId]);

  useEffect(() => {
    const node = previewPaneRef.current;
    if (!node) return;

    const update = () => {
      setPreviewPaneSize({ width: node.clientWidth, height: node.clientHeight });
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, [layoutMode, tab]);

  /** In demo, prefer pre-rendered HTML over auto graph components; keep React only for custom/demo-edit code. */
  const useDemoPrebuiltOrFallbackHtml = useMemo(() => {
    if (!appMap?.demoMode || moment.mockHtml) return false;
    return !moment.componentCode || isGraphInjectedDemoComponentCode(moment.componentCode);
  }, [appMap?.demoMode, moment.mockHtml, moment.componentCode]);

  const previewWidth = useMemo(() => {
    const availableWidth = Math.max(0, previewPaneSize.width - 20);
    const availableHeight = Math.max(0, previewPaneSize.height - 20);

    if ((appMap?.appPlatform ?? 'mobile') === 'web') {
      return clamp(Math.floor(availableWidth), 220, 560);
    }

    const maxByWidth = availableWidth;
    const maxByHeight = Math.floor(((availableHeight - 26) * PHONE_WIDTH) / PHONE_HEIGHT);
    const raw = Math.min(maxByWidth, maxByHeight);
    return clamp(
      Math.floor(raw),
      layoutMode === 'preview' ? 190 : 150,
      layoutMode === 'preview' ? 290 : 240
    );
  }, [appMap?.appPlatform, layoutMode, previewPaneSize.height, previewPaneSize.width]);

  // Track cascade state from the edit hook via pendingCascade store slice (single source of truth)
  const pendingCascade = useMomentaiStore((state) => state.pendingCascade);
  useEffect(() => {
    if (pendingCascade && pendingCascade.editedMomentId === moment.id) {
      setIsPropagating(false);
      setCascadeCount(pendingCascade.items.length);
    } else {
      setIsPropagating(false);
      setCascadeCount(0);
    }
  }, [pendingCascade, moment.id]);

  const handleRegenerate = useCallback(async () => {
    if (isRegenerating || isEditing || !appMap || appMap.demoMode) return;
    setIsRegenerating(true);
    try {
      const res = await fetch('/api/build-app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appMap: { ...appMap, moments: [moment] } }),
      });
      if (!res.ok || !res.body) return;
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (value) {
          buffer += decoder.decode(value, { stream: true });
        }
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const payload = JSON.parse(line.slice(6)) as Record<string, unknown>;
            if (payload.status === 'usage') {
              tryLogBuildUsageFromSsePayload(payload);
            } else if (payload.componentCode) {
              setMomentComponentCode(moment.id, String(payload.componentCode));
            }
          } catch { /* skip */ }
        }
        if (done) {
          const tail = buffer + decoder.decode();
          for (const t of tail.split('\n')) {
            const s = t.trim();
            if (!s.startsWith('data: ')) continue;
            try {
              const payload = JSON.parse(s.slice(6)) as Record<string, unknown>;
              if (payload.status === 'usage') {
                tryLogBuildUsageFromSsePayload(payload);
              }
            } catch { /* skip */ }
          }
          break;
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRegenerating(false);
    }
  }, [isRegenerating, isEditing, appMap, moment, setMomentComponentCode]);

  const previewOverlay = (isEditing || isRegenerating || isPropagating) ? (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-[20px]"
      style={{ background: 'rgba(9,9,11,0.72)', backdropFilter: 'blur(4px)' }}>
      <div className="w-5 h-5 rounded-full border-2 border-zinc-600 border-t-indigo-400 animate-spin" />
      <p className="text-zinc-300 text-[10px] font-medium">
        {isRegenerating
          ? 'Regenerating...'
          : isPropagating
            ? `Updating ${cascadeCount} linked screen${cascadeCount === 1 ? '' : 's'}...`
            : 'Applying edit...'}
      </p>
    </div>
  ) : null;

  return (
    <div className="w-[480px] h-full min-h-0 border-l border-zinc-800 bg-zinc-950 flex flex-col overflow-hidden shrink-0">
      {/* ── Header (fixed) ── */}
      <div className="px-4 pt-3 pb-2 shrink-0 border-b border-zinc-800">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
            <span className="text-zinc-500 text-xs font-medium">{journey?.name}</span>
          </div>
          <button
            onClick={() => selectMoment(null)}
            className="text-zinc-600 hover:text-zinc-300 transition-colors w-6 h-6 flex items-center justify-center rounded-md hover:bg-zinc-800"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <h2 className="text-white font-bold text-sm leading-tight">{moment.label}</h2>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="outline" className="text-[9px] border-zinc-700 text-zinc-400">
            {TYPE_LABELS[moment.type] ?? moment.type}
          </Badge>
          {moment.type === 'ai' && (
            <Badge variant="outline" className="text-[9px] border-violet-800 text-violet-400">
              AI-Powered
            </Badge>
          )}
        </div>
      </div>

      {/* ── Downstream flag ── */}
      {flagReason && (
        <div className="mx-4 my-1 shrink-0 flex items-start gap-2 bg-amber-500/5 border border-amber-500/20 rounded-lg px-3 py-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1" />
          <p className="text-amber-300/70 text-[10px] leading-relaxed flex-1">{flagReason}</p>
          <button onClick={() => clearFlag(moment.id)} className="text-amber-500/50 hover:text-amber-400 shrink-0">
            <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
              <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      )}

      <div className="flex-1 min-h-0 px-4 py-2 flex flex-col gap-2 overflow-hidden">
        <div className="shrink-0 flex items-center justify-between gap-2">
          <div className="inline-flex rounded-lg border border-zinc-800 bg-zinc-900/60 p-0.5">
            <button
              type="button"
              onClick={() => setLayoutMode('editor')}
              className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                layoutMode === 'editor'
                  ? 'bg-zinc-700 text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Editor Layout
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode('preview')}
              className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                layoutMode === 'preview'
                  ? 'bg-indigo-600 text-white'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Preview Focus
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={undo}
              disabled={!canUndo || isEditing || isRegenerating}
              className="text-[10px] text-zinc-400 hover:text-white disabled:text-zinc-700"
              title="Undo (⌘Z)"
            >
              Undo
            </button>
            <button
              type="button"
              onClick={redo}
              disabled={!canRedo || isEditing || isRegenerating}
              className="text-[10px] text-zinc-400 hover:text-white disabled:text-zinc-700"
              title="Redo (⌘⇧Z)"
            >
              Redo
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 flex gap-3">
          <div
            ref={previewPaneRef}
            className={`min-h-0 transition-[flex-basis] duration-250 ease-out ${
              layoutMode === 'preview' ? 'basis-[62%]' : 'basis-[44%]'
            } min-w-[150px]`}
          >
            <div className="relative h-full rounded-xl border border-zinc-800 bg-zinc-900/40 p-2 flex items-center justify-center overflow-hidden">
              {moment.mockHtml ? (
                <MockFrame
                  key={moment.id}
                  html={moment.mockHtml}
                  width={previewWidth}
                  mode={appMap?.appPlatform ?? 'mobile'}
                />
              ) : useDemoPrebuiltOrFallbackHtml && appMap ? (
                <MockFrame
                  key={moment.id}
                  html={buildDemoPreviewHtml(moment, appMap)}
                  width={previewWidth}
                  mode={appMap?.appPlatform ?? 'mobile'}
                />
              ) : moment.componentCode ? (
                <ComponentPreview
                  componentCode={moment.componentCode}
                  state={(appMap?.initialState as Record<string, unknown>) ?? {}}
                  previewWidth={previewWidth}
                  platform={appMap?.appPlatform ?? 'mobile'}
                />
              ) : appMap?.demoMode ? (
                <MockFrame
                  key={moment.id}
                  html={buildDemoPreviewHtml(moment, appMap)}
                  width={previewWidth}
                  mode={appMap?.appPlatform ?? 'mobile'}
                />
              ) : moment.screenSpec && appMap ? (
                <MobileRuntime
                  appMap={appMap}
                  startMomentId={moment.id}
                  phoneWidth={previewWidth}
                  onMomentChange={(id) => {
                    if (!id) return;
                    selectMoment(id);
                    setActiveMomentId(id);
                  }}
                />
              ) : journey ? (
                <StreamingMockFrame
                  key={moment.id}
                  fetchKey={`${moment.id}:${moment.preview ?? ''}`}
                  url="/api/generate-mock"
                  body={{ moment, journey, appMap }}
                  width={previewWidth}
                  mode={appMap?.appPlatform ?? 'mobile'}
                  onComplete={(html) => setMomentMock(moment.id, html)}
                />
              ) : (
                <div className="w-full h-40 flex items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800">
                  <p className="text-zinc-600 text-xs">No preview available</p>
                </div>
              )}
              {previewOverlay}
            </div>
          </div>

          <div className="min-w-0 min-h-0 flex-1 flex flex-col overflow-hidden">
            <div className="shrink-0 border border-zinc-800 rounded-lg px-2 py-1.5 bg-zinc-900/40">
              <Tabs value={tab} onValueChange={(value) => setTab(value as typeof tab)}>
                <TabsList>
                  <TabsTrigger value="compose">Compose</TabsTrigger>
                  <TabsTrigger value="context">Context</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="flex-1 min-h-0 pt-2 overflow-hidden">
              {tab === 'compose' && (
                <div className="h-full overflow-y-auto">
                  <EditComposeTab
                    moment={moment}
                    onRegenerate={handleRegenerate}
                    canRegenerate={!!moment.componentCode && !appMap?.demoMode}
                    regenerating={isRegenerating}
                    compact={layoutMode === 'preview'}
                  />
                </div>
              )}
              {tab === 'context' && (
                <div className="h-full overflow-y-auto">
                  <EditContextTab moment={moment} />
                </div>
              )}
              {tab === 'history' && (
                <div className="h-full overflow-y-auto">
                  <EditHistoryTab momentId={moment.id} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {appMap && (
        <div className="shrink-0 border-t border-zinc-800 bg-zinc-900/40 px-4 py-2 flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            Editing:
          </span>
          <div className="min-w-0 flex-1">
            <MomentScreenPicker
              appMap={appMap}
              value={moment.id}
              onChange={(id) => {
                selectMoment(id);
                setActiveMomentId(id);
              }}
              disabled={isEditing || isRegenerating}
              id="moment-panel-screen-picker"
            />
          </div>
        </div>
      )}
    </div>
  );
}
