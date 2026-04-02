'use client';

import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { toast } from 'sonner';
import { useMomentaiStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Moment } from '@/lib/types';
import { JOURNEY_COLORS } from '@/lib/colors';
import { buildShellSrcdoc } from '@/lib/buildSrcdoc';
import MockFrame from './MockFrame';
import StreamingMockFrame from './StreamingMockFrame';
import MobileRuntime from './runtime/MobileRuntime';

const TYPE_LABELS: Record<string, string> = {
  ui: 'UI Screen', ai: 'AI-Powered', data: 'Data Layer', auth: 'Auth Step',
};

const PHONE_WIDTH = 390;
const PHONE_HEIGHT = 844;

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

  codeRef.current = componentCode;
  stateRef.current = state;

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
    setReady(false);
    if (shellReadyRef.current) {
      sendComponent();
    }
  }, [componentCode, sendComponent]);

  if (platform === 'web') {
    return (
      <div className="w-full rounded-xl overflow-hidden border border-zinc-800 relative" style={{ height: 260 }}>
        <iframe
          ref={iframeRef}
          srcDoc={shellSrcdoc}
          className="w-full h-full border-0 bg-white"
          sandbox="allow-scripts"
          title="Screen Preview"
        />
        {!ready && <PreviewSkeleton scale={260 / PHONE_HEIGHT} />}
      </div>
    );
  }

  const scale = previewWidth / PHONE_WIDTH;
  const visibleHeight = Math.round(PHONE_HEIGHT * scale);

  return (
    <div
      className="bg-zinc-900 rounded-[28px] border-[2px] border-zinc-700 shadow-xl overflow-hidden mx-auto"
      style={{ width: previewWidth }}
    >
      <div className="h-5 bg-zinc-900 flex items-center justify-center">
        <div className="w-12 h-2.5 bg-zinc-800 rounded-b-lg" />
      </div>
      <div className="bg-white overflow-hidden relative" style={{ height: visibleHeight }}>
        <iframe
          ref={iframeRef}
          srcDoc={shellSrcdoc}
          className="border-0 bg-white"
          sandbox="allow-scripts"
          title="Screen Preview"
          style={{
            width: PHONE_WIDTH,
            height: PHONE_HEIGHT,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        />
        {!ready && <PreviewSkeleton scale={scale} />}
      </div>
      <div className="h-4 bg-zinc-900 flex items-center justify-center">
        <div className="w-14 h-1 bg-zinc-600 rounded-full" />
      </div>
    </div>
  );
}

export default function MomentPanel({ moment }: { moment: Moment }) {
  const [editText, setEditText] = useState('');
  const [previewWidth, setPreviewWidth] = useState(200);
  const [editError, setEditError] = useState<string | null>(null);
  const [lastFailedEdit, setLastFailedEdit] = useState<string | null>(null);

  const [promptTemplateText, setPromptTemplateText] = useState(moment.promptTemplate ?? '');
  const [promptTemplateSaved, setPromptTemplateSaved] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    setPromptTemplateText(moment.promptTemplate ?? '');
    setPromptTemplateSaved(false);
    setEditError(null);
  }, [moment.id]);

  const { 
    appMap, 
    selectMoment, 
    updateMoment, 
    setMomentComponentCode, 
    setMomentMock, 
    flaggedMoments, 
    isEditing, 
    setEditing, 
    clearFlag,
    flagMoments,
    batchUpdateMoments,
  } = useMomentaiStore();

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
        }
      }
    }
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [appMap?.moments, selectMoment]);

  useEffect(() => {
    const update = () => {
      if (appMap?.appPlatform === 'web') { setPreviewWidth(420); return; }
      const h = window.innerHeight;
      setPreviewWidth(h <= 800 ? 200 : h <= 960 ? 230 : 260);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [appMap?.appPlatform]);

  const handleApplyEdit = useCallback(async () => {
    if (!editText.trim() || isEditing || !appMap || !journey) return;
    setEditing(true);
    setEditError(null);
    const changeText = editText;
    setEditText('');
    try {
      const res = await fetch('/api/edit-moment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moment, change: changeText, journey, appMap }),
      });
      const result = await res.json();
      
      if (!res.ok) {
        setEditError(result.error || 'Edit failed');
        setLastFailedEdit(changeText);
        toast.error(result.error || 'Edit failed', {
          description: result.suggestion,
        });
        return;
      }
      
      if (result.componentCode) {
        setMomentComponentCode(moment.id, result.componentCode);
      }
      
      // Handle downstream propagation
      if (result.affectedMoments && Object.keys(result.affectedMoments).length > 0) {
        const affectedCount = Object.keys(result.affectedMoments).length;
        flagMoments(result.affectedMoments);
        
        toast.success('Edit applied', {
          description: `${affectedCount} downstream screen${affectedCount > 1 ? 's' : ''} flagged for review`,
        });
        
        // Background: update affected moments
        fetch('/api/propagate-batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: Object.entries(result.affectedMoments).map(([id, reason]) => ({
              moment: appMap.moments.find((m) => m.id === id)!,
              reason,
            })),
            editChange: changeText,
            editedMoment: moment,
            journey,
            appMap,
          }),
        })
          .then((r) => r.json())
          .then((data) => {
            if (data.updates) batchUpdateMoments(data.updates);
          })
          .catch((err) => console.error('Propagation failed:', err));
      } else {
        toast.success('Edit applied');
      }
      
      setLastFailedEdit(null);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Network error';
      setEditError(errMsg);
      setLastFailedEdit(changeText);
      toast.error('Edit failed', { description: errMsg });
      console.error(err);
    } finally {
      setEditing(false);
    }
  }, [editText, isEditing, appMap, journey, moment, setEditing, setMomentComponentCode, flagMoments, batchUpdateMoments]);

  const handleRegenerate = useCallback(async () => {
    if (isRegenerating || isEditing || !appMap) return;
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
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const payload = JSON.parse(line.slice(6));
            if (payload.componentCode) {
              setMomentComponentCode(moment.id, payload.componentCode);
            }
          } catch { /* skip */ }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRegenerating(false);
    }
  }, [isRegenerating, isEditing, appMap, moment, setMomentComponentCode]);

  const previewOverlay = (isEditing || isRegenerating) ? (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-[20px]"
      style={{ background: 'rgba(9,9,11,0.72)', backdropFilter: 'blur(4px)' }}>
      <div className="w-5 h-5 rounded-full border-2 border-zinc-600 border-t-indigo-400 animate-spin" />
      <p className="text-zinc-300 text-[10px] font-medium">{isRegenerating ? 'Regenerating...' : 'Applying edit...'}</p>
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

      {/* ── Scrollable middle: PREVIEW + description + AI prompt ── */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {/* Screen preview — always present with fallbacks */}
        <div className="px-4 py-3">
          <p className="text-zinc-500 text-[10px] font-medium uppercase tracking-wider mb-2">Screen Preview</p>
          <div className="relative flex justify-center">
            {moment.componentCode ? (
              <ComponentPreview
                componentCode={moment.componentCode}
                state={(appMap?.initialState as Record<string, unknown>) ?? {}}
                previewWidth={previewWidth}
                platform={appMap?.appPlatform ?? 'mobile'}
              />
            ) : moment.screenSpec && appMap ? (
              <MobileRuntime
                appMap={appMap}
                startMomentId={moment.id}
                phoneWidth={previewWidth}
                onMomentChange={(id) => { if (id) selectMoment(id); }}
              />
            ) : moment.mockHtml ? (
              <MockFrame key={moment.id} html={moment.mockHtml} width={previewWidth} mode={appMap?.appPlatform ?? 'mobile'} />
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

        {/* Description */}
        <div className="px-4 pb-3">
          <p className="text-zinc-500 text-[10px] font-medium uppercase tracking-wider mb-1">Description</p>
          <p className="text-zinc-400 text-xs leading-relaxed">{moment.description}</p>
        </div>

        {/* AI prompt template — editable */}
        {(moment.type === 'ai' || !!moment.promptTemplate) && (
          <div className="px-4 pb-3">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                <span className="text-violet-400 text-[10px] font-semibold uppercase tracking-wider">AI Prompt</span>
                {promptTemplateSaved && (
                  <span className="text-emerald-500 text-[10px] font-medium ml-auto">Saved</span>
                )}
              </div>
              <textarea
                value={promptTemplateText}
                onChange={(e) => { setPromptTemplateText(e.target.value); setPromptTemplateSaved(false); }}
                className="w-full bg-zinc-950 border border-zinc-700 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 text-zinc-300 text-[10px] font-mono leading-relaxed rounded-lg px-2.5 py-2 resize-none outline-none min-h-[80px] transition-all"
                placeholder="e.g. You are a helpful assistant. Given {{userGoal}}, generate a recommendation."
              />
              <button
                onClick={() => { updateMoment(moment.id, { promptTemplate: promptTemplateText }); setPromptTemplateSaved(true); }}
                disabled={!promptTemplateText.trim() || promptTemplateSaved}
                className="w-full bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 hover:border-violet-500/40 text-violet-400 text-[10px] font-medium py-1.5 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Save Prompt
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Edit bar — ALWAYS visible at the bottom ── */}
      <div className="shrink-0 border-t border-zinc-800 bg-zinc-900/95 backdrop-blur-sm p-3 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-zinc-400 text-[10px] font-medium uppercase tracking-wider">Edit this Moment</p>
          <button
            onClick={handleRegenerate}
            disabled={isRegenerating || isEditing}
            className="flex items-center gap-1 text-[10px] text-zinc-500 hover:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isRegenerating ? (
              <><span className="w-2.5 h-2.5 rounded-full border border-zinc-500 border-t-zinc-300 animate-spin" /> Regenerating...</>
            ) : (
              <>↺ Regenerate</>
            )}
          </button>
        </div>
        
        {editError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 space-y-1.5">
            <p className="text-red-400 text-xs font-medium">{editError}</p>
            {lastFailedEdit && (
              <button
                onClick={() => { setEditText(lastFailedEdit); setEditError(null); setLastFailedEdit(null); }}
                className="text-red-400/80 hover:text-red-300 text-[10px] underline"
              >
                Restore failed edit to try again
              </button>
            )}
          </div>
        )}
        
        <div className="flex gap-2">
          <Textarea
            className="flex-1 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600 resize-none text-xs min-h-[36px] max-h-[80px] focus-visible:ring-indigo-500/40 focus-visible:border-indigo-500/50"
            placeholder="Describe the change you want..."
            value={editText}
            onChange={(e) => { setEditText(e.target.value); setEditError(null); }}
            onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleApplyEdit(); }}
            disabled={isEditing || isRegenerating}
          />
          <Button
            className="shrink-0 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium h-9 px-4 transition-all disabled:opacity-50"
            onClick={handleApplyEdit}
            disabled={!editText.trim() || isEditing || isRegenerating}
          >
            {isEditing ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              </span>
            ) : 'Apply'}
          </Button>
        </div>
        <p className="text-zinc-700 text-[9px] text-center">⌘+Enter to apply</p>
      </div>
    </div>
  );
}
