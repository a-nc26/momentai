'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { EDIT_SCOPE_CHIPS, type EditScopeId } from '@/lib/edit-scope';
import { useMomentEdit } from '@/lib/hooks/useMomentEdit';
import type { Moment } from '@/lib/types';
import { DEMO_EDIT_MOMENT_ID, getDemoEditFlowDescription, getDemoEditPreset } from '@/lib/demo-edit';
import { isDemoEditConsumed, subscribeDemoEditSession } from '@/lib/demo-edit-session';
import { useMomentaiStore } from '@/lib/store';

export default function EditComposeTab({
  moment,
  onRegenerate,
  canRegenerate,
  regenerating = false,
  compact = false,
}: {
  moment: Moment;
  onRegenerate?: () => void;
  canRegenerate?: boolean;
  regenerating?: boolean;
  compact?: boolean;
}) {
  const { applyEdit, cancelEdit, isEditingMoment } = useMomentEdit();
  const appMap = useMomentaiStore((state) => state.appMap);
  const selectMoment = useMomentaiStore((state) => state.selectMoment);
  const setActiveMomentId = useMomentaiStore((state) => state.setActiveMomentId);
  const isEditing = isEditingMoment(moment.id);
  const demoPreset = appMap?.demoMode ? getDemoEditPreset(moment.id) : null;
  const demoFlow = demoPreset ? getDemoEditFlowDescription() : null;

  const [editText, setEditText] = useState('');
  const [editScope, setEditScope] = useState<EditScopeId | null>(null);
  const [customScope, setCustomScope] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [isDemoPriming, setIsDemoPriming] = useState(false);
  const [demoEditUsed, setDemoEditUsed] = useState(false);

  useEffect(() => {
    setDemoEditUsed(isDemoEditConsumed());
    return subscribeDemoEditSession(() => setDemoEditUsed(isDemoEditConsumed()));
  }, []);

  const demoOutOfEdits = !!(appMap?.demoMode && demoEditUsed);

  const handleApply = useCallback(async () => {
    if (!editText.trim() || isEditing) return;
    setEditError(null);
    await applyEdit({
      moment,
      changeText: editText,
      scope: editScope,
      customScope,
      resetAfterSuccess: () => {
        setEditText('');
        setEditScope(null);
        setCustomScope('');
      },
      onError: (message) => setEditError(message),
    });
  }, [applyEdit, customScope, editScope, editText, isEditing, moment]);

  const handleTryDemoEdit = useCallback(async () => {
    if (demoOutOfEdits || !demoPreset || isEditing || regenerating || isDemoPriming) return;
    setEditError(null);
    setEditText(demoPreset.changeText);
    setIsDemoPriming(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2200));
      await applyEdit({
        moment,
        changeText: demoPreset.changeText,
        scope: null,
        customScope: '',
        resetAfterSuccess: () => {
          setEditText('');
          setEditScope(null);
          setCustomScope('');
        },
        onError: (message) => setEditError(message),
      });
    } finally {
      setIsDemoPriming(false);
    }
  }, [applyEdit, demoOutOfEdits, demoPreset, isDemoPriming, isEditing, moment, regenerating]);

  return (
    <div className={compact ? 'flex min-h-0 flex-col gap-3' : 'flex min-h-0 flex-col gap-4'}>
      {appMap?.demoMode && !compact && demoPreset && demoFlow && (
        <div className="shrink-0 rounded-lg border border-indigo-500/30 bg-indigo-500/[0.07] px-3 py-2.5 space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-300/90">
            Demo: edit + cascade
          </p>
          <p className="text-[11px] text-zinc-400 leading-relaxed">{demoFlow.summary}</p>
          {demoOutOfEdits && (
            <p className="text-[11px] text-amber-200/80 leading-relaxed">
              You’ve used the one free demo edit in this session. Use <span className="text-zinc-200">Reset demo</span> in
              the header, or open <span className="font-mono text-zinc-300">/app?demo=true</span> in a new tab, to run it
              again.
            </p>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={handleTryDemoEdit}
            disabled={demoOutOfEdits || isEditing || regenerating || isDemoPriming}
            className="w-full h-9 border-indigo-500/50 text-indigo-200 hover:text-white text-xs"
          >
            {isDemoPriming ? 'Loading demo prompt…' : demoOutOfEdits ? 'Demo edit used' : 'Try demo edit'}
          </Button>
        </div>
      )}

      {appMap?.demoMode && compact && demoPreset && demoFlow && (
        <div className="shrink-0 flex items-center gap-2 rounded-md border border-indigo-500/25 bg-indigo-500/[0.06] px-2.5 py-1.5">
          <p className="min-w-0 flex-1 text-[10px] text-zinc-500 leading-snug">
            {demoOutOfEdits ? 'Demo edit used' : 'Demo cascade'}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleTryDemoEdit}
            disabled={demoOutOfEdits || isEditing || regenerating || isDemoPriming}
            className="h-7 shrink-0 border-indigo-500/40 text-[10px] text-indigo-200 px-2"
          >
            {isDemoPriming ? '…' : demoOutOfEdits ? '—' : 'Run'}
          </Button>
        </div>
      )}

      {appMap?.demoMode && compact && !demoPreset && (
        <div className="shrink-0 rounded-md border border-zinc-800/80 bg-zinc-900/50 px-2.5 py-1.5 text-[10px] text-zinc-500 leading-snug">
          <span className="text-zinc-600">Demo edit: </span>
          <button
            type="button"
            className="text-indigo-300/90 hover:text-indigo-200 font-medium"
            onClick={() => {
              selectMoment(DEMO_EDIT_MOMENT_ID);
              setActiveMomentId(DEMO_EDIT_MOMENT_ID);
            }}
          >
            Open Completion &amp; Log
          </button>
        </div>
      )}

      <div className="shrink-0 space-y-1.5">
        {!compact && (
          <label
            htmlFor={`compose-prompt-${moment.id}`}
            className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500"
          >
            Prompt
          </label>
        )}
        <Textarea
          id={compact ? undefined : `compose-prompt-${moment.id}`}
          className={`[field-sizing:fixed] w-full bg-zinc-900 border-zinc-800 focus-visible:border-indigo-500/50 focus-visible:ring-indigo-500/30 text-white text-sm resize-y shadow-none ${
            compact ? 'min-h-[96px] max-h-[180px]' : 'min-h-[120px] max-h-[min(42vh,380px)]'
          }`}
          placeholder="Describe the change you want. e.g. Make the CTA say 'Start free trial' and add a subtle gradient background."
          value={editText}
          onChange={(event) => {
            setEditText(event.target.value);
            if (editError) setEditError(null);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) handleApply();
            if (event.key === 'Escape') cancelEdit(moment.id);
          }}
          disabled={isEditing || regenerating || isDemoPriming || demoOutOfEdits}
        />
      </div>

      {editError && (
        <div className="flex items-start justify-between gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-1.5">
          <p className="text-[11px] text-red-300">{editError}</p>
          <button
            type="button"
            onClick={() => setEditError(null)}
            className="text-[10px] text-red-300/70 hover:text-red-200"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-1.5 shrink-0">
        {!compact && (
          <span className="w-full text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            Scope (optional)
          </span>
        )}
        {EDIT_SCOPE_CHIPS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setEditScope((value) => (value === id ? null : id))}
            className={`rounded-full border px-2 py-0.5 text-[10px] font-medium transition-colors ${
              editScope === id
                ? 'border-indigo-500/60 bg-indigo-500/15 text-indigo-200'
                : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setShowAdvanced((value) => !value)}
        className="text-[10px] text-zinc-500 hover:text-zinc-300"
      >
        {showAdvanced ? '– Hide advanced' : '+ Advanced'}
      </button>

      {showAdvanced && (
        <div className="space-y-2">
          <label className="block">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Custom scope
            </span>
            <input
              value={customScope}
              onChange={(event) => setCustomScope(event.target.value)}
              placeholder="e.g. pricing cards only, keep the hero untouched"
              disabled={isEditing || regenerating}
              className="mt-1 w-full h-8 rounded-md bg-zinc-900 border border-zinc-800 focus:border-indigo-500/50 px-2 text-[11px] text-zinc-200 outline-none"
            />
          </label>
        </div>
      )}

      <div
        className={`sticky bottom-0 z-10 -mx-1 mt-auto border-t border-zinc-800/80 bg-zinc-950/95 px-1 backdrop-blur-sm ${
          compact ? 'pt-2 pb-1' : 'pt-3 pb-1'
        }`}
      >
        <div className="flex items-center gap-2">
          <Button
            onClick={handleApply}
              disabled={
                !editText.trim() || isEditing || regenerating || isDemoPriming || demoOutOfEdits
              }
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-9"
            aria-busy={isEditing}
          >
            {isEditing ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Applying…
              </span>
            ) : (
              'Apply edit'
            )}
          </Button>
          {onRegenerate && (
            <Button
              variant="outline"
              onClick={onRegenerate}
              disabled={!canRegenerate || regenerating || isEditing || isDemoPriming}
              className="h-9 border-zinc-700 text-zinc-300 hover:text-white text-xs"
            >
              {regenerating ? 'Regenerating…' : 'Regenerate'}
            </Button>
          )}
        </div>
        <p className="text-[10px] text-zinc-600 text-center mt-1.5">⌘+Enter to apply · Esc to cancel</p>
      </div>
    </div>
  );
}
