'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getProjects, deleteProject, SavedProject } from '@/lib/projects';
import { useMomentaiStore } from '@/lib/store';

// ─── helpers ──────────────────────────────────────────────────────────────────

function timeAgo(ts: number | string): string {
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${d}d ago`;
}

function extractTokenFromUrl(url: string): { appId: string; token: string } | null {
  try {
    const u = new URL(url);
    const appId = u.pathname.split('/').at(-1);
    const token = u.searchParams.get('t');
    if (!appId || !token) return null;
    return { appId, token };
  } catch {
    return null;
  }
}

function exportToCsv(records: AppRecord[], appName: string) {
  const rows: string[][] = [['guest_id', 'namespace', 'key', 'value', 'created_at']];
  for (const r of records) {
    rows.push([
      r.guest_id,
      r.namespace,
      r.key,
      JSON.stringify(r.value_json),
      r.created_at ?? '',
    ]);
  }
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${appName.toLowerCase().replace(/\s+/g, '-')}-data.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── types ────────────────────────────────────────────────────────────────────

interface AppStats {
  guestCount: number;
  recordCount: number;
  lastActivity: string | null;
}

interface AppRecord {
  guest_id: string;
  namespace: string;
  key: string;
  value_json: unknown;
  created_at?: string;
}

// ─── data viewer panel ────────────────────────────────────────────────────────

function DataPanel({
  project,
  onClose,
}: {
  project: SavedProject;
  onClose: () => void;
}) {
  const creds = project.builtAppUrl ? extractTokenFromUrl(project.builtAppUrl) : null;
  const [records, setRecords] = useState<AppRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGuest, setSelectedGuest] = useState<string | null>(null);

  useEffect(() => {
    if (!creds) { setLoading(false); return; }
    fetch(`/api/my-apps/records?appId=${encodeURIComponent(creds.appId)}&token=${encodeURIComponent(creds.token)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setRecords(d.records ?? []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [creds?.appId, creds?.token]);

  const guests = [...new Set(records.map((r) => r.guest_id))];
  const visibleRecords = selectedGuest
    ? records.filter((r) => r.guest_id === selectedGuest)
    : records;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/60" onClick={onClose} />

      {/* Panel */}
      <div className="w-full max-w-2xl bg-zinc-950 border-l border-zinc-800 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-white font-semibold text-sm">{project.name}</h2>
            <p className="text-zinc-500 text-xs mt-0.5">App data · {records.length} records · {guests.length} visitors</p>
          </div>
          <div className="flex items-center gap-2">
            {records.length > 0 && (
              <button
                onClick={() => exportToCsv(records, project.name)}
                className="text-xs border border-zinc-700 hover:border-zinc-500 text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg transition-all"
              >
                Export CSV
              </button>
            )}
            <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200 text-xl leading-none w-8 h-8 flex items-center justify-center">
              ×
            </button>
          </div>
        </div>

        {/* Guest filter */}
        {guests.length > 1 && (
          <div className="px-6 py-3 border-b border-zinc-800 flex items-center gap-2 flex-wrap shrink-0">
            <span className="text-zinc-600 text-xs">Filter by visitor:</span>
            <button
              onClick={() => setSelectedGuest(null)}
              className={`text-xs px-2.5 py-1 rounded-full transition-all ${!selectedGuest ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
            >
              All
            </button>
            {guests.map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGuest(g === selectedGuest ? null : g)}
                className={`text-xs px-2.5 py-1 rounded-full font-mono transition-all ${selectedGuest === g ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
              >
                {g.slice(0, 8)}…
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading && (
            <div className="flex items-center gap-2 text-zinc-500 text-sm py-12 justify-center">
              <span className="w-4 h-4 rounded-full border-2 border-zinc-700 border-t-indigo-400 animate-spin" />
              Loading data…
            </div>
          )}

          {!loading && error && (
            <div className="text-red-400 text-sm py-8 text-center">{error}</div>
          )}

          {!loading && !error && records.length === 0 && (
            <div className="text-center py-16">
              <div className="text-3xl mb-3">📭</div>
              <p className="text-zinc-500 text-sm">No data yet</p>
              <p className="text-zinc-600 text-xs mt-1">Data appears here when visitors use your app</p>
            </div>
          )}

          {!loading && !error && visibleRecords.length > 0 && (
            <div className="space-y-2">
              {visibleRecords.map((r, i) => (
                <div key={i} className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-mono text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded">
                      {r.guest_id.slice(0, 8)}…
                    </span>
                    {r.namespace !== 'default' && (
                      <span className="text-[10px] text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded">
                        {r.namespace}
                      </span>
                    )}
                    <span className="text-[10px] font-semibold text-zinc-300 bg-zinc-700 px-1.5 py-0.5 rounded">
                      {r.key}
                    </span>
                    {r.created_at && (
                      <span className="ml-auto text-[10px] text-zinc-600">{timeAgo(r.created_at)}</span>
                    )}
                  </div>
                  <pre className="text-xs text-zinc-300 font-mono whitespace-pre-wrap break-all bg-zinc-950/60 rounded-lg p-3 leading-relaxed">
                    {JSON.stringify(r.value_json, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── project card ─────────────────────────────────────────────────────────────

function ProjectCard({
  project,
  onOpen,
  onDelete,
  onViewData,
}: {
  project: SavedProject;
  onOpen: (p: SavedProject) => void;
  onDelete: (id: string) => void;
  onViewData: (p: SavedProject) => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [stats, setStats] = useState<AppStats | null>(null);
  const [copied, setCopied] = useState(false);

  const creds = project.builtAppUrl ? extractTokenFromUrl(project.builtAppUrl) : null;
  const isLive = !!creds;

  useEffect(() => {
    if (!creds) return;
    fetch(`/api/my-apps/stats?appId=${encodeURIComponent(creds.appId)}&token=${encodeURIComponent(creds.token)}`)
      .then((r) => r.json())
      .then((d) => { if (!d.error) setStats(d); })
      .catch(() => {});
  }, [creds?.appId, creds?.token]);

  const copyLink = useCallback(() => {
    if (!project.builtAppUrl) return;
    navigator.clipboard.writeText(project.builtAppUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [project.builtAppUrl]);

  const momentCount = project.appMap.moments?.filter((m) => !m.parentMomentId).length ?? 0;
  const builtCount = project.appMap.moments?.filter((m) => m.componentCode).length ?? 0;

  return (
    <div className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl overflow-hidden flex flex-col transition-all group">
      {/* Top bar */}
      <div className="px-5 pt-5 pb-4 flex-1">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <h3 className="text-white font-semibold text-sm truncate">{project.name}</h3>
            <p className="text-zinc-500 text-xs mt-0.5 line-clamp-2 leading-relaxed">{project.description}</p>
          </div>
          {isLive && (
            <span className="shrink-0 inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-emerald-400 border border-emerald-800/60 rounded-full px-2 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </span>
          )}
        </div>

        {/* Build progress */}
        {momentCount > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-[10px] text-zinc-600 mb-1">
              <span>{builtCount}/{momentCount} screens built</span>
              <span>{timeAgo(project.updatedAt)}</span>
            </div>
            <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all"
                style={{ width: `${momentCount > 0 ? (builtCount / momentCount) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}

        {/* Live stats */}
        {isLive && (
          <div className="flex items-center gap-4 bg-zinc-950/60 rounded-xl px-3 py-2.5 mt-2">
            {stats ? (
              <>
                <div className="text-center">
                  <div className="text-white text-sm font-semibold">{stats.guestCount}</div>
                  <div className="text-zinc-500 text-[10px]">visitors</div>
                </div>
                <div className="w-px h-6 bg-zinc-800" />
                <div className="text-center">
                  <div className="text-white text-sm font-semibold">{stats.recordCount}</div>
                  <div className="text-zinc-500 text-[10px]">records</div>
                </div>
                <div className="w-px h-6 bg-zinc-800" />
                <div className="text-center min-w-0">
                  <div className="text-white text-xs font-medium truncate">
                    {stats.lastActivity ? timeAgo(stats.lastActivity) : '—'}
                  </div>
                  <div className="text-zinc-500 text-[10px]">last activity</div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 text-zinc-600 text-xs">
                <span className="w-3 h-3 rounded-full border-2 border-zinc-700 border-t-zinc-500 animate-spin" />
                Loading stats…
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex items-center gap-2 flex-wrap">
        <button
          onClick={() => onOpen(project)}
          className="flex-1 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg px-3 py-2 transition-colors"
        >
          Edit
        </button>

        {isLive && (
          <>
            <a
              href={project.builtAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-zinc-300 hover:text-white border border-zinc-700 hover:border-zinc-500 rounded-lg px-3 py-2 transition-all"
            >
              Open app ↗
            </a>

            <button
              onClick={copyLink}
              className="text-xs border border-zinc-700 hover:border-zinc-500 rounded-lg px-3 py-2 transition-all text-zinc-400 hover:text-white"
            >
              {copied ? '✓ Copied' : 'Copy link'}
            </button>

            <button
              onClick={() => onViewData(project)}
              className="text-xs border border-indigo-800 hover:border-indigo-600 bg-indigo-500/8 hover:bg-indigo-500/15 rounded-lg px-3 py-2 transition-all text-indigo-300 hover:text-indigo-200"
            >
              View data
            </button>
          </>
        )}

        {confirmDelete ? (
          <>
            <button
              onClick={() => onDelete(project.id)}
              className="text-xs text-red-400 hover:text-red-300 border border-red-900 hover:border-red-700 rounded-lg px-2 py-2 transition-all"
            >
              Confirm delete
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-xs text-zinc-500 hover:text-zinc-300 border border-zinc-800 rounded-lg px-2 py-2 transition-all"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="text-zinc-700 hover:text-red-400 border border-zinc-800 hover:border-red-900 rounded-lg px-2.5 py-2 transition-all"
            title="Delete project"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default function ProjectsPage() {
  const router = useRouter();
  const { setAppMap, setActiveProjectId, setBuiltAppUrl, reset } = useMomentaiStore();
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [dataProject, setDataProject] = useState<SavedProject | null>(null);

  useEffect(() => { setProjects(getProjects()); }, []);

  const handleOpen = (project: SavedProject) => {
    reset();
    setAppMap(project.appMap);
    setActiveProjectId(project.id);
    if (project.builtAppUrl) setBuiltAppUrl(project.builtAppUrl);
    router.push('/app');
  };

  const handleDelete = (id: string) => {
    deleteProject(id);
    setProjects(getProjects());
  };

  const liveCount = projects.filter((p) => !!p.builtAppUrl).length;

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {dataProject && (
        <DataPanel project={dataProject} onClose={() => setDataProject(null)} />
      )}

      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/app')}>
            <div className="w-2 h-2 rounded-full bg-indigo-500" />
            <span className="text-white font-semibold text-sm tracking-tight">Momentum</span>
          </div>
          <span className="text-zinc-700">/</span>
          <span className="text-zinc-400 text-sm">My Projects</span>
        </div>
        <button
          onClick={() => { reset(); router.push('/app'); }}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Project
        </button>
      </header>

      {/* Summary bar */}
      {projects.length > 0 && (
        <div className="border-b border-zinc-800/60 px-6 py-3 flex items-center gap-6">
          <div className="flex items-center gap-1.5 text-sm">
            <span className="text-white font-semibold">{projects.length}</span>
            <span className="text-zinc-500">{projects.length === 1 ? 'project' : 'projects'}</span>
          </div>
          {liveCount > 0 && (
            <>
              <div className="w-px h-4 bg-zinc-800" />
              <div className="flex items-center gap-1.5 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-white font-semibold">{liveCount}</span>
                <span className="text-zinc-500">live</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-5">
              <svg className="w-6 h-6 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-zinc-300 text-base font-semibold mb-1">No projects yet</p>
            <p className="text-zinc-600 text-sm mb-7">Describe your app to get started.</p>
            <button
              onClick={() => { reset(); router.push('/app'); }}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-6 py-3 rounded-xl transition-colors"
            >
              Build your first app
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p) => (
              <ProjectCard
                key={p.id}
                project={p}
                onOpen={handleOpen}
                onDelete={handleDelete}
                onViewData={setDataProject}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
