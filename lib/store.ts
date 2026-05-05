import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppMap, Moment, FlowEdge, RuntimeStateField, RuntimeValue } from './types';
import { normalizeRuntimeAppMap } from './runtime';

type MomentPatchRecord = Record<string, Partial<Moment>>;

type EditHistoryEntry = {
  id: string;
  label: string;
  before: MomentPatchRecord;
  after: MomentPatchRecord;
  createdAt: number;
};

type ProjectRevision = {
  id: string;
  label: string;
  createdAt: number;
  appMap: AppMap;
};

export type PendingCascadeItem = {
  momentId: string;
  label: string;
  reason: string;
  hasComponentCode: boolean;
};

export type PendingCascade = {
  id: string;
  editedMomentId: string;
  editedLabel: string;
  changeSummary: string;
  items: PendingCascadeItem[];
};

export type CascadeDecision =
  | { action: 'apply'; acceptedMomentIds: string[] }
  | { action: 'skip' }
  | { action: 'undo' };

interface MomentaiStore {
  appMap: AppMap | null;
  selectedMomentId: string | null;
  detailMomentId: string | null;
  activeMomentId: string | null;
  flaggedMoments: Record<string, string>;
  isGenerating: boolean;
  isEditing: boolean;
  editingMomentIds: string[];
  hasHydrated: boolean;
  builtAppUrl: string | null;
  builtHtml: string | null;
  isBuildingApp: boolean;
  editHistory: EditHistoryEntry[];
  editHistoryIndex: number;
  projectRevisions: ProjectRevision[];
  pendingCascade: PendingCascade | null;
  revisionDrawerOpen: boolean;
  activeProjectId: string | null;
  setActiveProjectId: (id: string | null) => void;
  setAppMap: (map: AppMap) => void;
  selectMoment: (id: string | null) => void;
  setDetailMoment: (id: string | null) => void;
  setActiveMomentId: (id: string | null) => void;
  updateMoment: (momentId: string, updates: Partial<Moment>) => void;
  updateAppRuntime: (updates: { stateSchema?: RuntimeStateField[]; initialState?: Record<string, RuntimeValue>; runtimeVersion?: 1; appPlatform?: 'mobile' | 'web' }) => void;
  setMomentMock: (momentId: string, mockHtml: string) => void;
  /** When `clearScreenSpec` is true (e.g. after NL edit), drops structured spec so digest matches generated code. */
  setMomentComponentCode: (
    momentId: string,
    code: string,
    options?: { clearScreenSpec?: boolean }
  ) => void;
  applyMomentEdit: (
    momentId: string,
    payload: {
      componentCode: string;
      metadata?: Partial<Pick<Moment, 'label' | 'description' | 'preview' | 'screenSpec'>>;
    },
    options?: { clearScreenSpec?: boolean }
  ) => void;
  /** One-level undo for the last applied component edit (session-only, not persisted). */
  momentEditUndo: {
    momentId: string;
    componentCode: string;
    screenSpec: Moment['screenSpec'];
  } | null;
  setMomentEditUndo: (
    snapshot: {
      momentId: string;
      componentCode: string;
      screenSpec: Moment['screenSpec'];
    } | null
  ) => void;
  revertMomentEdit: () => void;
  recordEditHistory: (entry: Omit<EditHistoryEntry, 'id' | 'createdAt'>) => void;
  undoEdit: () => void;
  redoEdit: () => void;
  setMomentBuildStatus: (momentId: string, status: 'idle' | 'building' | 'done' | 'error') => void;
  addMoments: (moments: Moment[], edges: FlowEdge[]) => void;
  addEdge: (edge: FlowEdge) => void;
  updateEdge: (edgeId: string, updates: Partial<FlowEdge>) => void;
  removeMoment: (momentId: string) => void;
  removeEdges: (edgeIds: string[]) => void;
  updateJourney: (journeyId: string, updates: { name?: string; description?: string }) => void;
  moveMomentToJourney: (momentId: string, journeyId: string) => void;
  batchUpdateMoments: (updates: Record<string, Partial<Moment>>) => void;
  flagMoments: (flags: Record<string, string>) => void;
  clearFlag: (momentId: string) => void;
  clearFlags: (momentIds: string[]) => void;
  clearAllFlags: () => void;
  startEditingMoment: (momentId: string) => void;
  endEditingMoment: (momentId: string) => void;
  setGenerating: (v: boolean) => void;
  setEditing: (v: boolean) => void;
  recordProjectRevision: (label: string) => void;
  restoreProjectRevision: (revisionId: string) => void;
  setPendingCascade: (cascade: PendingCascade | null) => void;
  resolveCascade: (decision: CascadeDecision) => void;
  setRevisionDrawerOpen: (open: boolean) => void;
  markHydrated: () => void;
  setBuiltAppUrl: (url: string | null) => void;
  setBuiltHtml: (html: string | null) => void;
  setBuildingApp: (v: boolean) => void;
  reset: () => void;
}

