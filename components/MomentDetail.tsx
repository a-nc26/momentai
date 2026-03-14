'use client';

import { useState, useEffect } from 'react';
import { useMomentaiStore } from '@/lib/store';
import { JOURNEY_COLORS } from '@/lib/colors';
import { Moment } from '@/lib/types';
import MockFrame from './MockFrame';
import StreamingMockFrame from './StreamingMockFrame';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

type StateKey = 'main' | 'loading' | 'error' | 'empty';

const STATE_LABELS: Record<StateKey, string> = {
  main: 'Main',
  loading: 'Loading',
  error: 'Error',
  empty: 'Empty',
};

const STATE_PROMPTS: Record<Exclude<StateKey, 'main'>, string> = {
  loading: 'Show the loading/skeleton state — use shimmer placeholder blocks for content areas, no real data visible',
  error: 'Show an error state — display a clear error message, an icon, and a retry/back action',
  empty: 'Show the empty state — no data yet, with an appropriate illustration placeholder, headline, and a CTA to get started',
};

const TYPE_LABELS: Record<string, string> = {
  ui: 'UI Screen', ai: 'AI-Powered', data: 'Data Layer', auth: 'Auth Step',
};

// Split promptTemplate into labelled segments by blank lines + heuristic labels
function parsePromptSegments(template: string): { label: string; content: string }[] {
  const blocks = template.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  return blocks.map((block) => {
    let label = 'Instructions';
    if (/^you are /i.test(block)) label = 'Persona';
    else if (/^user (profile|state|data|context)/i.test(block)) label = 'User Context';
    else if (/^return (json|only)/i.test(block)) label = 'Output Format';
    else if (/^(app|screen|journey|session):/i.test(block)) label = 'Context';
    return { label, content: block };
  });
}

