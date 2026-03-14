import { create } from 'zustand';
import { AppMap, Moment, FlowEdge } from './types';

interface MomentaiStore {
  appMap: AppMap | null;
  selectedMomentId: string | null;
  detailMomentId: string | null;
  flaggedMoments: Record<string, string>; // momentId → reason
  isGenerating: boolean;
  isEditing: boolean;
  setAppMap: (map: AppMap) => void;
  selectMoment: (id: string | null) => void;
  setDetailMoment: (id: string | null) => void;
  updateMoment: (momentId: string, updates: Partial<Moment>) => void;
  setMomentMock: (momentId: string, mockHtml: string) => void;
  addMoments: (moments: Moment[], edges: FlowEdge[]) => void;
  removeEdges: (edgeIds: string[]) => void;
  batchUpdateMoments: (updates: Record<string, Partial<Moment>>) => void;
  flagMoments: (flags: Record<string, string>) => void;
  clearFlag: (momentId: string) => void;
  clearAllFlags: () => void;
  setGenerating: (v: boolean) => void;
  setEditing: (v: boolean) => void;
  reset: () => void;
}

export const useMomentaiStore = create<MomentaiStore>((set) => ({
  appMap: null,
  selectedMomentId: null,
  detailMomentId: null,
  flaggedMoments: {},
  isGenerating: false,
  isEditing: false,

  setAppMap: (appMap) => set({ appMap, selectedMomentId: null, detailMomentId: null, flaggedMoments: {} }),

  selectMoment: (selectedMomentId) => set({ selectedMomentId }),

  setDetailMoment: (detailMomentId) => set({ detailMomentId }),

  updateMoment: (momentId, updates) =>
    set((state) => {
      if (!state.appMap) return state;
      return {
        appMap: {
          ...state.appMap,
          moments: state.appMap.moments.map((m) =>
            m.id === momentId ? { ...m, ...updates } : m
          ),
        },
      };
    }),

  setMomentMock: (momentId, mockHtml) =>
    set((state) => {
      if (!state.appMap) return state;
      return {
        appMap: {
          ...state.appMap,
          moments: state.appMap.moments.map((m) =>
            m.id === momentId ? { ...m, mockHtml } : m
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
      return {
        appMap: {
          ...state.appMap,
          moments: [...state.appMap.moments, ...newMoments],
          edges: [...state.appMap.edges, ...newEdges],
        },
      };
    }),

  removeEdges: (edgeIds) =>
    set((state) => {
      if (!state.appMap) return state;
      const toRemove = new Set(edgeIds);
      return {
        appMap: {
          ...state.appMap,
          edges: state.appMap.edges.filter((e) => !toRemove.has(e.id)),
        },
      };
    }),

  batchUpdateMoments: (updates) =>
    set((state) => {
      if (!state.appMap) return state;
      return {
        appMap: {
          ...state.appMap,
          moments: state.appMap.moments.map((m) => {
            if (!updates[m.id]) return m;
            const patch = updates[m.id];
            // null mockHtml means "clear the cached mock so it re-streams"
            const mockHtml = 'mockHtml' in patch
              ? (patch.mockHtml === null ? undefined : patch.mockHtml)
              : m.mockHtml;
            return { ...m, ...patch, mockHtml };
          }),
        },
      };
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
  reset: () => set({ appMap: null, selectedMomentId: null, detailMomentId: null, flaggedMoments: {}, isGenerating: false, isEditing: false }),
}));
