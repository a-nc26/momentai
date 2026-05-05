'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { AppMap, Moment } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

function pickableMoments(appMap: AppMap): Moment[] {
  const rows = appMap.moments.filter((m) => !m.parentMomentId);
  const journeyOrder = new Map(appMap.journeys.map((j, i) => [j.id, i]));
  return [...rows].sort((a, b) => {
    const ja = journeyOrder.get(a.journeyId) ?? 999;
    const jb = journeyOrder.get(b.journeyId) ?? 999;
    if (ja !== jb) return ja - jb;
    return a.label.localeCompare(b.label, undefined, { sensitivity: 'base' });
  });
}

export default function MomentScreenPicker({
  appMap,
  value,
  onChange,
  disabled,
  className,
  id: idProp,
}: {
  appMap: AppMap;
  value: string;
  onChange: (momentId: string) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = idProp ? `${idProp}-listbox` : 'moment-screen-picker-listbox';

  const moments = useMemo(() => pickableMoments(appMap), [appMap]);

  const journeyName = useCallback(
    (journeyId: string) => appMap.journeys.find((j) => j.id === journeyId)?.name ?? '',
    [appMap.journeys]
  );

  const selected = useMemo(
    () => appMap.moments.find((m) => m.id === value),
    [appMap.moments, value]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return moments;
    return moments.filter((m) => {
      const jn = journeyName(m.journeyId).toLowerCase();
      return (
        m.label.toLowerCase().includes(q) ||
        jn.includes(q) ||
        m.id.toLowerCase().includes(q)
      );
    });
  }, [moments, query, journeyName]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => {
    if (open) setQuery('');
  }, [open]);

  const select = (id: string) => {
    onChange(id);
    setOpen(false);
  };

  const triggerLabel = selected?.label ?? 'Choose a screen…';

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <p className="text-zinc-500 text-[9px] font-medium uppercase tracking-wider mb-1">Screen to edit</p>
      <button
        type="button"
        id={idProp}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={cn(
          'flex w-full items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800/80 px-2.5 py-1.5 text-left text-xs text-zinc-200 transition-colors',
          'hover:border-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <span className="min-w-0 flex-1 truncate font-medium">{triggerLabel}</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={cn('shrink-0 text-zinc-500 transition-transform', open && 'rotate-180')}
          aria-hidden
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          id={listId}
          className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-zinc-700 bg-zinc-900 shadow-xl"
        >
          <div className="p-2 border-b border-zinc-800">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search screens…"
              className="h-8 text-xs bg-zinc-950 border-zinc-700 text-zinc-200 placeholder:text-zinc-600"
              autoFocus
              onKeyDown={(e) => e.stopPropagation()}
            />
          </div>
          <ScrollArea className="max-h-[220px]">
            <ul className="p-1">
              {filtered.length === 0 ? (
                <li className="px-2 py-3 text-[11px] text-zinc-500 text-center">No screens match</li>
              ) : (
                filtered.map((m) => {
                  const active = m.id === value;
                  const jn = journeyName(m.journeyId);
                  return (
                    <li key={m.id}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={active}
                        className={cn(
                          'w-full rounded-md px-2 py-1.5 text-left transition-colors',
                          active
                            ? 'bg-indigo-500/20 text-indigo-200'
                            : 'text-zinc-300 hover:bg-zinc-800'
                        )}
                        onClick={() => select(m.id)}
                      >
                        <span className="block text-[11px] font-medium truncate">{m.label}</span>
                        {jn ? (
                          <span className="block text-[9px] text-zinc-500 truncate">{jn}</span>
                        ) : null}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
