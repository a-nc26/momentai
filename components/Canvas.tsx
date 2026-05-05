'use client';

import { useEffect, useCallback, useMemo, useState, useRef, type ComponentProps } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  MiniMapNode,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Node,
  Edge,
  Connection,
  EdgeChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useMomentaiStore } from '@/lib/store';
import MomentNode from './MomentNode';
import JourneyGroupNode from './JourneyGroupNode';
import DataFlowEdge from './DataFlowEdge';
import { JOURNEY_COLORS } from '@/lib/colors';
import type { AppMap, FlowEdge, Moment } from '@/lib/types';
import {
  getMomentNodeDimensions,
  createCanvasPositionResolver,
  deriveExpandedBranchAnchor,
  isBranchMomentShown,
  JOURNEY_GROUP_HEADER,
  JOURNEY_GROUP_PADDING,
} from '@/lib/canvasLayout';
import { attachSpatialHandles } from '@/lib/edge-spatial';
import { DEMO_EDIT_MOMENT_ID } from '@/lib/demo-edit';
import AddScreenPopover from './canvas/AddScreenPopover';
import DeleteMomentDialog from './canvas/DeleteMomentDialog';
import RevisionHistoryDrawer from './canvas/RevisionHistoryDrawer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const nodeTypes = {
  momentNode: MomentNode,
  journeyGroup: JourneyGroupNode,
};

const edgeTypes = {
  smoothstep: DataFlowEdge,
};

/** Journey group frames are huge; don't draw them in the minimap (avoids big colored slabs). */
function miniMapOmitJourneyFrame(props: ComponentProps<typeof MiniMapNode>) {
  if (props.id.startsWith('journey-')) {
    return <g />;
  }
  return <MiniMapNode {...props} />;
}

/** 1 Overview · 2 Journey · 3 Screens · 4 Data flow — toolbar only (not tied to map zoom). */
export type MapViewMode = 1 | 2 | 3 | 4;

function buildNodes(
  appMap: AppMap,
  flaggedMoments: Record<string, string>,
  activeMomentId: string | null,
  editingMomentIds: string[],
  viewMode: MapViewMode,
  expandedBranchParentId: string | null,
  onRenameJourney: (journeyId: string, name: string) => void,
  positionOverrides: Record<string, { x: number; y: number }> = {},
): Node[] {
  const resolvePosition = createCanvasPositionResolver(
    appMap,
    viewMode,
    expandedBranchParentId
  );
  const { w: mw, h: mh } = getMomentNodeDimensions(viewMode);
  const nodes: Node[] = [];

  const effectivePosition = (moment: Moment) => {
    const computed = resolvePosition(moment);
    // Keep user-moved top-level spine cards in-place across rerenders while ensuring
    // journey frame math uses the same coordinates as rendered nodes.
    if (!appMap.demoMode && !moment.branchOf) {
      return positionOverrides[moment.id] ?? computed;
    }
    return computed;
  };

  const bounds: Record<string, { minX: number; minY: number; maxX: number; maxY: number; count: number }> = {};
  for (const moment of appMap.moments) {
    if (moment.parentMomentId) continue;
    const jid = moment.journeyId;
    if (!bounds[jid]) {
      bounds[jid] = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity, count: 0 };
    }
    const p = effectivePosition(moment);
    const b = bounds[jid];
    b.minX = Math.min(b.minX, p.x);
    b.minY = Math.min(b.minY, p.y);
    b.maxX = Math.max(b.maxX, p.x + mw);
    b.maxY = Math.max(b.maxY, p.y + mh);
    b.count++;
  }

  for (let i = 0; i < appMap.journeys.length; i++) {
    const journey = appMap.journeys[i];
    const color = JOURNEY_COLORS[i % JOURNEY_COLORS.length];
    const b = bounds[journey.id];
    if (!b) continue;

    nodes.push({
      id: `journey-${journey.id}`,
      type: 'journeyGroup',
      position: {
        x: b.minX - JOURNEY_GROUP_PADDING,
        y: b.minY - JOURNEY_GROUP_PADDING - JOURNEY_GROUP_HEADER,
      },
      data: {
        journeyId: journey.id,
        label: journey.name,
        color,
        screenCount: b.count,
        birdsEye: viewMode === 1,
        onRenameJourney,
      },
      style: {
        width: b.maxX - b.minX + JOURNEY_GROUP_PADDING * 2,
        height: b.maxY - b.minY + JOURNEY_GROUP_PADDING * 2 + JOURNEY_GROUP_HEADER,
        zIndex: 0,
      },
      draggable: false,
      selectable: false,
    });
  }

  if (viewMode === 1) return nodes;

  for (const moment of appMap.moments) {
    if (moment.parentMomentId) continue;
    const journeyIndex = appMap.journeys.findIndex((j) => j.id === moment.journeyId);
    const color = JOURNEY_COLORS[journeyIndex % JOURNEY_COLORS.length];
    const journey = appMap.journeys.find((j) => j.id === moment.journeyId);
    const flagReason = flaggedMoments[moment.id];
    const subflowCount = appMap.moments.filter((entry) => entry.parentMomentId === moment.id).length;
    const branchCount = appMap.moments.filter((entry) => entry.branchOf === moment.id).length;

    nodes.push({
      id: moment.id,
      type: 'momentNode',
      style: { zIndex: 1 },
      position: effectivePosition(moment),
      data: {
        moment,
        color,
        journeyName: journey?.name ?? '',
        flagged: !!flagReason,
        flagReason: flagReason ?? '',
        hasSubflow: subflowCount > 0,
        subflowCount,
        branchCount,
        active: moment.id === activeMomentId,
        editing: editingMomentIds.includes(moment.id),
        buildStatus: moment.buildStatus ?? 'idle',
        viewMode,
      },
    });
  }

  return nodes;
}

