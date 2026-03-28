'use client';

import { useEffect, useState, useCallback } from 'react';

interface LogEntry {
  id: string;
  created_at: string;
  level: 'warn' | 'error';
  tag: string | null;
  message: string;
  data: unknown;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return new Date(iso).toLocaleDateString();
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'warn' | 'error'>('all');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch('/admin/logs/api');
      if (!res.ok) return;
      const { logs: data } = await res.json();
      setLogs(data ?? []);
      setLastRefresh(new Date());
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 15_000);
    return () => clearInterval(interval);
  }, [fetchLogs]);

  const visible = logs.filter((l) => filter === 'all' || l.level === filter);
  const errorCount = logs.filter((l) => l.level === 'error').length;
  const warnCount = logs.filter((l) => l.level === 'warn').length;

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
      {/* Header */}
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-white">Runtime Logs</h1>
            <p className="text-zinc-500 text-sm mt-0.5">
              Warns + errors from live sessions · auto-refreshes every 15s
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-zinc-600 text-xs">
              Last refresh: {lastRefresh.toLocaleTimeString()}
            </span>
            <button
              onClick={fetchLogs}
              className="text-xs border border-zinc-700 hover:border-zinc-500 px-3 py-1.5 rounded-lg transition-colors text-zinc-400 hover:text-white"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Summary pills */}
        <div className="flex items-center gap-2 mb-5">
          {(['all', 'warn', 'error'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                filter === f
                  ? f === 'error'
                    ? 'bg-red-500/15 border-red-500/40 text-red-400'
                    : f === 'warn'
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
                    : 'bg-zinc-700 border-zinc-600 text-white'
                  : 'border-zinc-800 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {f === 'all' ? `All (${logs.length})` : f === 'error' ? `Errors (${errorCount})` : `Warnings (${warnCount})`}
            </button>
          ))}
        </div>

        {/* Log list */}
        {loading ? (
          <div className="flex items-center gap-2 text-zinc-500 text-sm py-12 justify-center">
            <span className="w-4 h-4 rounded-full border-2 border-zinc-700 border-t-indigo-400 animate-spin" />
            Loading logs…
          </div>
        ) : visible.length === 0 ? (
          <div className="text-center py-16 text-zinc-600">
            <div className="text-4xl mb-3">✓</div>
            <p className="text-sm">No {filter !== 'all' ? filter + 's' : 'logs'} yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {visible.map((log) => {
              const isExpanded = expanded.has(log.id);
              const hasData = log.data !== null && log.data !== undefined;

              return (
                <div
                  key={log.id}
                  className={`rounded-xl border transition-colors ${
                    log.level === 'error'
                      ? 'border-red-500/20 bg-red-500/5'
                      : 'border-amber-500/15 bg-amber-500/4'
                  }`}
                >
                  <div
                    className="px-4 py-3 flex items-start gap-3 cursor-pointer"
                    onClick={() => hasData && toggleExpanded(log.id)}
                  >
                    {/* Level badge */}
                    <span
                      className={`shrink-0 mt-0.5 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                        log.level === 'error'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-amber-500/15 text-amber-400'
                      }`}
                    >
                      {log.level}
                    </span>

                    {/* Tag */}
                    {log.tag && (
                      <span className="shrink-0 mt-0.5 text-[10px] font-mono text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded">
                        {log.tag}
                      </span>
                    )}

                    {/* Message */}
                    <p className="flex-1 text-sm text-zinc-200 leading-snug font-mono">{log.message}</p>

                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="text-zinc-600 text-xs">{timeAgo(log.created_at)}</span>
                      {hasData && (
                        <svg
                          width="12" height="12" viewBox="0 0 12 12" fill="none"
                          className={`text-zinc-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        >
                          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                  </div>

                  {/* Expanded data */}
                  {isExpanded && hasData && (
                    <div className="px-4 pb-3 border-t border-zinc-800/60 pt-3">
                      <pre className="text-[11px] text-zinc-400 font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap break-all bg-zinc-900/60 rounded-lg p-3">
                        {JSON.stringify(log.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
