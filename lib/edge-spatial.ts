import type { Edge, Node } from '@xyflow/react';
import {
  buildJourneyBounds,
  createCanvasPositionResolver,
  getMomentNodeDimensions,
  JOURNEY_GROUP_HEADER,
  JOURNEY_GROUP_PADDING,
} from '@/lib/canvasLayout';
import type { AppMap } from '@/lib/types';

export type MapViewMode = 1 | 2 | 3 | 4;

/**
 * Pick which side of each card an edge should use from relative placement (center → center).
 * Uses dominant axis (horizontal vs vertical) so wires follow how the graph is laid out in space.
 */
export function pickEdgeHandlesForRects(
  src: { x: number; y: number; w: number; h: number },
  tgt: { x: number; y: number; w: number; h: number }
): { sourceHandle: string; targetHandle: string } {
  const scx = src.x + src.w / 2;
  const scy = src.y + src.h / 2;
  const tcx = tgt.x + tgt.w / 2;
  const tcy = tgt.y + tgt.h / 2;
  const dx = tcx - scx;
  const dy = tcy - scy;

  const eps = 12;
  if (Math.abs(dx) < eps && Math.abs(dy) < eps) {
    return { sourceHandle: 'out-right', targetHandle: 'in-left' };
  }

  if (Math.abs(dx) >= Math.abs(dy)) {
    if (dx >= 0) return { sourceHandle: 'out-right', targetHandle: 'in-left' };
    return { sourceHandle: 'out-left', targetHandle: 'in-right' };
  }
  if (dy >= 0) return { sourceHandle: 'out-bottom', targetHandle: 'in-top' };
  return { sourceHandle: 'out-top', targetHandle: 'in-bottom' };
}

function rectFromFlowNode(node: Node, viewMode: MapViewMode): { x: number; y: number; w: number; h: number } {
  const { w: dw, h: dh } = getMomentNodeDimensions(viewMode);
  if (node.type === 'journeyGroup') {
    const width =
      typeof node.style?.width === 'number'
        ? node.style.width
        : Number(node.style?.width) || 400;
    const height =
      typeof node.style?.height === 'number'
        ? node.style.height
        : Number(node.style?.height) || 320;
    return { x: node.position.x, y: node.position.y, w: width, h: height };
  }
  const w = (typeof node.width === 'number' ? node.width : undefined) ?? dw;
  const h = (typeof node.height === 'number' ? node.height : undefined) ?? dh;
  return { x: node.position.x, y: node.position.y, w, h };
}

function resolveRectForNodeId(
  id: string,
  nodes: Node[],
  appMap: AppMap,
  viewMode: MapViewMode,
  expandedId: string | null
): { x: number; y: number; w: number; h: number } | null {
  const node = nodes.find((n) => n.id === id);
  if (node) return rectFromFlowNode(node, viewMode);

  if (id.startsWith('journey-')) {
    const jid = id.slice('journey-'.length);
    const bounds = buildJourneyBounds(appMap, expandedId, viewMode);
    const b = bounds[jid];
    if (!b) return null;
    return {
      x: b.minX - JOURNEY_GROUP_PADDING,
      y: b.minY - JOURNEY_GROUP_PADDING - JOURNEY_GROUP_HEADER,
      w: b.maxX - b.minX + JOURNEY_GROUP_PADDING * 2,
      h: b.maxY - b.minY + JOURNEY_GROUP_PADDING * 2 + JOURNEY_GROUP_HEADER,
    };
  }

  const moment = appMap.moments.find((m) => m.id === id);
  if (!moment) return null;
  const resolve = createCanvasPositionResolver(appMap, viewMode, expandedId);
  const p = resolve(moment);
  const { w, h } = getMomentNodeDimensions(viewMode);
  return { x: p.x, y: p.y, w, h };
}

/** Attach `sourceHandle` / `targetHandle` from layout geometry; updates when nodes move. */
export function attachSpatialHandles(
  edges: Edge[],
  appMap: AppMap,
  viewMode: MapViewMode,
  nodes: Node[],
  expandedId: string | null
): Edge[] {
  return edges.map((edge) => {
    const a = resolveRectForNodeId(edge.source, nodes, appMap, viewMode, expandedId);
    const b = resolveRectForNodeId(edge.target, nodes, appMap, viewMode, expandedId);
    if (!a || !b) return edge;
    const { sourceHandle, targetHandle } = pickEdgeHandlesForRects(a, b);
    return { ...edge, sourceHandle, targetHandle };
  });
}