function buildEdges(appMap: AppMap, viewMode: MapViewMode): Edge[] {
  if (viewMode === 1) {
    const journeyEdges: Edge[] = [];
    const seen = new Set<string>();

    for (const edge of appMap.edges) {
      const srcMoment = appMap.moments.find((m) => m.id === edge.source);
      const tgtMoment = appMap.moments.find((m) => m.id === edge.target);
      if (!srcMoment || !tgtMoment) continue;
      if (srcMoment.journeyId === tgtMoment.journeyId) continue;

      const key = `${srcMoment.journeyId}→${tgtMoment.journeyId}`;
      if (seen.has(key)) continue;
      seen.add(key);

      journeyEdges.push({
        id: `je-${key}`,
        source: `journey-${srcMoment.journeyId}`,
        target: `journey-${tgtMoment.journeyId}`,
        type: 'smoothstep',
        style: { stroke: '#52525b', strokeWidth: 2, strokeDasharray: '6 4' },
        data: { viewMode: 1 as const, emphasis: 'high' as const },
      });
    }
    return journeyEdges;
  }

  const hiddenMomentIds = new Set(
    appMap.moments.filter((moment) => moment.parentMomentId).map((moment) => moment.id)
  );

  const showLabels = viewMode >= 3;

  return appMap.edges
    .filter((edge) => !hiddenMomentIds.has(edge.source) && !hiddenMomentIds.has(edge.target))
    .map((edge) => {
      const srcMoment = appMap.moments.find((m) => m.id === edge.source);
      const tgtMoment = appMap.moments.find((m) => m.id === edge.target);
      const isCrossJourney = srcMoment?.journeyId !== tgtMoment?.journeyId;
      
      // Much more subtle colors - let nodes be the focus
      const edgeColor = isCrossJourney ? '#6366f1' : '#52525b';
      
      return {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: showLabels ? edge.label : undefined,
        type: 'smoothstep',
        style: { 
          stroke: edgeColor, 
          strokeWidth: viewMode >= 3 ? 1.5 : 1,
          strokeOpacity: isCrossJourney ? 0.25 : 0.15,
        },
        labelStyle: showLabels ? { fill: '#71717a', fontSize: 10, fontWeight: 500 } : undefined,
        labelBgStyle: showLabels ? { fill: '#09090b', fillOpacity: 0.95 } : undefined,
        labelBgPadding: showLabels ? ([8, 4] as [number, number]) : undefined,
        labelBgBorderRadius: showLabels ? 4 : undefined,
        data: {
          viewMode,
          ...edge,
          emphasis: 'high' as const,
        },
        animated: false,
        markerEnd: {
          type: 'arrowclosed' as const,
          color: edgeColor,
          width: 12,
          height: 12,
        },
      };
    });
}

