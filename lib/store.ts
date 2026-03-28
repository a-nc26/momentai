import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppMap, Moment, FlowEdge, RuntimeStateField, RuntimeValue } from './types';
import { normalizeRuntimeAppMap } from './runtime';

interface MomentaiStore {
  appMap: AppMap | null;
  selectedMomentId: string | null;
  detailMomentId: string | null;
  flaggedMoments: Record<string, string>; // momentId → reason
  isGenerating: boolean;
  isEditing: boolean;
  hasHydrated: boolean;
  builtAppUrl: string | null;
  builtHtml: string | null;
  isBuildingApp: boolean;
  activeProjectId: string | null;
  setActiveProjectId: (id: string | null) => void;
  setAppMap: (map: AppMap) => void;
  selectMoment: (id: string | null) => void;
  setDetailMoment: (id: string | null) => void;
  updateMoment: (momentId: string, updates: Partial<Moment>) => void;
  updateAppRuntime: (updates: { stateSchema?: RuntimeStateField[]; initialState?: Record<string, RuntimeValue>; runtimeVersion?: 1; appPlatform?: 'mobile' | 'web' }) => void;
  setMomentMock: (momentId: string, mockHtml: string) => void;
  addMoments: (moments: Moment[], edges: FlowEdge[]) => void;
  removeEdges: (edgeIds: string[]) => void;
  batchUpdateMoments: (updates: Record<string, Partial<Moment>>) => void;
  flagMoments: (flags: Record<string, string>) => void;
  clearFlag: (momentId: string) => void;
  clearAllFlags: () => void;
  setGenerating: (v: boolean) => void;
  setEditing: (v: boolean) => void;
  markHydrated: () => void;
  setBuiltAppUrl: (url: string | null) => void;
  setBuiltHtml: (html: string | null) => void;
  setBuildingApp: (v: boolean) => void;
  reset: () => void;
}

export const useMomentaiStore = create<MomentaiStore>()(
  persist(
    (set) => ({
      appMap: null,
      selectedMomentId: null,
      detailMomentId: null,
      flaggedMoments: {},
      isGenerating: false,
      isEditing: false,
      hasHydrated: false,
      builtAppUrl: null,
      builtHtml: null,
      isBuildingApp: false,
      activeProjectId: null,
      setActiveProjectId: (activeProjectId) => set({ activeProjectId }),

      setAppMap: (appMap) =>
        set({
          appMap: normalizeRuntimeAppMap(appMap),
          selectedMomentId: null,
          detailMomentId: null,
          flaggedMoments: {},
          builtAppUrl: null,
          builtHtml: null,
        }),

      selectMoment: (selectedMomentId) => set({ selectedMomentId }),

      setDetailMoment: (detailMomentId) => set({ detailMomentId }),

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

      clearAllFlags: () => set({ flaggedMoments: {} }),

      setGenerating: (isGenerating) => set({ isGenerating }),
      setEditing: (isEditing) => set({ isEditing }),
      markHydrated: () => set({ hasHydrated: true }),
      setBuiltAppUrl: (builtAppUrl) => set({ builtAppUrl }),
      setBuiltHtml: (builtHtml) => set({ builtHtml }),
      setBuildingApp: (isBuildingApp) => set({ isBuildingApp }),

      reset: () => set({
        appMap: null,
        selectedMomentId: null,
        detailMomentId: null,
        flaggedMoments: {},
        isGenerating: false,
        isEditing: false,
        builtAppUrl: null,
        builtHtml: null,
        isBuildingApp: false,
        activeProjectId: null,
      }),
    }),
    {
      name: 'momentai-store',
      partialize: (state) => ({ appMap: state.appMap, builtAppUrl: state.builtAppUrl, activeProjectId: state.activeProjectId }),
      // builtHtml and isBuildingApp are intentionally excluded from persistence
      onRehydrateStorage: () => (state) => {
        state?.markHydrated();
      },
    }
  )
);
