'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getProjects, deleteProject, SavedProject } from '@/lib/projects';
import { useMomentaiStore } from '@/lib/store';

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${d}d ago`;
}

function ProjectCard({
  project,
  onOpen,
  onDelete,
}: {
  project: SavedProject;
  onOpen: (p: SavedProject) => void;
  onDelete: (id: string) => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const journeyCount = project.appMap.journeys?.length ?? 0;
  const momentCount = project.appMap.moments?.length ?? 0;

  return (
    <div className="group relative bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-5 flex flex-col gap-4 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-white font-semibold text-sm truncate">{project.name}</h3>
          <p className="text-zinc-500 text-xs mt-1 line-clamp-2 leading-relaxed">{project.description}</p>
        </div>
        {project.builtAppUrl && (
          <span className="shrink-0 text-[10px] uppercase tracking-widest text-emerald-400 border border-emerald-800 rounded-full px-2 py-0.5">
            Live
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-zinc-600">
        <span>{journeyCount} {journeyCount === 1 ? 'journey' : 'journeys'}</span>
        <span>·</span>
        <span>{momentCount} {momentCount === 1 ? 'moment' : 'moments'}</span>
        <span>·</span>
        <span>{timeAgo(project.updatedAt)}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onOpen(project)}
          className="flex-1 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg px-3 py-2 transition-colors"
        >
          Open
        </button>

        {project.builtAppUrl && (
          <a
            href={project.builtAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 rounded-lg px-3 py-2 transition-all"
          >
            View app
          </a>
        )}

        {confirmDelete ? (
          <div className="flex gap-1">
            <button
              onClick={() => onDelete(project.id)}
              className="text-xs text-red-400 hover:text-red-300 border border-red-900 hover:border-red-700 rounded-lg px-2 py-2 transition-all"
            >
              Delete
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="text-xs text-zinc-500 hover:text-zinc-300 border border-zinc-800 rounded-lg px-2 py-2 transition-all"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="text-zinc-600 hover:text-red-400 border border-zinc-800 hover:border-red-900 rounded-lg px-3 py-2 transition-all"
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

export default function ProjectsPage() {
  const router = useRouter();
  const { setAppMap, setActiveProjectId, setBuiltAppUrl, reset } = useMomentaiStore();
  const [projects, setProjects] = useState<SavedProject[]>([]);

  useEffect(() => {
    setProjects(getProjects());
  }, []);

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

  const handleNew = () => {
    reset();
    router.push('/app');
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-indigo-500" />
          <span className="text-white font-semibold text-sm tracking-tight">Momentum</span>
        </div>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Project
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-12">
        <div className="mb-10">
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-zinc-500 text-sm mt-1">
            {projects.length === 0 ? 'No projects yet.' : `${projects.length} saved ${projects.length === 1 ? 'project' : 'projects'}`}
          </p>
        </div>

        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-zinc-400 text-sm font-medium mb-1">No projects yet</p>
            <p className="text-zinc-600 text-sm mb-6">Describe your app and save it to your project bank.</p>
            <button
              onClick={handleNew}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
            >
              Start your first project
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
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