function CanvasContent() {
  const {
    appMap,
    selectMoment,
    selectedMomentId,
    activeMomentId,
    setActiveMomentId,
    flaggedMoments,
    editingMomentIds,
    addEdge,
    updateEdge,
    removeEdges,
    updateJourney,
    recordProjectRevision,
    setRevisionDrawerOpen,
  } = useMomentaiStore();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesStateChange] = useEdgesState<Edge>([]);
  const { fitView } = useReactFlow();
  const [viewMode, setViewMode] = useState<MapViewMode>(3);
  const [paneAddOpen, setPaneAddOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const expandedId = useMemo(
    () => (appMap ? deriveExpandedBranchAnchor(activeMomentId, appMap) : null),
    [activeMomentId, appMap]
  );
  // Suppress auto-scroll when the canvas click itself set activeMomentId
  const suppressAutoScrollRef = useRef(false);
  /** Only run fitView when the active moment actually changes — not on every appMap edit (which was resetting pan/zoom). */
  const prevActiveMomentIdRef = useRef<string | null>(null);
  const renameJourney = useCallback(
    (journeyId: string, name: string) => {
      updateJourney(journeyId, { name });
      recordProjectRevision(`Rename journey to "${name}"`);
    },
    [recordProjectRevision, updateJourney]
  );

  const spatialEdges = useMemo(() => {
    if (!appMap) return [];
    const base = buildEdges(appMap, viewMode);
    return attachSpatialHandles(base, appMap, viewMode, nodes, expandedId);
  }, [appMap, viewMode, nodes, expandedId]);

  useEffect(() => {
    setEdges(spatialEdges);
  }, [spatialEdges, setEdges]);

  useEffect(() => {
    if (!appMap) return;
    setNodes((prev) => {
      const posMap = Object.fromEntries(prev.map((n) => [n.id, n.position]));
      return buildNodes(
        appMap,
        flaggedMoments,
        activeMomentId,
        editingMomentIds,
        viewMode,
        expandedId,
        renameJourney,
        posMap
      ).map((n) => ({
        ...n,
        selected: n.id === selectedMomentId,
      }));
    });
  }, [
    appMap,
    flaggedMoments,
    activeMomentId,
    editingMomentIds,
    viewMode,
    expandedId,
    renameJourney,
    selectedMomentId,
  ]);

  useEffect(() => {
    setNodes((nds) =>
      nds.map((n) => ({ ...n, selected: n.id === selectedMomentId }))
    );
  }, [selectedMomentId]);

  // When runtime / iframe navigation changes activeMomentId, pan to that node.
  // Branch expand/collapse is derived from activeMomentId (see deriveExpandedBranchAnchor).
  useEffect(() => {
    if (!activeMomentId || !appMap) {
      prevActiveMomentIdRef.current = activeMomentId;
      return;
    }

    const prevActive = prevActiveMomentIdRef.current;
    prevActiveMomentIdRef.current = activeMomentId;
    const activeChanged = prevActive !== activeMomentId;
    if (!activeChanged) return;

    // Don't auto-scroll when the canvas click was the source — the user already sees the node
    if (suppressAutoScrollRef.current) {
      suppressAutoScrollRef.current = false;
      return;
    }

    const neighborIds = new Set<string>([activeMomentId]);
    for (const edge of appMap.edges) {
      if (edge.source === activeMomentId) neighborIds.add(edge.target);
      if (edge.target === activeMomentId) neighborIds.add(edge.source);
    }
    const nodesToFit = [...neighborIds].map((id) => ({ id }));

    const timer = setTimeout(() => {
      fitView({
        nodes: nodesToFit,
        padding: 0.18,
        duration: 400,
        minZoom: 0.35,
        maxZoom: 1.25,
      });
    }, 200);
    return () => clearTimeout(timer);
  }, [activeMomentId, appMap, fitView]);

  const visibleNodes = useMemo(() => {
    const largeGraph = (appMap?.moments.length ?? 0) > 50;
    const focusIds = new Set<string>();
    if (largeGraph && appMap) {
      const focusId = selectedMomentId ?? activeMomentId;
      if (focusId) {
        focusIds.add(focusId);
        for (const edge of appMap.edges) {
          if (edge.source === focusId) focusIds.add(edge.target);
          if (edge.target === focusId) focusIds.add(edge.source);
        }
      }
    }
    return nodes.map((n) => {
      if (n.type === 'journeyGroup') return { ...n, hidden: false };
      const moment = (n.data as { moment?: Moment })?.moment;
      if (!moment || !appMap) return { ...n, hidden: false };
      if (largeGraph && focusIds.size > 0 && !focusIds.has(moment.id)) {
        return { ...n, hidden: true };
      }
      if (!moment.branchOf) return { ...n, hidden: false };
      return { ...n, hidden: !isBranchMomentShown(moment, expandedId, appMap) };
    });
  }, [nodes, expandedId, appMap, selectedMomentId, activeMomentId]);

  const hiddenNodeIds = useMemo(
    () => new Set(visibleNodes.filter((n) => n.hidden).map((n) => n.id)),
    [visibleNodes]
  );

  const visibleEdges = useMemo(() => {
    if (!appMap) {
      return edges.map((e) => ({ ...e, hidden: hiddenNodeIds.has(e.source) || hiddenNodeIds.has(e.target) }));
    }

    const selectedJourneyId = selectedMomentId
      ? appMap.moments.find((m) => m.id === selectedMomentId)?.journeyId
      : null;
    const hasMapFocus = !!selectedMomentId || !!expandedId;
    /** Bird's-eye journey wires stay readable; dimming applies in screen-level zoom only. */
    const applyFocusDim = viewMode >= 2;

    return edges.map((e) => {
      const isHidden = hiddenNodeIds.has(e.source) || hiddenNodeIds.has(e.target);
      const srcMoment = appMap.moments.find((m) => m.id === e.source);
      const tgtMoment = appMap.moments.find((m) => m.id === e.target);

      const touchesSelected =
        !!selectedMomentId && (e.source === selectedMomentId || e.target === selectedMomentId);

      const inSelectedJourney =
        !!selectedJourneyId &&
        !!srcMoment &&
        !!tgtMoment &&
        srcMoment.journeyId === selectedJourneyId &&
        tgtMoment.journeyId === selectedJourneyId;

      const bothEndsVisibleUnderExpand =
        !!expandedId &&
        !!srcMoment &&
        !!tgtMoment &&
        isBranchMomentShown(srcMoment, expandedId, appMap) &&
        isBranchMomentShown(tgtMoment, expandedId, appMap);

      const inBranchFocus =
        !!expandedId &&
        (e.source === expandedId ||
          e.target === expandedId ||
          srcMoment?.branchOf === expandedId ||
          tgtMoment?.branchOf === expandedId ||
          (!!srcMoment?.branchOf &&
            !!tgtMoment?.branchOf &&
            srcMoment.branchOf === expandedId &&
            tgtMoment.branchOf === expandedId) ||
          (bothEndsVisibleUnderExpand &&
            (!!srcMoment.branchOf || !!tgtMoment.branchOf)));

      /** Main-flow edge out of a fork: parent → target that is *not* a direct branch child of that parent. */
      const isSpineSuccessorFromBranchParent =
        !!expandedId &&
        e.source === expandedId &&
        !!tgtMoment &&
        tgtMoment.branchOf !== expandedId;

      const inFocus =
        !applyFocusDim ||
        !hasMapFocus ||
        touchesSelected ||
        inSelectedJourney ||
        inBranchFocus ||
        isSpineSuccessorFromBranchParent;

      const isConnectedToSelected = Boolean(
        selectedMomentId && (e.source === selectedMomentId || e.target === selectedMomentId)
      );

      const baseData = {
        viewMode,
        ...(typeof e.data === 'object' && e.data !== null ? e.data : {}),
      };

      return {
        ...e,
        hidden: isHidden,
        selected: isConnectedToSelected,
        data: {
          ...baseData,
          emphasis:
            isHidden || !applyFocusDim ? 'high' : inFocus ? 'high' : ('low' as const),
        },
        style:
          isHidden
            ? e.style
            : isConnectedToSelected
              ? {
                  ...e.style,
                  strokeOpacity: 0.88,
                  strokeWidth: 2.5,
                }
              : applyFocusDim && hasMapFocus && !inFocus
                ? {
                    ...e.style,
                    strokeOpacity: 0.22,
                    strokeWidth: 1.25,
                  }
                : e.style,
      };
    });
  }, [edges, hiddenNodeIds, selectedMomentId, expandedId, appMap, viewMode]);

  // Single-click: select moment to open edit panel
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (node.type === 'journeyGroup') return;

      // Mark that THIS activeMomentId change came from a canvas click — skip auto-scroll
      suppressAutoScrollRef.current = true;
      selectMoment(node.id);
      setActiveMomentId(node.id);

      // Branch visibility follows activeMomentId (deriveExpandedBranchAnchor); clicking a
      // node with branches still fits the parent + its branch column for context.
      const hasBranches = appMap?.moments.some((m) => m.branchOf === node.id);
      if (hasBranches) {
        setTimeout(() => {
          const subNodes = (appMap?.moments ?? [])
            .filter((m) => m.branchOf === node.id || m.id === node.id)
            .map((m) => ({ id: m.id }));
          fitView({ nodes: subNodes, padding: 0.3, duration: 500 });
        }, 120);
      }
    },
    [selectMoment, setActiveMomentId, appMap, fitView]
  );

  // Double-click a journey group → exit bird's eye and zoom into that journey's screens
  // Double-click a moment node → zoom in to focus on that node + its connected neighbors
  const onNodeDoubleClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (!appMap) return;

      if (node.type === 'journeyGroup') {
        const journeyId = (node.id as string).replace('journey-', '');
        const momentsInJourney = appMap.moments.filter(
          (m) => m.journeyId === journeyId && !m.parentMomentId
        );
        if (momentsInJourney.length === 0) return;

        setViewMode(3);
        setTimeout(() => {
          fitView({
            nodes: momentsInJourney.map((m) => ({ id: m.id })),
            padding: 0.25,
            duration: 500,
          });
        }, 80);
        return;
      }

      // Moment node: zoom in on this node + its immediate neighbors
      const connectedIds = new Set<string>([node.id]);
      for (const edge of appMap.edges) {
        if (edge.source === node.id) connectedIds.add(edge.target);
        if (edge.target === node.id) connectedIds.add(edge.source);
      }

      const focusMomentIds = appMap.moments
        .filter((m) => connectedIds.has(m.id))
        .map((m) => ({ id: m.id }));

      fitView({
        nodes: focusMomentIds.length > 0 ? focusMomentIds : [{ id: node.id }],
        padding: 0.35,
        duration: 500,
        minZoom: 0.8,
        maxZoom: 1.5,
      });
    },
    [appMap, fitView]
  );

  const onPaneClick = useCallback(() => {
    selectMoment(null);
  }, [selectMoment]);

  const zoomToAll = useCallback(() => {
    fitView({ padding: 0.15, duration: 500 });
  }, [fitView]);

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;
      const edge: FlowEdge = {
        id: `edge-${connection.source}-${connection.target}-${Date.now().toString(36).slice(-4)}`,
        source: connection.source,
        target: connection.target,
        label: 'Continue',
      };
      addEdge(edge);
      recordProjectRevision(`Connect ${connection.source} -> ${connection.target}`);
    },
    [addEdge, recordProjectRevision]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      onEdgesStateChange(changes);
      const removed = changes
        .filter((change) => change.type === 'remove')
        .map((change) => change.id);
      if (removed.length > 0) {
        removeEdges(removed);
        recordProjectRevision(`Delete ${removed.length} edge(s)`);
      }
    },
    [onEdgesStateChange, recordProjectRevision, removeEdges]
  );

  const onReconnect = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      if (!newConnection.source || !newConnection.target) return;
      updateEdge(oldEdge.id, {
        source: newConnection.source,
        target: newConnection.target,
      });
      recordProjectRevision(`Reconnect edge ${oldEdge.id}`);
    },
    [recordProjectRevision, updateEdge]
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        const activeElement = document.activeElement as HTMLElement | null;
        if (activeElement && ['INPUT', 'TEXTAREA'].includes(activeElement.tagName)) return;
        if (!selectedMomentId) return;
        event.preventDefault();
        setDeleteOpen(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedMomentId]);

  return (
    <div className="w-full h-full [&_.react-flow__node]:transition-[transform,filter] [&_.react-flow__node]:duration-300 [&_.react-flow__node]:ease-out">
      <ReactFlow
        nodes={visibleNodes}
        edges={visibleEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onReconnect={onReconnect}
        onNodeClick={onNodeClick}
        onNodeDoubleClick={onNodeDoubleClick}
        onPaneClick={onPaneClick}
        nodesDraggable
        selectNodesOnDrag={false}
        fitView
        fitViewOptions={{ padding: 0.12 }}
        minZoom={0.15}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          color="#3f3f46"
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.5}
          className="opacity-40"
        />
        <Controls className="!bg-zinc-900 !border-zinc-700 [&>button]:!bg-zinc-900 [&>button]:!border-zinc-700 [&>button]:!text-zinc-400 [&>button:hover]:!bg-zinc-800" />
        <MiniMap
          className="!bg-zinc-900 !border-zinc-700"
          nodeColor={(node) => (node.data as { color?: string })?.color ?? '#52525b'}
          nodeComponent={miniMapOmitJourneyFrame}
          maskColor="rgba(9,9,11,0.7)"
        />

        {/* View mode (not map zoom) */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          {/* View selector */}
          <div className="flex items-center gap-1 bg-zinc-900/90 border border-zinc-700 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setViewMode(1)}
              className={`px-2 py-1 rounded text-[10px] font-medium uppercase tracking-wider transition-all ${
                viewMode === 1 ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title="Journey boxes only"
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => setViewMode(2)}
              className={`px-2 py-1 rounded text-[10px] font-medium uppercase tracking-wider transition-all ${
                viewMode === 2 ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title="Screens inside journey frames"
            >
              Journey
            </button>
            <button
              type="button"
              onClick={() => setViewMode(3)}
              className={`px-2 py-1 rounded text-[10px] font-medium uppercase tracking-wider transition-all ${
                viewMode === 3 ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title="All screen details + edge labels"
            >
              Screens
            </button>
            <button
              type="button"
              onClick={() => setViewMode(4)}
              className={`px-2 py-1 rounded text-[10px] font-medium uppercase tracking-wider transition-all ${
                viewMode === 4 ? 'bg-indigo-600 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title="Details + data flow on edges"
            >
              Data Flow
            </button>
          </div>

          {appMap?.demoMode &&
            appMap.moments.some((m) => m.id === DEMO_EDIT_MOMENT_ID) && (
              <button
                type="button"
                onClick={() => {
                  selectMoment(DEMO_EDIT_MOMENT_ID);
                  setActiveMomentId(DEMO_EDIT_MOMENT_ID);
                }}
                title="Open the completion screen and run the canned demo edit + cascade"
                className="px-2.5 py-1.5 rounded-lg text-[10px] font-semibold uppercase tracking-wide bg-indigo-500/15 border border-indigo-500/40 text-indigo-200 hover:text-white hover:border-indigo-400/60 hover:bg-indigo-500/25 transition-all"
              >
                Try demo edit
              </button>
            )}

          <button
            onClick={zoomToAll}
            title="Fit all"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900/90 border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 transition-all"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
              <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
              <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
              <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            Fit all
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900/90 border border-zinc-700 text-zinc-200 hover:text-white hover:border-zinc-500 transition-all"
              >
                Compose ▾
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onSelect={(event) => {
                  event.preventDefault();
                  setPaneAddOpen(true);
                }}
              >
                Add screen
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={!selectedMomentId}
                onSelect={(event) => {
                  event.preventDefault();
                  setDeleteOpen(true);
                }}
              >
                Delete selected screen
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setRevisionDrawerOpen(true)}>
                Revision history
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <AddScreenPopover
            open={paneAddOpen}
            onOpenChange={setPaneAddOpen}
            sourceMomentId={selectedMomentId ?? undefined}
            trigger={<span className="hidden" />}
          />
        </div>

        <RevisionHistoryDrawer />
        <DeleteMomentDialog
          momentId={selectedMomentId}
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
        />

        {/* Hint */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
          <div className="text-[11px] text-zinc-600 bg-zinc-900/70 px-3 py-1 rounded-full border border-zinc-800">
            {viewMode === 1
              ? 'Double-click a journey to zoom in · Use view modes above to see screens'
              : 'Drag to pan · Scroll to zoom · Hover a screen for its actions · Del to remove selected'}
          </div>
        </div>
      </ReactFlow>
    </div>
  );
}

export default function Canvas() {
  return (
    <ReactFlowProvider>
      <CanvasContent />
    </ReactFlowProvider>
  );
}
