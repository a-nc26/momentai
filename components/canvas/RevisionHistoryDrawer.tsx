'use client';

import { useMomentaiStore } from '@/lib/store';

function formatTime(timestamp: number) {
  const d = new Date(timestamp);
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function RevisionHistoryDrawer() {
  const { revisionDrawerOpen, setRevisionDrawerOpen, projectRevisions, restoreProjectRevision } =
    useMomentaiStore();

  if (!revisionDrawerOpen) return null;

  return (
    <div className="fixed right-4 top-16 z-40 w-[340px] rounded-2xl border border-zinc-800 bg-zinc-950/95 backdrop-blur-sm shadow-2xl">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">History</p>
          <h3 className="text-sm font-semibold text-white">Project revisions</h3>
        </div>
        <button
          type="button"
          onClick={() => setRevisionDrawerOpen(false)}
          className="text-xs text-zinc-500 hover:text-zinc-300"
        >
          Close
        </button>
      </div>

      <div className="max-h-[55vh] overflow-y-auto p-2 space-y-1">
        {projectRevisions.length === 0 && (
          <p className="px-2 py-4 text-[11px] text-zinc-500 text-center">
            No revisions yet. Map changes will appear here as you go.
          </p>
        )}
        {[...projectRevisions].reverse().map((revision) => (
          <button
            key={revision.id}
            type="button"
            onClick={() => {
              restoreProjectRevision(revision.id);
              setRevisionDrawerOpen(false);
            }}
            className="w-full text-left rounded-lg border border-zinc-800 hover:border-zinc-600 bg-zinc-900/60 hover:bg-zinc-900 px-3 py-2 transition-colors"
          >
            <p className="text-[12px] text-zinc-100 truncate">{revision.label}</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">{formatTime(revision.createdAt)}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
