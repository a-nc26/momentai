'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useMomentaiStore } from '@/lib/store';
import { resolveCascade } from '@/lib/cascade-bridge';

export default function CascadeReviewPanel() {
  const { pendingCascade, selectMoment, setActiveMomentId } = useMomentaiStore();
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});

  // Reset local accept/skip selections whenever a new cascade arrives.
  const cascadeKey = pendingCascade?.id ?? null;
  const [lastKey, setLastKey] = useState<string | null>(null);
  if (cascadeKey !== lastKey) {
    setLastKey(cascadeKey);
    setOverrides({});
  }

  const accepted = useMemo(() => {
    const next: Record<string, boolean> = {};
    if (pendingCascade) {
      for (const item of pendingCascade.items) {
        next[item.momentId] = overrides[item.momentId] ?? true;
      }
    }
    return next;
  }, [overrides, pendingCascade]);

  const acceptedIds = useMemo(
    () => Object.keys(accepted).filter((id) => accepted[id]),
    [accepted]
  );

  if (!pendingCascade) return null;

  return (
    <div className="fixed right-4 top-16 z-40 w-[340px] rounded-2xl border border-amber-500/30 bg-zinc-950/95 backdrop-blur-sm shadow-2xl">
      <div className="px-4 py-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-300">
            Review cascade
          </p>
        </div>
        <h3 className="mt-1.5 text-sm font-semibold text-white leading-tight">
          {pendingCascade.items.length} screen{pendingCascade.items.length === 1 ? '' : 's'} may need updating
        </h3>
        <p className="mt-1 text-[11px] text-zinc-400 leading-relaxed">
          You edited <span className="text-zinc-200">{pendingCascade.editedLabel}</span>. Pick which connected screens should refresh.
        </p>
      </div>

      <div className="max-h-[50vh] overflow-y-auto p-2 space-y-1">
        {pendingCascade.items.map((item) => {
          const isOn = accepted[item.momentId] ?? true;
          return (
            <label
              key={item.momentId}
              className={`flex cursor-pointer items-start gap-2 rounded-lg border px-2.5 py-2 transition-colors ${
                isOn
                  ? 'border-indigo-500/40 bg-indigo-500/5'
                  : 'border-zinc-800 bg-zinc-900/40'
              }`}
            >
              <input
                type="checkbox"
                checked={isOn}
                onChange={(event) =>
                  setOverrides((prev) => ({ ...prev, [item.momentId]: event.target.checked }))
                }
                className="mt-0.5 accent-indigo-500"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-[12px] font-medium text-white">{item.label}</p>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      selectMoment(item.momentId);
                      setActiveMomentId(item.momentId);
                    }}
                    className="text-[10px] text-indigo-300 hover:text-indigo-200"
                  >
                    View
                  </button>
                </div>
                <p className="mt-0.5 text-[10px] text-zinc-400 leading-snug">{item.reason}</p>
                {item.hasComponentCode ? (
                  <span className="mt-1 inline-flex rounded-full border border-emerald-500/25 bg-emerald-500/10 px-1.5 py-0.5 text-[9px] text-emerald-300">
                    Will regenerate code
                  </span>
                ) : (
                  <span className="mt-1 inline-flex rounded-full border border-zinc-700 bg-zinc-900 px-1.5 py-0.5 text-[9px] text-zinc-400">
                    Metadata only
                  </span>
                )}
              </div>
            </label>
          );
        })}
      </div>

      <div className="border-t border-zinc-800 p-3 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => resolveCascade(pendingCascade.id, { action: 'undo' })}
          className="text-[11px] text-amber-400 hover:text-amber-300"
        >
          Undo edit
        </button>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 border-zinc-700 text-zinc-300 hover:text-white text-[11px]"
            onClick={() => resolveCascade(pendingCascade.id, { action: 'skip' })}
          >
            Skip all
          </Button>
          <Button
            size="sm"
            className="h-8 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px]"
            disabled={acceptedIds.length === 0}
            onClick={() =>
              resolveCascade(pendingCascade.id, {
                action: 'apply',
                acceptedMomentIds: acceptedIds,
              })
            }
          >
            Apply {acceptedIds.length} update{acceptedIds.length === 1 ? '' : 's'}
          </Button>
        </div>
      </div>
    </div>
  );
}
