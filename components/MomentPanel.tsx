'use client';

import { useEffect, useState } from 'react';
import { useMomentaiStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Moment } from '@/lib/types';
import { JOURNEY_COLORS } from '@/lib/colors';
import MockFrame from './MockFrame';
import StreamingMockFrame from './StreamingMockFrame';
import MobileRuntime from './runtime/MobileRuntime';
import { buildSrcdoc } from '@/lib/buildSrcdoc';

function deriveAiInputsOutputs(moment: Moment): { inputs: string; outputs: string } | null {
  const spec = moment.screenSpec;
  if (!spec) return null;

  const inputLabels = spec.components
    .filter((c) => c.type === 'input' || c.type === 'choice-cards' || c.type === 'chip-group')
    .map((c) => ('label' in c && c.label ? c.label : c.type))
    .join(' · ');

  const outputLabels = spec.components
    .filter((c) => c.type === 'notice' || c.type === 'summary-card' || c.type === 'stats-grid' || c.type === 'list')
    .map((c) => ('title' in c && c.title ? c.title : c.type))
    .join(' · ');

  if (!inputLabels && !outputLabels) return null;
  return { inputs: inputLabels || '—', outputs: outputLabels || '—' };
}

const TYPE_LABELS: Record<string, string> = {
  ui: 'UI Screen', ai: 'AI-Powered', data: 'Data Layer', auth: 'Auth Step',
};

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
  const srcdoc = buildSrcdoc(componentCode, state);
  const phoneHeight = Math.round(previewWidth * 1.875);

  if (platform === 'web') {
    return (
      <div className="w-full rounded-xl overflow-hidden border border-zinc-800" style={{ height: 320 }}>
        <iframe
          key={componentCode.slice(0, 40)}
          srcDoc={srcdoc}
          className="w-full h-full border-0 bg-white"
          sandbox="allow-scripts"
          title="Screen Preview"
        />
      </div>
    );
  }

  return (
    <div
      className="bg-zinc-900 rounded-[32px] border-[3px] border-zinc-700 shadow-xl overflow-hidden mx-auto"
      style={{ width: previewWidth }}
    >
      <div className="h-6 bg-zinc-900 flex items-center justify-center">
        <div className="w-14 h-3 bg-zinc-800 rounded-b-lg" />
      </div>
      <div className="bg-white overflow-hidden relative" style={{ height: phoneHeight }}>
        <iframe
          key={componentCode.slice(0, 40)}
          srcDoc={srcdoc}
          className="border-0"
          sandbox="allow-scripts"
          title="Screen Preview"
          style={{
            width: '122%',
            height: '122%',
            transform: 'scale(0.82)',
            transformOrigin: 'top left',
          }}
        />
      </div>
      <div className="h-5 bg-zinc-900 flex items-center justify-center">
        <div className="w-16 h-1 bg-zinc-600 rounded-full" />
      </div>
    </div>
  );
}