export default function MomentDetail({ moment }: { moment: Moment }) {
  const [activeTab, setActiveTab] = useState<StateKey>('main');
  // Cache generated state HTMLs so re-clicking a tab doesn't re-fetch
  const [stateHtmls, setStateHtmls] = useState<Partial<Record<StateKey, string>>>({});
  const [editText, setEditText] = useState('');
  const [segments, setSegments] = useState<{ label: string; content: string }[]>([]);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [isCascading, setIsCascading] = useState(false);
  const [cascadeCount, setCascadeCount] = useState(0);

  const {
    appMap,
    updateMoment,
    setMomentMock,
    setDetailMoment,
    addMoments,
    removeEdges,
    flagMoments,
    clearAllFlags,
    batchUpdateMoments,
    flaggedMoments,
    isEditing,
    setEditing,
  } = useMomentaiStore();

  const flagReason = flaggedMoments[moment.id];

  const journeyIndex = appMap?.journeys.findIndex((j) => j.id === moment.journeyId) ?? 0;
  const color = JOURNEY_COLORS[journeyIndex % JOURNEY_COLORS.length];
  const journey = appMap?.journeys.find((j) => j.id === moment.journeyId);

  // Parse prompt segments for AI moments
  useEffect(() => {
    if (moment.type === 'ai' && moment.promptTemplate) {
      setSegments(parsePromptSegments(moment.promptTemplate));
    } else {
      setSegments([]);
    }
  }, [moment.id, moment.promptTemplate]);

  // Reset state cache when switching moments
  useEffect(() => {
    setStateHtmls({});
    setActiveTab('main');
  }, [moment.id]);

  // Body sent to generate-mock for each tab
  const mockBody = (tab: StateKey) => ({
    moment: tab === 'main' ? moment : {
      ...moment,
      preview: `${moment.preview}\n\nSPECIAL STATE TO RENDER: ${STATE_PROMPTS[tab as Exclude<StateKey, 'main'>]}`,
    },
    journey,
    appMap,
  });

  // Connections
  const incomingMoments = (appMap?.edges ?? [])
    .filter((e) => e.target === moment.id)
    .map((e) => appMap?.moments.find((m) => m.id === e.source))
    .filter(Boolean) as Moment[];
  const outgoingMoments = (appMap?.edges ?? [])
    .filter((e) => e.source === moment.id)
    .map((e) => appMap?.moments.find((m) => m.id === e.target))
    .filter(Boolean) as Moment[];

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
      const updated = await res.json();
      const isComplete =
        updated.mockHtml &&
        updated.mockHtml.toLowerCase().includes('<!doctype html') &&
        (updated.mockHtml.toLowerCase().includes('</body>') || updated.mockHtml.toLowerCase().includes('</html>')) &&
        updated.mockHtml.length > 500;
      updateMoment(moment.id, {
        label: updated.label,
        type: updated.type,
        description: updated.description,
        preview: updated.preview,
        mockHtml: isComplete ? updated.mockHtml : moment.mockHtml,
      });
      if (updated.removedEdgeIds?.length) removeEdges(updated.removedEdgeIds);
      if (updated.newMoments?.length) {
        addMoments(updated.newMoments, updated.newEdges ?? []);
        // If new edges rewire branches (new moment → existing branch node), update branchOf
        const newIds = new Set((updated.newMoments as { id: string }[]).map((m) => m.id));
        for (const edge of (updated.newEdges ?? []) as { source: string; target: string }[]) {
          if (!newIds.has(edge.source)) continue;
          const target = appMap.moments.find((m) => m.id === edge.target);
          if (target?.branchOf) updateMoment(target.id, { branchOf: edge.source });
        }
      }
      setStateHtmls({});
      setActiveTab('main');

      // Auto-cascade to all affected downstream moments
      const affectedMoments: Record<string, string> = updated.affectedMoments ?? {};
      const affectedItems = Object.entries(affectedMoments)
        .map(([id, reason]) => ({ moment: appMap.moments.find((m) => m.id === id)!, reason: reason as string }))
        .filter((item) => item.moment);

      if (affectedItems.length > 0) {
        flagMoments(affectedMoments);
        setCascadeCount(affectedItems.length);
        setIsCascading(true);
        fetch('/api/propagate-batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: affectedItems, editChange: changeText, editedMoment: { ...moment, ...updated }, journey, appMap }),
        })
          .then((r) => r.json())
          .then((result) => {
            if (result.updates) batchUpdateMoments(result.updates);
            clearAllFlags();
          })
          .catch(console.error)
          .finally(() => setIsCascading(false));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEditing(false);
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-zinc-950 overflow-hidden">
      {/* Breadcrumb header */}
      <div className="h-12 border-b border-zinc-800 flex items-center px-5 gap-2 shrink-0">
        <button
          onClick={() => setDetailMoment(null)}
          className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 transition-colors text-sm"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Journey Map
        </button>
        <span className="text-zinc-700 text-sm">/</span>
        <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
        <span className="text-zinc-500 text-sm">{journey?.name}</span>
        <span className="text-zinc-700 text-sm">/</span>
        <span className="text-white text-sm font-medium">{moment.label}</span>
        <Badge variant="outline" className="text-[10px] border-zinc-700 text-zinc-500 ml-1">
          {TYPE_LABELS[moment.type] ?? moment.type}
        </Badge>
      </div>

      {/* Two-column body */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left: screen + state tabs */}
        <div className="flex-1 flex flex-col items-center justify-center overflow-y-auto gap-5 py-6">

          {/* State tabs */}
          <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
            {(['main', 'loading', 'error', 'empty'] as StateKey[]).map((state) => (
              <button
                key={state}
                onClick={() => setActiveTab(state)}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === state
                    ? 'bg-zinc-700 text-white'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {STATE_LABELS[state]}
              </button>
            ))}
          </div>

          {/* Screen preview */}
          {activeTab === 'main' ? (
            moment.mockHtml ? (
              // Pre-baked or cached — render instantly
              <div className="relative">
                <MockFrame html={moment.mockHtml} width={300} />
                {isEditing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-[48px]"
                    style={{ background: 'rgba(9,9,11,0.75)', backdropFilter: 'blur(4px)' }}>
                    <div className="w-6 h-6 rounded-full border-2 border-zinc-600 border-t-indigo-400 animate-spin" />
                    <p className="text-zinc-300 text-xs font-medium">Regenerating screen…</p>
                  </div>
                )}
              </div>
            ) : journey ? (
              <StreamingMockFrame
                key={`${moment.id}-main`}
                fetchKey={`${moment.id}:main:${moment.preview ?? ''}`}
                url="/api/generate-mock"
                body={mockBody('main')}
                width={300}
                onComplete={(html) => setMomentMock(moment.id, html)}
              />
            ) : null
          ) : stateHtmls[activeTab] ? (
            // Already generated this session — show cached
            <MockFrame key={`${moment.id}-${activeTab}`} html={stateHtmls[activeTab]!} width={300} />
          ) : journey ? (
            // Stream-generate the state mock, cache on complete
            <StreamingMockFrame
              key={`${moment.id}-${activeTab}`}
              fetchKey={`${moment.id}:${activeTab}:${moment.preview ?? ''}`}
              url="/api/generate-mock"
              body={mockBody(activeTab)}
              width={300}
              onComplete={(html) => setStateHtmls((prev) => ({ ...prev, [activeTab]: html }))}
            />
          ) : null}

        </div>

        {/* Right: description + AI prompt segments + edit */}
        <div className="w-[380px] border-l border-zinc-800 flex flex-col overflow-hidden shrink-0">
          <div className="flex-1 overflow-y-auto">

            {/* Cascade progress indicator */}
            {isCascading && (
              <div className="m-4 flex items-center gap-2 bg-indigo-500/8 border border-indigo-500/20 rounded-xl px-3 py-2.5">
                <span className="w-3 h-3 rounded-full border-2 border-indigo-400/30 border-t-indigo-400 animate-spin shrink-0" />
                <p className="text-indigo-300 text-xs">Cascading changes to {cascadeCount} moment{cascadeCount !== 1 ? 's' : ''}…</p>
              </div>
            )}

            {/* Upstream impact note */}
            {flagReason && !isCascading && (
              <div className="m-4 flex items-start gap-2 bg-amber-500/5 border border-amber-500/20 rounded-xl px-3 py-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1" />
                <p className="text-amber-300/70 text-xs leading-relaxed">{flagReason}</p>
              </div>
            )}

            {/* Description */}
            <div className="p-5">
              <p className="text-zinc-500 text-[10px] font-medium uppercase tracking-wider mb-2">Description</p>
              <p className="text-zinc-300 text-sm leading-relaxed">{moment.description}</p>
            </div>

            {/* Connections */}
            {(incomingMoments.length > 0 || outgoingMoments.length > 0) && (
              <>
                <Separator className="bg-zinc-800" />
                <div className="p-5">
                  <div className="grid grid-cols-2 gap-3">
                    {incomingMoments.length > 0 && (
                      <div>
                        <p className="text-zinc-600 text-[10px] font-medium uppercase tracking-wider mb-2">Comes from</p>
                        <div className="space-y-1.5">
                          {incomingMoments.map((m) => (
                            <button
                              key={m.id}
                              onClick={() => setDetailMoment(m.id)}
                              className="w-full text-left flex items-center gap-2 text-zinc-400 hover:text-white text-xs bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-lg px-3 py-2 transition-all"
                            >
                              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="shrink-0 text-zinc-600">
                                <path d="M7 5H1M7 5L5 3M7 5L5 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              <span className="truncate">{m.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {outgoingMoments.length > 0 && (
                      <div>
                        <p className="text-zinc-600 text-[10px] font-medium uppercase tracking-wider mb-2">Goes to</p>
                        <div className="space-y-1.5">
                          {outgoingMoments.map((m) => (
                            <button
                              key={m.id}
                              onClick={() => setDetailMoment(m.id)}
                              className="w-full text-left flex items-center gap-2 text-zinc-400 hover:text-white text-xs bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-lg px-3 py-2 transition-all"
                            >
                              <span className="truncate">{m.label}</span>
                              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="shrink-0 text-zinc-600 ml-auto">
                                <path d="M3 5h6M9 5L7 3M9 5L7 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* AI Prompt segments — only for ai type */}
            {moment.type === 'ai' && segments.length > 0 && (
              <>
                <Separator className="bg-zinc-800" />
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                    <p className="text-zinc-500 text-[10px] font-medium uppercase tracking-wider">Prompt Segments</p>
                  </div>
                  <p className="text-zinc-600 text-xs mb-4">Each segment is independently editable. Change one without touching the others.</p>
                  <div className="space-y-2">
                    {segments.map((seg, i) => (
                      <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                        <div className="px-3 py-2 flex items-center justify-between border-b border-zinc-800/60">
                          <span
                            className="text-[10px] font-semibold uppercase tracking-wider"
                            style={{
                              color:
                                seg.label === 'Persona' ? '#a78bfa'
                                : seg.label === 'User Context' ? '#34d399'
                                : seg.label === 'Output Format' ? '#fb923c'
                                : '#71717a',
                            }}
                          >
                            {seg.label}
                          </span>
                          <button
                            onClick={() => setEditingIdx(editingIdx === i ? null : i)}
                            className="text-zinc-600 hover:text-zinc-400 text-[10px] transition-colors"
                          >
                            {editingIdx === i ? 'Done' : 'Edit'}
                          </button>
                        </div>
                        {editingIdx === i ? (
                          <textarea
                            className="w-full bg-transparent text-zinc-300 text-[11px] font-mono leading-relaxed p-3 resize-none outline-none"
                            rows={Math.max(3, seg.content.split('\n').length + 1)}
                            value={seg.content}
                            onChange={(e) => {
                              const updated = [...segments];
                              updated[i] = { ...updated[i], content: e.target.value };
                              setSegments(updated);
                            }}
                          />
                        ) : (
                          <pre className="text-zinc-400 text-[11px] leading-relaxed whitespace-pre-wrap font-mono p-3 overflow-x-hidden">{seg.content}</pre>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
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
                  Applying…
                </span>
              ) : 'Apply Edit'}
            </Button>
            <p className="text-zinc-700 text-[10px] text-center">⌘ + Enter to apply</p>
          </div>
        </div>
      </div>
    </div>
  );
}
