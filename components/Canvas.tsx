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

  // Journey group nodes
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

  // Moment nodes
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
  const { fitView: _fitView } = useReactFlow();
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

  // Derive visible nodes/edges — branch nodes hidden unless parent is expanded
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

  const onPaneClick = useCallback(() => {
    selectMoment(null);
    setExpandedId(null);
  }, [selectMoment]);

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={visibleNodes}
        edges={visibleEdges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
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

        {/* Bird's eye toggle */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={() => setBirdsEye((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              birdsEye
                ? 'bg-indigo-600 border-indigo-500 text-white'
                : 'bg-zinc-900/90 border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-500'
            }`}
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
              <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
              <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
              <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            {birdsEye ? "Show screens" : "Bird's eye"}
          </button>
        </div>

        {/* Hint */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
          <div className="text-xs text-zinc-600 bg-zinc-900/80 px-3 py-1.5 rounded-full border border-zinc-800">
            Click to edit · Branch nodes expand on click
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
