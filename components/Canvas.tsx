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
import { JOURNEY_COLORS } from '@/lib/colors';
import { AppMap } from '@/lib/types';

const nodeTypes = { momentNode: MomentNode };

function buildNodes(appMap: AppMap, flaggedMoments: Record<string, string>): Node[] {
  return appMap.moments.map((moment) => {
    const journeyIndex = appMap.journeys.findIndex((j) => j.id === moment.journeyId);
    const color = JOURNEY_COLORS[journeyIndex % JOURNEY_COLORS.length];
    const journey = appMap.journeys.find((j) => j.id === moment.journeyId);
    const flagReason = flaggedMoments[moment.id];
    return {
      id: moment.id,
      type: 'momentNode',
      position: moment.position,
      data: {
        moment,
        color,
        journeyName: journey?.name ?? '',
        flagged: !!flagReason,
        flagReason: flagReason ?? '',
      },
    };
  });
}

function buildEdges(appMap: AppMap): Edge[] {
  return appMap.edges.map((edge) => ({
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
  const { appMap, selectMoment, selectedMomentId, setDetailMoment, flaggedMoments } = useMomentaiStore();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const { fitView: _fitView } = useReactFlow();
  // Which parent node currently has its branches revealed
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!appMap) return;
    setNodes((prev) => {
      const posMap = Object.fromEntries(prev.map((n) => [n.id, n.position]));
      return buildNodes(appMap, flaggedMoments).map((n) => ({
        ...n,
        position: posMap[n.id] ?? n.position,
        selected: n.id === selectedMomentId,
      }));
    });
    setEdges(buildEdges(appMap));
  }, [appMap, flaggedMoments]);

  useEffect(() => {
    setNodes((nds) =>
      nds.map((n) => ({ ...n, selected: n.id === selectedMomentId }))
    );
  }, [selectedMomentId]);

  // Derive visible nodes/edges — branch nodes are hidden unless their parent is expanded
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
      selectMoment(node.id);
      // If this node has branches, expand it; if already expanded, collapse
      const hasBranches = appMap?.moments.some((m) => m.branchOf === node.id);
      if (hasBranches) {
        setExpandedId((prev) => (prev === node.id ? null : node.id));
      }
    },
    [selectMoment, appMap]
  );

  // Double-click: enter Moment detail view (zoom layer 2)
  const onNodeDoubleClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setDetailMoment(node.id);
    },
    [setDetailMoment]
  );

  const onPaneClick = useCallback(() => {
    selectMoment(null);
    setExpandedId(null);
  }, [selectMoment]);

  const legendItems = useMemo(
    () =>
      appMap?.journeys.map((j, i) => ({
        name: j.name,
        color: JOURNEY_COLORS[i % JOURNEY_COLORS.length],
      })) ?? [],
    [appMap]
  );

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

        {/* Journey legend */}
        <div className="absolute top-4 left-4 space-y-1.5 z-10 pointer-events-none">
          {legendItems.map((item) => (
            <div
              key={item.name}
              className="flex items-center gap-2 bg-zinc-900/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-zinc-800"
            >
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-zinc-300 font-medium">{item.name}</span>
            </div>
          ))}
        </div>

        {/* Hint */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
          <div className="text-xs text-zinc-600 bg-zinc-900/80 px-3 py-1.5 rounded-full border border-zinc-800">
            Click to inspect · Double-click to zoom in · Click branch nodes to expand
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
