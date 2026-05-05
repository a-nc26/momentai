'use client';

import { useMemo } from 'react';
import { useMomentaiStore } from '@/lib/store';

export default function EditHistoryTab({ momentId }: { momentId: string }) {
  const { editHistory, editHistoryIndex } = useMomentaiStore();

  const relevant = useMemo(
    () =>
      editHistory
        .map((entry, index) => ({ entry, index }))
        .filter(
          ({ entry }) => entry.before[momentId] !== undefined || entry.after[momentId] !== undefined
        ),
    [editHistory, momentId]
  );

  if (relevant.length === 0) {
    return (
      <p className="text-[11px] text-zinc-500">
        No edits to this screen yet. Apply a change on the Compose tab and it will show here.
      </p>
    );
  }

  return (
    <ul className="space-y-1.5">
      {relevant.reverse().map(({ entry, index }) => (
        <li
          key={entry.id}
          className={`rounded-lg border px-2.5 py-2 ${
            index === editHistoryIndex
              ? 'border-indigo-500/40 bg-indigo-500/5'
              : 'border-zinc-800 bg-zinc-900/40'
          }`}
        >
          <p className="text-[11px] text-zinc-200 leading-snug">{entry.label}</p>
          <p className="mt-0.5 text-[10px] text-zinc-500">
            {new Date(entry.createdAt).toLocaleString()}
          </p>
        </li>
      ))}
    </ul>
  );
}