export default function MomentPanel({ moment }: { moment: Moment }) {
  const [editText, setEditText] = useState('');
  const [mockVersion, setMockVersion] = useState(0);
  const [showAiDetails, setShowAiDetails] = useState(moment.type === 'ai');
  const [previewWidth, setPreviewWidth] = useState(165);

  const [isCascading, setIsCascading] = useState(false);
  const [cascadeCount, setCascadeCount] = useState(0);
  const [promptTemplateText, setPromptTemplateText] = useState(moment.promptTemplate ?? '');
  const [promptTemplateSaved, setPromptTemplateSaved] = useState(false);

  useEffect(() => {
    setShowAiDetails(moment.type === 'ai');
    setPromptTemplateText(moment.promptTemplate ?? '');
    setPromptTemplateSaved(false);
  }, [moment.id]);

  const { appMap, selectMoment, updateMoment, updateAppRuntime, setMomentMock, setMomentComponentCode, addMoments, removeEdges, flagMoments, clearAllFlags, clearFlag, batchUpdateMoments, flaggedMoments, isEditing, setEditing } =
    useMomentaiStore();

  const flagReason = flaggedMoments[moment.id];
  const journeyIndex = appMap?.journeys.findIndex((j) => j.id === moment.journeyId) ?? 0;
  const color = JOURNEY_COLORS[journeyIndex % JOURNEY_COLORS.length];
  const journey = appMap?.journeys.find((j) => j.id === moment.journeyId);

  useEffect(() => {
    const updatePreviewWidth = () => {
      if (appMap?.appPlatform === 'web') {
        // Web: fill the panel width for a landscape browser preview
        setPreviewWidth(460);
        return;
      }
      // Mobile: scale with screen height
      const h = window.innerHeight;
      if (h <= 760) {
        setPreviewWidth(240);
      } else if (h <= 860) {
        setPreviewWidth(270);
      } else {
        setPreviewWidth(300);
      }
    };
    updatePreviewWidth();
    window.addEventListener('resize', updatePreviewWidth);
    return () => window.removeEventListener('resize', updatePreviewWidth);
  }, [appMap?.appPlatform]);

  const handleApplyEdit = async () => {
    if (!editText.trim() || isEditing || !appMap || !journey) return;
    setEditing(true);
    const changeText = editText;
    setEditText('');
    try {
      const res = await fetch('/api/edit-moment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moment, change: changeText, journey, appMap }),
      });
      const result = await res.json();
      if (result.componentCode) {
        setMomentComponentCode(moment.id, result.componentCode);
      }
      setMockVersion((v) => v + 1);
    } catch (err) {
      console.error(err);
    } finally {
      setEditing(false);
    }
  };

  return (
    <div className="w-[500px] h-full min-h-0 border-l border-zinc-800 bg-zinc-950 flex flex-col overflow-hidden shrink-0">
      {/* Header */}
      <div className="px-4 pt-3 pb-2 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
            <span className="text-zinc-500 text-xs font-medium">{journey?.name}</span>
          </div>
          <button
            onClick={() => selectMoment(null)}
            className="text-zinc-600 hover:text-zinc-300 transition-colors w-6 h-6 flex items-center justify-center rounded-md hover:bg-zinc-800"
            aria-label="Close"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <h2 className="text-white font-bold text-base leading-tight mb-1.5">{moment.label}</h2>
        <Badge variant="outline" className="text-[9px] border-zinc-700 text-zinc-400">
          {TYPE_LABELS[moment.type] ?? moment.type}
        </Badge>
      </div>

      <Separator className="bg-zinc-800 shrink-0" />

      {/* Cascade progress indicator */}
      {isCascading && (
        <div className="mx-4 mt-2 shrink-0 flex items-center gap-2 bg-indigo-500/8 border border-indigo-500/20 rounded-xl px-3 py-2">
          <span className="w-3 h-3 rounded-full border-2 border-indigo-400/30 border-t-indigo-400 animate-spin shrink-0" />
          <p className="text-indigo-300 text-xs">Cascading changes to {cascadeCount} moment{cascadeCount !== 1 ? 's' : ''}…</p>
        </div>
      )}

      {/* Downstream impact note — persists until user dismisses */}
      {flagReason && !isCascading && (
        <div className="mx-4 mt-2 shrink-0 flex items-start gap-2 bg-amber-500/5 border border-amber-500/20 rounded-xl px-3 py-2">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
          <p className="text-amber-300/70 text-xs leading-relaxed flex-1">{flagReason}</p>
          <button
            onClick={() => clearFlag(moment.id)}
            className="text-amber-500/50 hover:text-amber-400 transition-colors shrink-0 ml-1"
            aria-label="Dismiss"
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      )}

      {/* Sticky preview */}
      <div className="shrink-0 p-4 border-b border-zinc-900 bg-zinc-950">
        <p className="text-zinc-500 text-[10px] font-medium uppercase tracking-wider mb-3">Screen Preview</p>

        {moment.componentCode ? (
          // Generated React component — iframe sandbox preview
          <div className="relative flex justify-center">
            <ComponentPreview
              key={`${moment.id}-${mockVersion}`}
              componentCode={moment.componentCode}
              state={(appMap?.initialState as Record<string, unknown>) ?? {}}
              previewWidth={previewWidth}
              platform={appMap?.appPlatform ?? 'mobile'}
            />
            {isEditing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-[20px]"
                style={{ background: 'rgba(9,9,11,0.72)', backdropFilter: 'blur(4px)' }}>
                <div className="w-6 h-6 rounded-full border-2 border-zinc-600 border-t-indigo-400 animate-spin" />
                <p className="text-zinc-300 text-xs font-medium">Regenerating…</p>
              </div>
            )}
          </div>
        ) : moment.screenSpec && appMap ? (
          <div className="relative flex justify-center">
            <MobileRuntime
              appMap={appMap}
              startMomentId={moment.id}
              phoneWidth={previewWidth}
              onMomentChange={(id) => { if (id) selectMoment(id); }}
            />
            {isEditing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-[20px]"
                style={{ background: 'rgba(9,9,11,0.72)', backdropFilter: 'blur(4px)' }}>
                <div className="w-6 h-6 rounded-full border-2 border-zinc-600 border-t-indigo-400 animate-spin" />
                <p className="text-zinc-300 text-xs font-medium">Regenerating moment...</p>
              </div>
            )}
          </div>
        ) : moment.mockHtml ? (
          <div className="relative">
            <MockFrame key={`${moment.id}-${mockVersion}`} html={moment.mockHtml} width={previewWidth} mode={appMap?.appPlatform ?? 'mobile'} />
            {isEditing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-[18px]"
                style={{ background: 'rgba(9,9,11,0.75)', backdropFilter: 'blur(4px)' }}>
                <div className="w-6 h-6 rounded-full border-2 border-zinc-600 border-t-indigo-400 animate-spin" />
                <p className="text-zinc-300 text-xs font-medium">Regenerating moment…</p>
              </div>
            )}
          </div>
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
        ) : null}
        <p className="text-zinc-600 text-[10px] text-center mt-3">Scroll inside the phone to test the flow</p>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {/* Description */}
        <div className="px-5 pt-5 pb-5">
          <p className="text-zinc-500 text-[10px] font-medium uppercase tracking-wider mb-2">Description</p>
          <p className="text-zinc-400 text-sm leading-relaxed">{moment.description}</p>
        </div>

        {/* AI Implementation */}
        {(moment.type === 'ai' || !!moment.promptTemplate) && (
          <div className="px-5 pb-5">
            <button onClick={() => setShowAiDetails((v) => !v)} className="w-full flex items-center justify-between group">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                <p className="text-zinc-500 text-[10px] font-medium uppercase tracking-wider">AI Implementation</p>
              </div>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
                className={`text-zinc-600 group-hover:text-zinc-400 transition-all ${showAiDetails ? 'rotate-180' : ''}`}>
                <path d="M1 3l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {showAiDetails && (() => {
              const aiIO = deriveAiInputsOutputs(moment);
              return (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2">
                    <span className="text-zinc-500 text-[10px] font-medium uppercase tracking-wider">Model</span>
                    <span className="text-violet-400 text-xs font-mono">claude-sonnet-4-6</span>
                  </div>
                  {aiIO && (
                    <>
                      <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <div className="w-1 h-1 rounded-full bg-emerald-500" />
                          <span className="text-zinc-500 text-[10px] font-medium uppercase tracking-wider">Inputs</span>
                        </div>
                        <p className="text-zinc-300 text-xs leading-relaxed">{aiIO.inputs}</p>
                      </div>
                      <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <div className="w-1 h-1 rounded-full bg-sky-500" />
                          <span className="text-zinc-500 text-[10px] font-medium uppercase tracking-wider">Outputs</span>
                        </div>
                        <p className="text-zinc-300 text-xs leading-relaxed">{aiIO.outputs}</p>
                      </div>
                    </>
                  )}
                  <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1 h-1 rounded-full bg-amber-500" />
                        <span className="text-zinc-500 text-[10px] font-medium uppercase tracking-wider">Prompt Template</span>
                      </div>
                      {promptTemplateSaved && (
                        <span className="text-emerald-500 text-[10px] font-medium">Saved ✓</span>
                      )}
                    </div>
                    <textarea
                      value={promptTemplateText}
                      onChange={(e) => { setPromptTemplateText(e.target.value); setPromptTemplateSaved(false); }}
                      className="w-full bg-zinc-950 border border-zinc-700 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 text-zinc-300 text-[10px] font-mono leading-relaxed rounded-lg px-2.5 py-2 resize-none outline-none min-h-[100px] transition-all"
                      placeholder={`e.g. You are a helpful assistant. Given {{userGoal}} and {{preferences}}, generate a personalized recommendation.\n\nUse {{stateKey}} to reference app state values.`}
                    />
                    <button
                      onClick={() => { updateMoment(moment.id, { promptTemplate: promptTemplateText }); setPromptTemplateSaved(true); }}
                      disabled={!promptTemplateText.trim() || promptTemplateSaved}
                      className="mt-2 w-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 hover:border-amber-500/40 text-amber-400 text-[10px] font-medium py-1.5 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Save Prompt
                    </button>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className="w-1 h-1 rounded-full bg-orange-500" />
                      <span className="text-zinc-500 text-[10px] font-medium uppercase tracking-wider">API Call</span>
                    </div>
                    <pre className="text-zinc-400 text-[10px] leading-relaxed font-mono">{`client.messages.create({
  model: "claude-sonnet-4-6",
  max_tokens: 2048,
  messages: [{ role: "user", content: prompt }]
})`}</pre>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      <Separator className="bg-zinc-800 shrink-0" />

      {/* Edit */}
      <div className="p-5 shrink-0 space-y-3">
        <p className="text-zinc-500 text-[10px] font-medium uppercase tracking-wider">Edit this Moment</p>
        <Textarea
          className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 resize-none text-sm min-h-[80px] focus-visible:ring-indigo-500/40 focus-visible:border-indigo-500/50"
          placeholder="e.g. Add a dark mode toggle, make the button red, add a search bar..."
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleApplyEdit(); }}
          disabled={isEditing}
        />
        <Button
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium h-10 transition-all disabled:opacity-50"
          onClick={handleApplyEdit}
          disabled={!editText.trim() || isEditing}
        >
          {isEditing ? (
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Applying...
            </span>
          ) : 'Apply Edit'}
        </Button>
        <p className="text-zinc-700 text-[10px] text-center">⌘ + Enter to apply</p>
      </div>
    </div>
  );
}
