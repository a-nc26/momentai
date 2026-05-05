'use client';

import { useCallback, useEffect, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useMomentaiStore } from '@/lib/store';
import type { MomentType } from '@/lib/types';

const TYPES: { id: MomentType; label: string; icon: string }[] = [
  { id: 'ui', label: 'UI', icon: '🖥' },
  { id: 'ai', label: 'AI', icon: '✦' },
  { id: 'data', label: 'Data', icon: '⬡' },
  { id: 'auth', label: 'Auth', icon: '⬡' },
];

type AddScreenPopoverProps = {
  /** Pre-selected source moment id (adds an edge from it). Optional. */
  sourceMomentId?: string;
  /** Pre-selected journey id. Defaults to source's journey if provided, else first journey. */
  journeyId?: string;
  trigger: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export default function AddScreenPopover({
  sourceMomentId,
  journeyId,
  trigger,
  open,
  onOpenChange,
}: AddScreenPopoverProps) {
  const { appMap, addMoments, selectMoment, setActiveMomentId, recordProjectRevision } =
    useMomentaiStore();
  const [internalOpen, setInternalOpen] = useState(false);
  const controlled = open !== undefined;
  const actualOpen = controlled ? open : internalOpen;
  const setOpen = useCallback(
    (next: boolean) => {
      if (!controlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [controlled, onOpenChange]
  );

  const defaultJourneyId =
    journeyId ??
    (sourceMomentId
      ? appMap?.moments.find((moment) => moment.id === sourceMomentId)?.journeyId
      : undefined) ??
    appMap?.journeys[0]?.id ??
    '';

  const [label, setLabel] = useState('');
  const [type, setType] = useState<MomentType>('ui');
  const [selectedJourney, setSelectedJourney] = useState(defaultJourneyId);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (actualOpen) {
      setLabel('');
      setType('ui');
      setSelectedJourney(defaultJourneyId);
    }
  }, [actualOpen, defaultJourneyId]);

  const handleSubmit = useCallback(
    async (event?: React.FormEvent) => {
      event?.preventDefault();
      if (!appMap || !selectedJourney) return;
      const trimmed = label.trim();
      if (!trimmed) return;
      setSubmitting(true);
      try {
        const res = await fetch('/api/add-moment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            appMap,
            journeyId: selectedJourney,
            sourceMomentId,
            label: trimmed,
            type,
          }),
        });
        if (!res.ok) return;
        const data = await res.json();
        if (!data.moment) return;
        addMoments([data.moment], data.edge ? [data.edge] : []);
        recordProjectRevision(`Add moment "${data.moment.label}"`);
        selectMoment(data.moment.id);
        setActiveMomentId(data.moment.id);
        setOpen(false);
      } finally {
        setSubmitting(false);
      }
    },
    [
      addMoments,
      appMap,
      label,
      recordProjectRevision,
      selectMoment,
      selectedJourney,
      setActiveMomentId,
      setOpen,
      sourceMomentId,
      type,
    ]
  );

  if (!appMap) return null;

  return (
    <Popover open={actualOpen} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">
              {sourceMomentId ? 'Add screen after selection' : 'Add screen'}
            </p>
            <input
              autoFocus
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              placeholder="Screen label…"
              className="w-full h-9 rounded-md bg-zinc-900 border border-zinc-800 focus:border-indigo-500/60 px-2.5 text-sm text-white outline-none"
              disabled={submitting}
            />
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">
              Type
            </p>
            <div className="flex gap-1">
              {TYPES.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => setType(entry.id)}
                  className={`flex-1 rounded-md border px-2 py-1 text-xs font-medium transition-colors ${
                    type === entry.id
                      ? 'border-indigo-500/60 bg-indigo-500/10 text-indigo-200'
                      : 'border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <span className="mr-1">{entry.icon}</span>
                  {entry.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1">
              Journey
            </p>
            <select
              value={selectedJourney}
              onChange={(event) => setSelectedJourney(event.target.value)}
              className="w-full h-8 rounded-md bg-zinc-900 border border-zinc-800 px-2 text-xs text-zinc-200 outline-none focus:border-indigo-500/60"
              disabled={submitting}
            >
              {appMap.journeys.map((journey) => (
                <option key={journey.id} value={journey.id}>
                  {journey.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
              className="h-7 text-xs text-zinc-400"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="h-7 bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3"
              disabled={!label.trim() || submitting}
            >
              {submitting ? 'Adding…' : 'Add screen'}
            </Button>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}
