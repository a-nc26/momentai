'use client';

import { useState, useEffect, useMemo } from 'react';
import { useMomentaiStore } from '@/lib/store';
import { JOURNEY_COLORS } from '@/lib/colors';
import { Moment } from '@/lib/types';
import MockFrame from './MockFrame';
import StreamingMockFrame from './StreamingMockFrame';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import MobileRuntime from './runtime/MobileRuntime';

type StateKey = 'main' | 'loading' | 'error' | 'empty';

const STATE_LABELS: Record<StateKey, string> = {
  main: 'Screen',
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
  ui: 'UI Screen',
  ai: 'AI-Powered',
  data: 'Data Layer',
  auth: 'Auth Step',
};

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

function sortMomentsByFlowOrder(a: Moment, b: Moment) {
  if (a.position.y !== b.position.y) return a.position.y - b.position.y;
  return a.position.x - b.position.x;
}

function buildAncestorChain(moment: Moment, allMoments: Moment[]) {
  const byId = new Map(allMoments.map((entry) => [entry.id, entry]));
  const ancestors: Moment[] = [];
  let currentParentId = moment.parentMomentId;

  while (currentParentId) {
    const parent = byId.get(currentParentId);
    if (!parent) break;
    ancestors.unshift(parent);
    currentParentId = parent.parentMomentId;
  }

  return ancestors;
}

