import { AppMap } from './types';

export interface SavedProject {
  id: string;
  name: string;
  description: string;
  createdAt: number;
  updatedAt: number;
  appMap: AppMap;
  builtAppUrl?: string;
}

const STORAGE_KEY = 'momentai-projects';

function readAll(): SavedProject[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function writeAll(projects: SavedProject[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function getProjects(): SavedProject[] {
  return readAll().sort((a, b) => b.updatedAt - a.updatedAt);
}

export function createProject(appMap: AppMap, builtAppUrl?: string): SavedProject {
  const project: SavedProject = {
    id: crypto.randomUUID(),
    name: appMap.appName,
    description: appMap.appDescription,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    appMap,
    builtAppUrl,
  };
  writeAll([...readAll(), project]);
  return project;
}

export function updateProject(id: string, updates: Partial<Pick<SavedProject, 'appMap' | 'builtAppUrl' | 'name'>>) {
  const projects = readAll();
  const idx = projects.findIndex((p) => p.id === id);
  if (idx === -1) return;
  projects[idx] = {
    ...projects[idx],
    ...updates,
    name: updates.appMap?.appName ?? updates.name ?? projects[idx].name,
    description: updates.appMap?.appDescription ?? projects[idx].description,
    updatedAt: Date.now(),
  };
  writeAll(projects);
}

export function deleteProject(id: string) {
  writeAll(readAll().filter((p) => p.id !== id));
}

export function getProject(id: string): SavedProject | null {
  return readAll().find((p) => p.id === id) ?? null;
}