function applyMomentPatches(appMap: AppMap, patches: MomentPatchRecord): AppMap {
  return normalizeRuntimeAppMap({
    ...appMap,
    moments: appMap.moments.map((moment) =>
      patches[moment.id] ? { ...moment, ...patches[moment.id] } : moment
    ),
  });
}

function nextEditingState(ids: string[]) {
  return {
    editingMomentIds: ids,
    isEditing: ids.length > 0,
  };
}

export const useMomentaiStore = create<MomentaiStore>()(
  persist(
    (set) => ({
      appMap: null,
      selectedMomentId: null,
      detailMomentId: null,
      activeMomentId: null,
      flaggedMoments: {},
      isGenerating: false,
      isEditing: false,
      editingMomentIds: [],
      hasHydrated: false,
      builtAppUrl: null,
      builtHtml: null,
      isBuildingApp: false,
      editHistory: [],
      editHistoryIndex: -1,
      projectRevisions: [],
      pendingCascade: null,
      revisionDrawerOpen: false,
      activeProjectId: null,
      setActiveProjectId: (activeProjectId) => set({ activeProjectId }),

      setAppMap: (appMap) =>
        set({
          appMap: normalizeRuntimeAppMap(appMap),
          selectedMomentId: null,
          detailMomentId: null,
          activeMomentId: null,
          flaggedMoments: {},
          builtAppUrl: null,
          builtHtml: null,
          momentEditUndo: null,
          editHistory: [],
          editHistoryIndex: -1,
          projectRevisions: [],
          pendingCascade: null,
          revisionDrawerOpen: false,
          ...nextEditingState([]),
        }),

      selectMoment: (selectedMomentId) => set({ selectedMomentId }),

      setDetailMoment: (detailMomentId) => set({ detailMomentId }),

      setActiveMomentId: (activeMomentId) => set({ activeMomentId }),

      updateMoment: (momentId, updates) =>
        set((state) => {
          if (!state.appMap) return state;
          const nextAppMap = normalizeRuntimeAppMap({
            ...state.appMap,
            moments: state.appMap.moments.map((m) =>
              m.id === momentId ? { ...m, ...updates } : m
            ),
          });
          return { appMap: nextAppMap };
        }),

      updateAppRuntime: (updates) =>
        set((state) => {
          if (!state.appMap) return state;
          const nextAppMap = normalizeRuntimeAppMap({
            ...state.appMap,
            ...updates,
          });
          return { appMap: nextAppMap };
        }),

      setMomentMock: (momentId, mockHtml) =>
        set((state) => {
          if (!state.appMap) return state;
          const nextAppMap = normalizeRuntimeAppMap({
            ...state.appMap,
            moments: state.appMap.moments.map((m) =>
              m.id === momentId ? { ...m, mockHtml } : m
            ),
          });
          return { appMap: nextAppMap };
        }),

      momentEditUndo: null,

      setMomentEditUndo: (snapshot) => set({ momentEditUndo: snapshot }),

      revertMomentEdit: () =>
        set((state) => {
          const u = state.momentEditUndo;
          if (!u || !state.appMap) return state;
          const nextAppMap = normalizeRuntimeAppMap({
            ...state.appMap,
            moments: state.appMap.moments.map((m) =>
              m.id === u.momentId
                ? {
                    ...m,
                    componentCode: u.componentCode,
                    screenSpec: u.screenSpec,
                    buildStatus: 'done' as const,
                  }
                : m
            ),
          });
          return { appMap: nextAppMap, momentEditUndo: null };
        }),

      recordEditHistory: (entry) =>
        set((state) => {
          const base = state.editHistory.slice(0, state.editHistoryIndex + 1);
          const nextEntry: EditHistoryEntry = {
            ...entry,
            id: `edit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            createdAt: Date.now(),
          };
          const next = [...base, nextEntry].slice(-50);
          return {
            editHistory: next,
            editHistoryIndex: next.length - 1,
          };
        }),

      undoEdit: () =>
        set((state) => {
          if (!state.appMap || state.editHistoryIndex < 0) return state;
          const entry = state.editHistory[state.editHistoryIndex];
          const nextAppMap = applyMomentPatches(state.appMap, entry.before);
          const previousEntry = state.editHistory[state.editHistoryIndex - 1];
          const previousMomentId =
            previousEntry && Object.keys(previousEntry.after).length > 0
              ? Object.keys(previousEntry.after)[0]
              : null;
          return {
            appMap: nextAppMap,
            editHistoryIndex: state.editHistoryIndex - 1,
            momentEditUndo: previousMomentId
              ? {
                  momentId: previousMomentId,
                  componentCode:
                    (nextAppMap.moments.find((m) => m.id === previousMomentId)?.componentCode ?? ''),
                  screenSpec:
                    nextAppMap.moments.find((m) => m.id === previousMomentId)?.screenSpec,
                }
              : null,
          };
        }),

      redoEdit: () =>
        set((state) => {
          if (!state.appMap || state.editHistoryIndex >= state.editHistory.length - 1) return state;
          const entry = state.editHistory[state.editHistoryIndex + 1];
          const nextAppMap = applyMomentPatches(state.appMap, entry.after);
          const primaryMomentId = Object.keys(entry.after)[0] ?? null;
          return {
            appMap: nextAppMap,
            editHistoryIndex: state.editHistoryIndex + 1,
            momentEditUndo: primaryMomentId
              ? {
                  momentId: primaryMomentId,
                  componentCode: (nextAppMap.moments.find((m) => m.id === primaryMomentId)?.componentCode ?? ''),
                  screenSpec: nextAppMap.moments.find((m) => m.id === primaryMomentId)?.screenSpec,
                }
              : state.momentEditUndo,
          };
        }),

      setMomentComponentCode: (momentId, code, options) =>
        set((state) => {
          if (!state.appMap) return state;
          const trimmed = code.trim();
          if (!trimmed) {
            return {
              appMap: normalizeRuntimeAppMap({
                ...state.appMap,
                moments: state.appMap.moments.map((m) =>
                  m.id === momentId ? { ...m, buildStatus: 'error' as const } : m
                ),
              }),
            };
          }
          const clearScreenSpec = options?.clearScreenSpec === true;
          const nextAppMap = normalizeRuntimeAppMap({
            ...state.appMap,
            moments: state.appMap.moments.map((m) =>
              m.id === momentId
                ? {
                    ...m,
                    componentCode: trimmed,
                    buildStatus: 'done' as const,
                    ...(clearScreenSpec ? { screenSpec: undefined, mockHtml: undefined } : {}),
                  }
                : m
            ),
          });
          return { appMap: nextAppMap };
        }),

      applyMomentEdit: (momentId, payload, options) =>
        set((state) => {
          if (!state.appMap) return state;
          const trimmed = payload.componentCode.trim();
          if (!trimmed) return state;
          const clearScreenSpec = options?.clearScreenSpec === true;
          const metadata = payload.metadata ?? {};
          const nextAppMap = normalizeRuntimeAppMap({
            ...state.appMap,
            moments: state.appMap.moments.map((m) =>
              m.id === momentId
                ? {
                    ...m,
                    ...metadata,
                    componentCode: trimmed,
                    buildStatus: 'done' as const,
                    ...(clearScreenSpec ? { screenSpec: metadata.screenSpec ?? undefined, mockHtml: undefined } : {}),
                  }
                : m
            ),
          });
          return { appMap: nextAppMap };
        }),

      setMomentBuildStatus: (momentId, status) =>
        set((state) => {
          if (!state.appMap) return state;
          return {
            appMap: {
              ...state.appMap,
              moments: state.appMap.moments.map((m) =>
                m.id === momentId ? { ...m, buildStatus: status } : m
              ),
            },
          };
        }),

      addMoments: (moments, edges) =>
        set((state) => {
          if (!state.appMap) return state;
          const existingIds = new Set(state.appMap.moments.map((m) => m.id));
          const newMoments = moments.filter((m) => !existingIds.has(m.id));
          const existingEdgeIds = new Set(state.appMap.edges.map((e) => e.id));
          const newEdges = edges.filter((e) => !existingEdgeIds.has(e.id));
          const nextAppMap = normalizeRuntimeAppMap({
            ...state.appMap,
            moments: [...state.appMap.moments, ...newMoments],
            edges: [...state.appMap.edges, ...newEdges],
          });
          return { appMap: nextAppMap };
        }),

      addEdge: (edge) =>
        set((state) => {
          if (!state.appMap) return state;
          if (state.appMap.edges.some((e) => e.id === edge.id)) return state;
          const nextAppMap = normalizeRuntimeAppMap({
            ...state.appMap,
            edges: [...state.appMap.edges, edge],
          });
          return { appMap: nextAppMap };
        }),

      updateEdge: (edgeId, updates) =>
        set((state) => {
          if (!state.appMap) return state;
          const nextAppMap = normalizeRuntimeAppMap({
            ...state.appMap,
            edges: state.appMap.edges.map((edge) =>
              edge.id === edgeId ? { ...edge, ...updates } : edge
            ),
          });
          return { appMap: nextAppMap };
        }),

      removeMoment: (momentId) =>
        set((state) => {
          if (!state.appMap) return state;
          const nextAppMap = normalizeRuntimeAppMap({
            ...state.appMap,
            moments: state.appMap.moments.filter((moment) => moment.id !== momentId),
            edges: state.appMap.edges.filter((edge) => edge.source !== momentId && edge.target !== momentId),
          });
          return {
            appMap: nextAppMap,
            selectedMomentId: state.selectedMomentId === momentId ? null : state.selectedMomentId,
            detailMomentId: state.detailMomentId === momentId ? null : state.detailMomentId,
            activeMomentId: state.activeMomentId === momentId ? null : state.activeMomentId,
          };
        }),

      removeEdges: (edgeIds) =>
        set((state) => {
          if (!state.appMap) return state;
          const toRemove = new Set(edgeIds);
          const nextAppMap = normalizeRuntimeAppMap({
            ...state.appMap,
            edges: state.appMap.edges.filter((e) => !toRemove.has(e.id)),
          });
          return { appMap: nextAppMap };
        }),

      updateJourney: (journeyId, updates) =>
        set((state) => {
          if (!state.appMap) return state;
          const nextAppMap = normalizeRuntimeAppMap({
            ...state.appMap,
            journeys: state.appMap.journeys.map((journey) =>
              journey.id === journeyId ? { ...journey, ...updates } : journey
            ),
          });
          return { appMap: nextAppMap };
        }),

      moveMomentToJourney: (momentId, journeyId) =>
        set((state) => {
          if (!state.appMap) return state;
          const nextAppMap = normalizeRuntimeAppMap({
            ...state.appMap,
            moments: state.appMap.moments.map((moment) =>
              moment.id === momentId ? { ...moment, journeyId } : moment
            ),
          });
          return { appMap: nextAppMap };
        }),

      batchUpdateMoments: (updates) =>
        set((state) => {
          if (!state.appMap) return state;
          const nextAppMap = normalizeRuntimeAppMap({
            ...state.appMap,
            moments: state.appMap.moments.map((m) => {
              if (!updates[m.id]) return m;
              const patch = updates[m.id];
              const mockHtml = 'mockHtml' in patch
                ? (patch.mockHtml === null ? undefined : patch.mockHtml)
                : m.mockHtml;
              return { ...m, ...patch, mockHtml };
            }),
          });
          return { appMap: nextAppMap };
        }),

      flagMoments: (flags) =>
        set((state) => ({ flaggedMoments: { ...state.flaggedMoments, ...flags } })),

      clearFlag: (momentId) =>
        set((state) => {
          const next = { ...state.flaggedMoments };
          delete next[momentId];
          return { flaggedMoments: next };
        }),

      clearFlags: (momentIds) =>
        set((state) => {
          const next = { ...state.flaggedMoments };
          for (const id of momentIds) delete next[id];
          return { flaggedMoments: next };
        }),

      clearAllFlags: () => set({ flaggedMoments: {} }),

      startEditingMoment: (momentId) =>
        set((state) => {
          if (state.editingMomentIds.includes(momentId)) return state;
          return nextEditingState([...state.editingMomentIds, momentId]);
        }),

      endEditingMoment: (momentId) =>
        set((state) => nextEditingState(state.editingMomentIds.filter((id) => id !== momentId))),

      setGenerating: (isGenerating) => set({ isGenerating }),
      setEditing: (isEditing) => set(nextEditingState(isEditing ? ['__global__'] : [])),
      recordProjectRevision: (label) =>
        set((state) => {
          if (!state.appMap) return state;
          const nextRevision: ProjectRevision = {
            id: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            label,
            createdAt: Date.now(),
            appMap: normalizeRuntimeAppMap(state.appMap),
          };
          return { projectRevisions: [...state.projectRevisions, nextRevision].slice(-20) };
        }),
      restoreProjectRevision: (revisionId) =>
        set((state) => {
          const revision = state.projectRevisions.find((entry) => entry.id === revisionId);
          if (!revision) return state;
          return { appMap: normalizeRuntimeAppMap(revision.appMap) };
        }),
      setPendingCascade: (cascade) => set({ pendingCascade: cascade }),
      resolveCascade: () => set({ pendingCascade: null }),
      setRevisionDrawerOpen: (revisionDrawerOpen) => set({ revisionDrawerOpen }),
      markHydrated: () => set({ hasHydrated: true }),
      setBuiltAppUrl: (builtAppUrl) => set({ builtAppUrl }),
      setBuiltHtml: (builtHtml) => set({ builtHtml }),
      setBuildingApp: (isBuildingApp) => set({ isBuildingApp }),

      reset: () => set({
        appMap: null,
        selectedMomentId: null,
        detailMomentId: null,
        activeMomentId: null,
        flaggedMoments: {},
        isGenerating: false,
        isEditing: false,
        editingMomentIds: [],
        builtAppUrl: null,
        builtHtml: null,
        isBuildingApp: false,
        activeProjectId: null,
        momentEditUndo: null,
        editHistory: [],
        editHistoryIndex: -1,
        projectRevisions: [],
        pendingCascade: null,
        revisionDrawerOpen: false,
      }),
    }),
    {
      name: 'momentai-store',
      partialize: (state) => ({
        appMap: state.appMap,
        builtAppUrl: state.builtAppUrl,
        activeProjectId: state.activeProjectId,
        projectRevisions: state.projectRevisions,
      }),
      // builtHtml and isBuildingApp are intentionally excluded from persistence
      onRehydrateStorage: () => (state) => {
        state?.markHydrated();
      },
    }
  )
);
