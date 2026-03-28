'use client';

import { useEffect, useCallback, useMemo, useState } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Node,
  Edge,
  Viewport,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useMomentaiStore } from '@/lib/store';
import MomentNode from './MomentNode';
import JourneyGroupNode from './JourneyGroupNode';
import { JOURNEY_COLORS } from '@/lib/colors';
import { AppMap } from '@/lib/types';

const nodeTypes = {
  momentNode: MomentNode,
  journeyGroup: JourneyGroupNode,
};

const JOURNEY_PADDING = 40;
const JOURNEY_HEADER_HEIGHT = 48;

// Zoom threshold below which we collapse into bird's eye (journey-only) mode
const BIRDS_EYE_ZOOM = 0.38;

function buildJourneyBounds(appMap: AppMap) {
  const bounds: Record<string, { minX: number; minY: number; maxX: number; maxY: number; count: number }> = {};

  for (const moment of appMap.moments) {
    if (moment.parentMomentId) continue;
    const jid = moment.journeyId;
    if (!bounds[jid]) {
      bounds[jid] = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity, count: 0 };
    }
    const b = bounds[jid];
    b.minX = Math.min(b.minX, moment.position.x);
    b.minY = Math.min(b.minY, moment.position.y);
    b.maxX = Math.max(b.maxX, moment.position.x + 220);
    b.maxY = Math.max(b.maxY, moment.position.y + 120);
    b.count++;
  }
  return bounds;
}

function buildNodes(
  appMap: AppMap,
  flaggedMoments: Record<string, string>,
  activeMomentId: string | null,
  birdsEye: boolean,
): Node[] {
  const bounds = buildJourneyBounds(appMap);
  const nodes: Node[] = [];

  for (let i = 0; i < appMap.journeys.length; i++) {
    const journey = appMap.journeys[i];
    const color = JOURNEY_COLORS[i % JOURNEY_COLORS.length];
    const b = bounds[journey.id];
    if (!b) continue;

    nodes.push({
      id: `journey-${journey.id}`,
      type: 'journeyGroup',
      position: {
        x: b.minX - JOURNEY_PADDING,
        y: b.minY - JOURNEY_PADDING - JOURNEY_HEADER_HEIGHT,
      },
      data: {
        label: journey.name,
        color,
        screenCount: b.count,
        birdsEye,
      },
      style: {
        width: b.maxX - b.minX + JOURNEY_PADDING * 2,
        height: b.maxY - b.minY + JOURNEY_PADDING * 2 + JOURNEY_HEADER_HEIGHT,
      },
      draggable: false,
      selectable: false,
    });
  }

  if (birdsEye) return nodes;

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
      position: moment.position,
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
        buildStatus: moment.buildStatus ?? 'idle',
      },
    });
  }

  return nodes;
}

function buildEdges(appMap: AppMap, birdsEye: boolean): Edge[] {
  if (birdsEye) {
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
      });
    }
    return journeyEdges;
  }

  const hiddenMomentIds = new Set(
    appMap.moments.filter((moment) => moment.parentMomentId).map((moment) => moment.id)
  );

  return appMap.edges
    .filter((edge) => !hiddenMomentIds.has(edge.source) && !hiddenMomentIds.has(edge.target))
    .map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label,
      type: 'smoothstep',
      style: { stroke: '#3f3f46', strokeWidth: 2 },
      labelStyle: { fill: '#71717a', fontSize: 10 },
      labelBgStyle: { fill: '#09090b', fillOpacity: 0.9 },
      labelBgPadding: [6, 3] as [number, number],
    }));
}

function CanvasContent() {
  const {
    appMap,
    selectMoment,
    selectedMomentId,
    activeMomentId,
    setActiveMomentId,
    flaggedMoments,
  } = useMomentaiStore();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const { fitView } = useReactFlow();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [birdsEye, setBirdsEye] = useState(false);

  useEffect(() => {
    if (!appMap) return;
    setNodes((prev) => {
      const posMap = Object.fromEntries(prev.map((n) => [n.id, n.position]));
      return buildNodes(appMap, flaggedMoments, activeMomentId, birdsEye).map((n) => ({
        ...n,
        position: posMap[n.id] ?? n.position,
        selected: n.id === selectedMomentId,
      }));
    });
    setEdges(buildEdges(appMap, birdsEye));
  }, [appMap, flaggedMoments, activeMomentId, birdsEye]);

  useEffect(() => {
    setNodes((nds) =>
      nds.map((n) => ({ ...n, selected: n.id === selectedMomentId }))
    );
  }, [selectedMomentId]);

  // Auto switch bird's eye based on zoom level
  const onMoveEnd = useCallback((_: unknown, viewport: Viewport) => {
    setBirdsEye(viewport.zoom < BIRDS_EYE_ZOOM);
  }, []);

  const visibleNodes = useMemo(() => {
    return nodes.map((n) => {
      const branchOf = (n.data as { moment?: { branchOf?: string } })?.moment?.branchOf;
      return { ...n, hidden: branchOf ? branchOf !== expandedId : false };
    });
  }, [nodes, expandedId]);

  const hiddenNodeIds = useMemo(
    () => new Set(visibleNodes.filter((n) => n.hidden).map((n) => n.id)),
    [visibleNodes]
  );

  const visibleEdges = useMemo(
    () => edges.map((e) => ({ ...e, hidden: hiddenNodeIds.has(e.source) || hiddenNodeIds.has(e.target) })),
    [edges, hiddenNodeIds]
  );

  // Single-click: select moment to open edit panel
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (node.type === 'journeyGroup') return;

      selectMoment(node.id);
      setActiveMomentId(node.id);

      const hasBranches = appMap?.moments.some((m) => m.branchOf === node.id);
      if (hasBranches) {
        setExpandedId((prev) => (prev === node.id ? null : node.id));
      }
    },
    [selectMoment, setActiveMomentId, appMap]
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

        // Exit bird's eye first so nodes get added back to the graph,
        // then fitView by ID — React Flow resolves IDs after the re-render
        setBirdsEye(false);
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
    setExpandedId(null);
  }, [selectMoment]);

  const zoomToAll = useCallback(() => {
    fitView({ padding: 0.15, duration: 500 });
  }, [fitView]);

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={visibleNodes}
        edges={visibleEdges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onNodeDoubleClick={onNodeDoubleClick}
        onPaneClick={onPaneClick}
        onMoveEnd={onMoveEnd}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.15}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#27272a" variant={BackgroundVariant.Dots} gap={24} size={1.5} />
        <Controls className="!bg-zinc-900 !border-zinc-700 [&>button]:!bg-zinc-900 [&>button]:!border-zinc-700 [&>button]:!text-zinc-400 [&>button:hover]:!bg-zinc-800" />
        <MiniMap
          className="!bg-zinc-900 !border-zinc-700"
          nodeColor={(node) => (node.data as { color?: string })?.color ?? '#52525b'}
          maskColor="rgba(9,9,11,0.7)"
        />

        {/* Zoom indicator + overview button */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          {birdsEye && (
            <div className="text-[10px] text-zinc-500 bg-zinc-900/80 border border-zinc-800 px-2.5 py-1 rounded-md">
              Overview — zoom in or double-click a journey to see screens
            </div>
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
        </div>

        {/* Hint */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
          <div className="text-xs text-zinc-600 bg-zinc-900/80 px-3 py-1.5 rounded-full border border-zinc-800">
            {birdsEye
              ? 'Zoom in or double-click a journey to drill into its screens'
              : 'Click to edit · Double-click to zoom in on a screen + its connections'}
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
