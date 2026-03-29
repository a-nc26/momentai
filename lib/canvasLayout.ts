import type { AppMap, Moment } from '@/lib/types';

/** Matches `MomentNode` width and `buildJourneyBounds` height. */
export const MOMENT_NODE_W = 220;
export const MOMENT_NODE_H = 120;
const BRANCH_GAP_X = 32;
/** Vertical gap from parent bottom to branch row top. */
const BRANCH_OFFSET_Y = 148;

/**
 * Resolves where each moment should appear on the canvas. Branch children
 * (branchOf set) fan out horizontally under their parent when that parent is
 * expanded; otherwise they keep their stored coordinates (nodes stay hidden).
 */
export function createCanvasPositionResolver(appMap: AppMap, expandedBranchParentId: string | null) {
  const cache = new Map<string, { x: number; y: number }>();

  function resolve(moment: Moment): { x: number; y: number } {
    const hit = cache.get(moment.id);
    if (hit) return hit;

    if (!moment.branchOf) {
      const p = moment.position;
      cache.set(moment.id, p);
      return p;
    }

    if (expandedBranchParentId !== moment.branchOf) {
      const p = moment.position;
      cache.set(moment.id, p);
      return p;
    }

    const parent = appMap.moments.find((m) => m.id === moment.branchOf);
    if (!parent) {
      const p = moment.position;
      cache.set(moment.id, p);
      return p;
    }

    const parentPos = resolve(parent);
    const siblings = appMap.moments
      .filter((m) => m.branchOf === moment.branchOf && !m.parentMomentId)
      .sort((a, b) => a.id.localeCompare(b.id));

    const n = siblings.length;
    const idx = siblings.findIndex((m) => m.id === moment.id);
    const totalW = n * MOMENT_NODE_W + (n - 1) * BRANCH_GAP_X;
    const parentCenterX = parentPos.x + MOMENT_NODE_W / 2;
    const startX = parentCenterX - totalW / 2;
    const x = startX + idx * (MOMENT_NODE_W + BRANCH_GAP_X);
    const y = parentPos.y + BRANCH_OFFSET_Y;
    const p = { x, y };
    cache.set(moment.id, p);
    return p;
  }

  return resolve;
}
