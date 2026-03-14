'use client';

import { useState } from 'react';
import { useMomentaiStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Moment } from '@/lib/types';
import { JOURNEY_COLORS } from '@/lib/colors';
import MockFrame from './MockFrame';
import StreamingMockFrame from './StreamingMockFrame';

const AI_MOMENT_IDS: Record<string, { inputs: string; outputs: string }> = {
  'goal-beginner':     { inputs: 'Fitness level · Goals · Available days · Equipment', outputs: 'Plan name · Weekly schedule · 8-week milestones · AI reasoning' },
  'goal-intermediate': { inputs: 'Fitness level · Goals · Available days · Equipment', outputs: 'Plan name · Upper/lower split · 12-week milestones · AI reasoning' },
  'goal-advanced':     { inputs: 'Fitness level · Goals · Available days · Equipment', outputs: 'PPL split · Periodisation model · 16-week milestones · AI reasoning' },
  'goal-athlete':      { inputs: 'Fitness level · Goals · Available days · Equipment', outputs: 'Elite program · Mesocycles · Competition sim dates · AI reasoning' },
  'ai-workout':        { inputs: 'Energy level (1–5) · Recovery score · Plan day · Equipment', outputs: 'Exercise list · Sets/reps · Est. duration · Est. calories · Adaptation note' },
  'ai-debrief':        { inputs: 'Session duration · Exercises · Total volume · PRs · Avg rest', outputs: 'Coaching insights · Recovery rating · Next session tip' },
  'ai-insights':       { inputs: '30-day training history · Volume · Muscle groups · Sleep data', outputs: 'Weekly insight · Alert cards · Recommendations' },
  'ai-meals':          { inputs: 'Remaining calories/macros · Dietary preferences · Meal type', outputs: 'Meal suggestions · Macro breakdown · Prep time · Ingredients' },
};

const TYPE_LABELS: Record<string, string> = {
  ui: 'UI Screen', ai: 'AI-Powered', data: 'Data Layer', auth: 'Auth Step',
};

export default function MomentPanel({ moment }: { moment: Moment }) {
  const [editText, setEditText] = useState('');
  const [mockVersion, setMockVersion] = useState(0);
  const [showAiDetails, setShowAiDetails] = useState(false);

  const [isCascading, setIsCascading] = useState(false);
  const [cascadeCount, setCascadeCount] = useState(0);

  const { appMap, selectMoment, updateMoment, setMomentMock, addMoments, removeEdges, flagMoments, clearAllFlags, batchUpdateMoments, flaggedMoments, isEditing, setEditing } =
    useMomentaiStore();

  const flagReason = flaggedMoments[moment.id];
  const journeyIndex = appMap?.journeys.findIndex((j) => j.id === moment.journeyId) ?? 0;
  const color = JOURNEY_COLORS[journeyIndex % JOURNEY_COLORS.length];
  const journey = appMap?.journeys.find((j) => j.id === moment.journeyId);

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
      setMockVersion((v) => v + 1);

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
    <div className="w-[420px] border-l border-zinc-800 bg-zinc-950 flex flex-col overflow-hidden shrink-0">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 shrink-0">
        <div className="flex items-center justify-between mb-3">
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
        <h2 className="text-white font-bold text-lg leading-tight mb-2">{moment.label}</h2>
        <Badge variant="outline" className="text-[10px] border-zinc-700 text-zinc-400">
          {TYPE_LABELS[moment.type] ?? moment.type}
        </Badge>
      </div>

      <Separator className="bg-zinc-800 shrink-0" />

      {/* Cascade progress indicator */}
      {isCascading && (
        <div className="mx-4 mt-3 shrink-0 flex items-center gap-2 bg-indigo-500/8 border border-indigo-500/20 rounded-xl px-3 py-2.5">
          <span className="w-3 h-3 rounded-full border-2 border-indigo-400/30 border-t-indigo-400 animate-spin shrink-0" />
          <p className="text-indigo-300 text-xs">Cascading changes to {cascadeCount} moment{cascadeCount !== 1 ? 's' : ''}…</p>
        </div>
      )}

      {/* Upstream impact note (flagged but cascade done or pending) */}
      {flagReason && !isCascading && (
        <div className="mx-4 mt-3 shrink-0 flex items-start gap-2 bg-amber-500/5 border border-amber-500/20 rounded-xl px-3 py-2.5">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1" />
          <p className="text-amber-300/70 text-xs leading-relaxed">{flagReason}</p>
        </div>
      )}

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">
        {/* Mock preview */}
        <div className="p-5">
          <p className="text-zinc-500 text-[10px] font-medium uppercase tracking-wider mb-4">Screen Preview</p>

          {moment.mockHtml ? (
            // Pre-baked or previously generated — render instantly
            <div className="relative">
              <MockFrame key={`${moment.id}-${mockVersion}`} html={moment.mockHtml} width={190} />
              {isEditing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-[18px]"
                  style={{ background: 'rgba(9,9,11,0.75)', backdropFilter: 'blur(4px)' }}>
                  <div className="w-6 h-6 rounded-full border-2 border-zinc-600 border-t-indigo-400 animate-spin" />
                  <p className="text-zinc-300 text-xs font-medium">Regenerating screen…</p>
                </div>
              )}
            </div>
          ) : journey ? (
            // Not yet generated — stream it in, cache on complete
            <StreamingMockFrame
              key={moment.id}
              fetchKey={`${moment.id}:${moment.preview ?? ''}`}
              url="/api/generate-mock"
              body={{ moment, journey, appMap }}
              width={190}
              onComplete={(html) => setMomentMock(moment.id, html)}
            />
          ) : null}
        </div>

        {/* Description */}
        <div className="px-5 pb-5">
          <p className="text-zinc-500 text-[10px] font-medium uppercase tracking-wider mb-2">Description</p>
          <p className="text-zinc-400 text-sm leading-relaxed">{moment.description}</p>
        </div>

        {/* AI Implementation */}
        {moment.type === 'ai' && (
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

            {showAiDetails && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2">
                  <span className="text-zinc-500 text-[10px] font-medium uppercase tracking-wider">Model</span>
                  <span className="text-violet-400 text-xs font-mono">claude-sonnet-4-6</span>
                </div>
                {AI_MOMENT_IDS[moment.id] && (
                  <>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <div className="w-1 h-1 rounded-full bg-emerald-500" />
                        <span className="text-zinc-500 text-[10px] font-medium uppercase tracking-wider">Inputs</span>
                      </div>
                      <p className="text-zinc-300 text-xs leading-relaxed">{AI_MOMENT_IDS[moment.id].inputs}</p>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <div className="w-1 h-1 rounded-full bg-sky-500" />
                        <span className="text-zinc-500 text-[10px] font-medium uppercase tracking-wider">Outputs</span>
                      </div>
                      <p className="text-zinc-300 text-xs leading-relaxed">{AI_MOMENT_IDS[moment.id].outputs}</p>
                    </div>
                  </>
                )}
                {moment.promptTemplate && (
                  <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5">
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="w-1 h-1 rounded-full bg-amber-500" />
                      <span className="text-zinc-500 text-[10px] font-medium uppercase tracking-wider">Prompt Template</span>
                    </div>
                    <pre className="text-zinc-400 text-[10px] leading-relaxed whitespace-pre-wrap font-mono overflow-x-auto">{moment.promptTemplate}</pre>
                  </div>
                )}
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
            )}
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