export default function MomentDetail({ moment }: { moment: Moment }) {
  const [activeState, setActiveState] = useState<StateKey>('main');
  const [previewWidth, setPreviewWidth] = useState(340);
  const [stateHtmls, setStateHtmls] = useState<Partial<Record<StateKey, string>>>({});
  const [editText, setEditText] = useState('');
  const [segments, setSegments] = useState<{ label: string; content: string }[]>([]);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [isCascading, setIsCascading] = useState(false);
  const [cascadeCount, setCascadeCount] = useState(0);

  const {
    appMap,
    updateMoment,
    updateAppRuntime,
    setMomentMock,
    setDetailMoment,
    addMoments,
    removeEdges,
    flagMoments,
    clearFlag,
    batchUpdateMoments,
    flaggedMoments,
    isEditing,
    setEditing,
  } = useMomentaiStore();

  const allMoments = appMap?.moments ?? [];
  const journeyIndex = appMap?.journeys.findIndex((j) => j.id === moment.journeyId) ?? 0;
  const color = JOURNEY_COLORS[journeyIndex % JOURNEY_COLORS.length];
  const journey = appMap?.journeys.find((j) => j.id === moment.journeyId);
  const flagReason = flaggedMoments[moment.id];
  const supportsLegacyStateTabs = !moment.screenSpec;
  const availablePreviewStates: StateKey[] = supportsLegacyStateTabs
    ? ['main', 'loading', 'error', 'empty']
    : ['main'];

  const ancestorChain = useMemo(
    () => buildAncestorChain(moment, allMoments),
    [moment, allMoments]
  );

  const parentMoment = ancestorChain[ancestorChain.length - 1] ?? null;

  const directChildMoments = useMemo(
    () =>
      allMoments
        .filter((entry) => entry.parentMomentId === moment.id)
        .sort(sortMomentsByFlowOrder),
    [allMoments, moment.id]
  );

  const flowContainer = parentMoment ?? (directChildMoments.length > 0 ? moment : null);

  const flowChildMoments = useMemo(
    () =>
      flowContainer
        ? allMoments
            .filter((entry) => entry.parentMomentId === flowContainer.id)
            .sort(sortMomentsByFlowOrder)
        : [],
    [allMoments, flowContainer]
  );

  const flowEntries = flowContainer
    ? [
        { moment: flowContainer, kind: 'overview' as const },
        ...flowChildMoments.map((entry, index) => ({
          moment: entry,
          kind: 'step' as const,
          index: index + 1,
        })),
      ]
    : [];

  const hasFlowNavigator = flowEntries.length > 1;
  const currentFlowIndex = flowEntries.findIndex((entry) => entry.moment.id === moment.id);

  useEffect(() => {
    const updatePreviewWidth = () => {
      if (appMap?.appPlatform === 'web') {
        // Web: wider browser frame for the detail view
        setPreviewWidth(700);
        return;
      }
      // Mobile: scale with screen height
      const h = window.innerHeight;
      if (h <= 760) {
        setPreviewWidth(300);
      } else if (h <= 900) {
        setPreviewWidth(340);
      } else {
        setPreviewWidth(380);
      }
    };
    updatePreviewWidth();
    window.addEventListener('resize', updatePreviewWidth);
    return () => window.removeEventListener('resize', updatePreviewWidth);
  }, [appMap?.appPlatform]);

  useEffect(() => {
    if (moment.type === 'ai' && moment.promptTemplate) {
      setSegments(parsePromptSegments(moment.promptTemplate));
    } else {
      setSegments([]);
    }
  }, [moment.id, moment.promptTemplate, moment.type]);

  useEffect(() => {
    setStateHtmls({});
    setActiveState('main');
  }, [moment.id]);

  const mockBody = (state: StateKey) => ({
    moment: state === 'main'
      ? moment
      : {
          ...moment,
          preview: `${moment.preview}\n\nSPECIAL STATE TO RENDER: ${STATE_PROMPTS[state as Exclude<StateKey, 'main'>]}`,
        },
    journey,
    appMap,
  });

  const incomingMoments = (appMap?.edges ?? [])
    .filter((edge) => edge.target === moment.id)
    .map((edge) => appMap?.moments.find((entry) => entry.id === edge.source))
    .filter(Boolean) as Moment[];

  const outgoingMoments = (appMap?.edges ?? [])
    .filter((edge) => edge.source === moment.id)
    .map((edge) => appMap?.moments.find((entry) => entry.id === edge.target))
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

      updateMoment(moment.id, {
        label: updated.label,
        type: updated.type,
        description: updated.description,
        preview: updated.preview,
        mockHtml: updated.mockHtml ?? moment.mockHtml,
        screenSpec: updated.screenSpec ?? moment.screenSpec,
      });

      if (updated.stateSchema || updated.initialState || updated.runtimeVersion || updated.appPlatform) {
        updateAppRuntime({
          stateSchema: updated.stateSchema ?? appMap.stateSchema,
          initialState: updated.initialState ?? appMap.initialState,
          runtimeVersion: updated.runtimeVersion ?? appMap.runtimeVersion,
          appPlatform: updated.appPlatform ?? appMap.appPlatform,
        });
      }

      if (updated.removedEdgeIds?.length) removeEdges(updated.removedEdgeIds);

      if (updated.newMoments?.length) {
        addMoments(updated.newMoments, updated.newEdges ?? []);
        const newIds = new Set((updated.newMoments as { id: string }[]).map((entry) => entry.id));

        for (const edge of (updated.newEdges ?? []) as { source: string; target: string }[]) {
          if (!newIds.has(edge.source)) continue;
          const target = appMap.moments.find((entry) => entry.id === edge.target);
          if (target?.branchOf) updateMoment(target.id, { branchOf: edge.source });
        }
      }

      setStateHtmls({});
      setActiveState('main');

      const affectedMoments: Record<string, string> = updated.affectedMoments ?? {};
      const affectedItems = Object.entries(affectedMoments)
        .map(([id, reason]) => ({ moment: appMap.moments.find((entry) => entry.id === id)!, reason: reason as string }))
        .filter((item) => item.moment);

      if (affectedItems.length > 0) {
        flagMoments(affectedMoments);
        setCascadeCount(affectedItems.length);
        setIsCascading(true);
        fetch('/api/propagate-batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: affectedItems,
            editChange: changeText,
            editedMoment: { ...moment, ...updated },
            journey,
            appMap,
          }),
        })
          .then((response) => response.json())
          .then((result) => {
            if (result.updates) batchUpdateMoments(result.updates);
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

  const renderPreview = () => {
    if (activeState === 'main') {
      if (moment.screenSpec && appMap) {
        return (
          <div className="relative">
            <MobileRuntime appMap={appMap} startMomentId={moment.id} phoneWidth={previewWidth} />
            {isEditing && (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-[48px]"
                style={{ background: 'rgba(9,9,11,0.75)', backdropFilter: 'blur(4px)' }}
              >
                <div className="w-6 h-6 rounded-full border-2 border-zinc-600 border-t-indigo-400 animate-spin" />
                <p className="text-zinc-300 text-xs font-medium">Regenerating moment...</p>
              </div>
            )}
          </div>
        );
      }

      if (moment.mockHtml) {
        return (
          <div className="relative">
            <MockFrame html={moment.mockHtml} width={previewWidth} mode={appMap?.appPlatform ?? 'mobile'} />
            {isEditing && (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-[48px]"
                style={{ background: 'rgba(9,9,11,0.75)', backdropFilter: 'blur(4px)' }}
              >
                <div className="w-6 h-6 rounded-full border-2 border-zinc-600 border-t-indigo-400 animate-spin" />
                <p className="text-zinc-300 text-xs font-medium">Regenerating moment…</p>
              </div>
            )}
          </div>
        );
      }

      if (journey) {
        return (
          <StreamingMockFrame
            key={`${moment.id}-main`}
            fetchKey={`${moment.id}:main:${moment.preview ?? ''}`}
            url="/api/generate-mock"
            body={mockBody('main')}
            width={previewWidth}
            mode={appMap?.appPlatform ?? 'mobile'}
            onComplete={(html) => setMomentMock(moment.id, html)}
          />
        );
      }

      return null;
    }

    if (stateHtmls[activeState]) {
      return (
        <MockFrame
          key={`${moment.id}-${activeState}`}
          html={stateHtmls[activeState]!}
          width={previewWidth}
          mode={appMap?.appPlatform ?? 'mobile'}
        />
      );
    }

    if (!journey) return null;

    return (
      <StreamingMockFrame
        key={`${moment.id}-${activeState}`}
        fetchKey={`${moment.id}:${activeState}:${moment.preview ?? ''}`}
        url="/api/generate-mock"
        body={mockBody(activeState)}
        width={previewWidth}
        mode={appMap?.appPlatform ?? 'mobile'}
        onComplete={(html) => setStateHtmls((prev) => ({ ...prev, [activeState]: html }))}
      />
    );
  };

  return (
    <div className="h-full w-full flex flex-col bg-zinc-950 overflow-hidden">
      <div className="h-12 border-b border-zinc-800 flex items-center px-4 gap-3 shrink-0">
        <button
          onClick={() => setDetailMoment(parentMoment ? parentMoment.id : null)}
          className="h-7 w-7 shrink-0 rounded-md border border-zinc-800 text-zinc-500 transition-colors hover:text-zinc-200 hover:border-zinc-600 flex items-center justify-center"
          aria-label="Go back"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="min-w-0 flex-1 overflow-x-auto">
          <div className="flex items-center gap-2 whitespace-nowrap min-w-max">
            <button
              onClick={() => setDetailMoment(null)}
              className="text-zinc-500 hover:text-zinc-200 transition-colors text-sm"
            >
              Builder
            </button>
            <span className="text-zinc-700 text-sm">/</span>
            <button
              onClick={() => setDetailMoment(null)}
              className="flex items-center gap-2 text-zinc-500 hover:text-zinc-200 transition-colors text-sm"
            >
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
              {journey?.name ?? 'Journey'}
            </button>
            {ancestorChain.map((entry) => (
              <div key={entry.id} className="flex items-center gap-2">
                <span className="text-zinc-700 text-sm">/</span>
                <button
                  onClick={() => setDetailMoment(entry.id)}
                  className="text-zinc-500 hover:text-zinc-200 transition-colors text-sm"
                >
                  {entry.label}
                </button>
              </div>
            ))}
            <span className="text-zinc-700 text-sm">/</span>
            <span className="text-white text-sm font-medium">{moment.label}</span>
            <Badge variant="outline" className="text-[10px] border-zinc-700 text-zinc-500 ml-1">
              {TYPE_LABELS[moment.type] ?? moment.type}
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex overflow-hidden">
        {hasFlowNavigator && flowContainer && (
          <aside className="w-[280px] border-r border-zinc-800 bg-zinc-950/60 shrink-0 flex flex-col min-h-0">
            <div className="p-4 border-b border-zinc-800">
              <p className="text-zinc-500 text-[10px] font-medium uppercase tracking-[0.18em]">Flow</p>
              <h3 className="mt-2 text-white text-sm font-semibold leading-tight">{flowContainer.label}</h3>
              <p className="mt-1 text-zinc-500 text-xs leading-relaxed">
                {currentFlowIndex >= 0
                  ? `Step ${currentFlowIndex + 1} of ${flowEntries.length}`
                  : 'Click a step to drill deeper into this flow.'}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {flowEntries.map((entry, index) => {
                const isCurrent = entry.moment.id === moment.id;
                const isOverview = entry.kind === 'overview';
                const nextEntry = flowEntries[index + 1];

                return (
                  <div key={entry.moment.id}>
                    <button
                      onClick={() => setDetailMoment(entry.moment.id)}
                      className={`w-full rounded-2xl border px-3 py-3 text-left transition-all ${
                        isCurrent
                          ? 'border-indigo-500/70 bg-indigo-500/10 shadow-[0_0_0_1px_rgba(99,102,241,0.18)]'
                          : 'border-zinc-800 bg-zinc-900/70 hover:border-zinc-600 hover:bg-zinc-900'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-indigo-400">
                          {isOverview ? 'Overview' : `Step ${entry.index}`}
                        </span>
                        <span className="text-[10px] uppercase tracking-[0.18em] text-zinc-600">
                          {TYPE_LABELS[entry.moment.type] ?? entry.moment.type}
                        </span>
                      </div>
                      <h4 className={`mt-2 text-sm font-semibold leading-tight ${isCurrent ? 'text-white' : 'text-zinc-200'}`}>
                        {entry.moment.label}
                      </h4>
                      <p className="mt-1 text-xs leading-relaxed text-zinc-500 line-clamp-3">
                        {entry.moment.description}
                      </p>
                    </button>

                    {nextEntry && (
                      <div className="flex justify-center py-1.5">
                        <div className="h-5 w-px bg-zinc-800" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </aside>
        )}

        <div className="flex-1 min-h-0 flex overflow-hidden">
          <div className="flex-1 min-h-0 flex flex-col items-center justify-center overflow-y-auto gap-3 py-4">
            {supportsLegacyStateTabs && availablePreviewStates.length > 1 && (
              <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
                {availablePreviewStates.map((state) => (
                  <button
                    key={state}
                    onClick={() => setActiveState(state)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      activeState === state
                        ? 'bg-zinc-700 text-white'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {STATE_LABELS[state]}
                  </button>
                ))}
              </div>
            )}

            {renderPreview()}
          </div>

          <div className="w-[350px] border-l border-zinc-800 flex flex-col overflow-hidden shrink-0">
            <div className="flex-1 overflow-y-auto">
              {isCascading && (
                <div className="m-4 flex items-center gap-2 bg-indigo-500/8 border border-indigo-500/20 rounded-xl px-3 py-2.5">
                  <span className="w-3 h-3 rounded-full border-2 border-indigo-400/30 border-t-indigo-400 animate-spin shrink-0" />
                  <p className="text-indigo-300 text-xs">
                    Cascading changes to {cascadeCount} moment{cascadeCount !== 1 ? 's' : ''}…
                  </p>
                </div>
              )}

              {flagReason && !isCascading && (
                <div className="m-4 flex items-start gap-2 bg-amber-500/5 border border-amber-500/20 rounded-xl px-3 py-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                  <p className="text-amber-300/70 text-xs leading-relaxed flex-1">{flagReason}</p>
                  <button
                    onClick={() => clearFlag(moment.id)}
                    className="text-amber-500/50 hover:text-amber-400 transition-colors shrink-0 ml-1"
                    aria-label="Dismiss"
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              )}

              <div className="p-5">
                <p className="text-zinc-500 text-[10px] font-medium uppercase tracking-wider mb-2">Description</p>
                <p className="text-zinc-300 text-sm leading-relaxed">{moment.description}</p>
              </div>

              {hasFlowNavigator && flowContainer && (
                <>
                  <Separator className="bg-zinc-800" />
                  <div className="p-5">
                    <p className="text-zinc-500 text-[10px] font-medium uppercase tracking-wider mb-2">Flow Context</p>
              <p className="text-zinc-500 text-sm leading-relaxed">
                {moment.id === flowContainer.id
                  ? `This moment is the parent of a ${flowEntries.length - 1}-step internal flow. Use the left rail to move deeper into it.`
                  : `You are looking at an internal step inside ${flowContainer.label}. Click the breadcrumb or the Overview card to go back to the parent flow.`}
              </p>
            </div>
          </>
        )}

              {(incomingMoments.length > 0 || outgoingMoments.length > 0) && (
                <>
                  <Separator className="bg-zinc-800" />
                  <div className="p-5">
                    <div className="grid grid-cols-2 gap-3">
                      {incomingMoments.length > 0 && (
                        <div>
                          <p className="text-zinc-600 text-[10px] font-medium uppercase tracking-wider mb-2">Comes from</p>
                          <div className="space-y-1.5">
                            {incomingMoments.map((entry) => (
                              <button
                                key={entry.id}
                                onClick={() => setDetailMoment(entry.id)}
                                className="w-full text-left flex items-center gap-2 text-zinc-400 hover:text-white text-xs bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-lg px-3 py-2 transition-all"
                              >
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="shrink-0 text-zinc-600">
                                  <path d="M7 5H1M7 5L5 3M7 5L5 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <span className="truncate">{entry.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {outgoingMoments.length > 0 && (
                        <div>
                          <p className="text-zinc-600 text-[10px] font-medium uppercase tracking-wider mb-2">Goes to</p>
                          <div className="space-y-1.5">
                            {outgoingMoments.map((entry) => (
                              <button
                                key={entry.id}
                                onClick={() => setDetailMoment(entry.id)}
                                className="w-full text-left flex items-center gap-2 text-zinc-400 hover:text-white text-xs bg-zinc-900 border border-zinc-800 hover:border-zinc-600 rounded-lg px-3 py-2 transition-all"
                              >
                                <span className="truncate">{entry.label}</span>
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

              {moment.type === 'ai' && segments.length > 0 && (
                <>
                  <Separator className="bg-zinc-800" />
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                      <p className="text-zinc-500 text-[10px] font-medium uppercase tracking-wider">Prompt Segments</p>
                    </div>
                    <p className="text-zinc-600 text-xs mb-4">
                      Each segment is independently editable. Change one without touching the others.
                    </p>
                    <div className="space-y-2">
                      {segments.map((seg, index) => (
                        <div key={index} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                          <div className="px-3 py-2 flex items-center justify-between border-b border-zinc-800/60">
                            <span
                              className="text-[10px] font-semibold uppercase tracking-wider"
                              style={{
                                color:
                                  seg.label === 'Persona'
                                    ? '#a78bfa'
                                    : seg.label === 'User Context'
                                      ? '#34d399'
                                      : seg.label === 'Output Format'
                                        ? '#fb923c'
                                        : '#71717a',
                              }}
                            >
                              {seg.label}
                            </span>
                            <button
                              onClick={() => setEditingIdx(editingIdx === index ? null : index)}
                              className="text-zinc-600 hover:text-zinc-400 text-[10px] transition-colors"
                            >
                              {editingIdx === index ? 'Done' : 'Edit'}
                            </button>
                          </div>
                          {editingIdx === index ? (
                            <textarea
                              className="w-full bg-transparent text-zinc-300 text-[11px] font-mono leading-relaxed p-3 resize-none outline-none"
                              rows={Math.max(3, seg.content.split('\n').length + 1)}
                              value={seg.content}
                              onChange={(e) => {
                                const updated = [...segments];
                                updated[index] = { ...updated[index], content: e.target.value };
                                setSegments(updated);
                              }}
                            />
                          ) : (
                            <pre className="text-zinc-400 text-[11px] leading-relaxed whitespace-pre-wrap font-mono p-3 overflow-x-hidden">
                              {seg.content}
                            </pre>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <Separator className="bg-zinc-800 shrink-0" />

            <div className="p-5 shrink-0 space-y-3">
              <p className="text-zinc-500 text-[10px] font-medium uppercase tracking-wider">Edit this Moment</p>
              <Textarea
                className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 resize-none text-sm min-h-[80px] focus-visible:ring-indigo-500/40 focus-visible:border-indigo-500/50"
                placeholder="e.g. Add a dark mode toggle, make the button red, add a search bar..."
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleApplyEdit();
                }}
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
                ) : (
                  'Apply Edit'
                )}
              </Button>
              <p className="text-zinc-700 text-[10px] text-center">⌘ + Enter to apply</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
