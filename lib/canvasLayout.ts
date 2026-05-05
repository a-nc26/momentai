import type { AppMap, Moment } from '@/lib/types';

/** Padding around moment cards inside a journey group frame (must match Canvas). */
export const JOURNEY_GROUP_PADDING = 40;
/** Journey title row height inside the group frame. */
export const JOURNEY_GROUP_HEADER = 48;
/**
 * Minimum extra vertical gap between one journey's lowest card bottom (`y + nodeHeight`) and the
 * next journey's highest card top (`y`) so the **journey group frames** do not overlap.
 * Derived from Canvas frame math: nextTop = minY - pad - header, prevBottom = maxY + pad.
 */
export const JOURNEY_FRAME_MIN_GAP_Y =
  JOURNEY_GROUP_PADDING + JOURNEY_GROUP_PADDING + JOURNEY_GROUP_HEADER;

/**
 * Bounding boxes of moment clusters per journey — used for journey frames and spatial edge routing.
 *
 * **Important:** Branch visibility (fork collapse) only hides *nodes* on the canvas; journey frames
 * still include every moment in that journey so frames match the authored layout. Otherwise a
 * collapsed fork shrinks the frame to the spine row and the next journey looks hundreds of px
 * “below” an artificially tiny band (large fake gap between journeys).
 */
export function buildJourneyBounds(
  appMap: AppMap,
  expandedBranchParentId: string | null,
  viewMode: 1 | 2 | 3 | 4
): Record<string, { minX: number; minY: number; maxX: number; maxY: number; count: number }> {
  void expandedBranchParentId;
  const resolve = createCanvasPositionResolver(appMap, viewMode, expandedBranchParentId);
  const { w: mw, h: mh } = getMomentNodeDimensions(viewMode);
  const bounds: Record<string, { minX: number; minY: number; maxX: number; maxY: number; count: number }> = {};

  for (const moment of appMap.moments) {
    if (moment.parentMomentId) continue;

    const jid = moment.journeyId;
    if (!bounds[jid]) {
      bounds[jid] = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity, count: 0 };
    }
    const b = bounds[jid];
    const p = resolve(moment);
    b.minX = Math.min(b.minX, p.x);
    b.minY = Math.min(b.minY, p.y);
    b.maxX = Math.max(b.maxX, p.x + mw);
    b.maxY = Math.max(b.maxY, p.y + mh);
    b.count++;
  }
  return bounds;
}

/**
 * Branch visibility on the canvas (fork-style collapse).
 *
 * Default: branch nodes are hidden until an anchor is derived from the active moment.
 * When `expandedId` is set:
 *   - The anchor node is shown.
 *   - Its direct branch children (`branchOf === expandedId`, no `parentMomentId`) are shown.
 *   - Ancestors of the anchor along the `branchOf` chain are shown (path to spine).
 * Siblings of the anchor at the same fork are hidden so child columns do not overlap them.
 */
/**
 * Single source of truth for which branch subtree is "open" on the map.
 * Derived from the active moment so iframe / runtime navigation cannot desync
 * from canvas visibility (e.g. jumping to `goal-beginner-foundation` must expand `goal-beginner`).
 *
 * - If the active moment has branch children → anchor at that moment (show its column).
 * - Else if it sits under a branch parent → anchor at the immediate parent (show siblings + self).
 * - Else → no branch expansion (spine-only screens).
 */
export function deriveExpandedBranchAnchor(
  activeMomentId: string | null,
  appMap: AppMap
): string | null {
  if (!activeMomentId) return null;
  const active = appMap.moments.find((m) => m.id === activeMomentId);
  if (!active || active.parentMomentId) return null;

  const hasBranchChildren = appMap.moments.some(
    (m) => m.branchOf === activeMomentId && !m.parentMomentId
  );
  if (hasBranchChildren) return activeMomentId;
  if (active.branchOf) return active.branchOf;
  return null;
}

export function isBranchMomentShown(
  moment: Moment,
  expandedId: string | null,
  appMap: AppMap
): boolean {
  if (!moment.branchOf) return true;
  if (!expandedId) return false;
  if (moment.id === expandedId) return true;
  if (!moment.parentMomentId && moment.branchOf === expandedId) return true;

  let cursor = appMap.moments.find((m) => m.id === expandedId);
  while (cursor?.branchOf) {
    const parentId = cursor.branchOf;
    const parent = appMap.moments.find((m) => m.id === parentId);
    if (!parent) break;
    if (parent.id === moment.id) return true;
    cursor = parent;
  }

  return false;
}

/** Default width when zoom not specified (legacy). */
export const MOMENT_NODE_W = 220;
export const MOMENT_NODE_H = 120;

/** Horizontal gap between parent node and first branch sibling. */
const BRANCH_RIGHT_GAP = 120;
/** Horizontal gap between horizontally-laid branch siblings (nested branches). */
const BRANCH_HORIZONTAL_GAP = 40;
/** Minimum gap between the right edge of a spine column (including its branch stack) and the next spine node. */
const SPINE_AFTER_BRANCH_GAP = 56;

/**
 * Layout size for moment nodes — must stay in sync with `MomentNode` max card height
 * (cards scroll internally so rendered height matches these bounds).
 */
export function getMomentNodeDimensions(viewMode: 1 | 2 | 3 | 4): { w: number; h: number } {
  if (viewMode === 1) return { w: 220, h: 140 };
  if (viewMode === 2) return { w: 142, h: 96 };
  if (viewMode === 3) return { w: 220, h: 300 };
  return { w: 220, h: 400 };
}

/**
 * Order branch siblings by graph order: outgoing edges from the parent, then any remaining branches.
 */
function branchSiblingIdsOrdered(appMap: AppMap, parentId: string): string[] {
  const branchIds = new Set(
    appMap.moments.filter((m) => m.branchOf === parentId && !m.parentMomentId).map((m) => m.id)
  );
  if (branchIds.size === 0) return [];

  const ordered: string[] = [];
  const seen = new Set<string>();
  for (const e of appMap.edges) {
    if (e.source !== parentId) continue;
    if (branchIds.has(e.target) && !seen.has(e.target)) {
      ordered.push(e.target);
      seen.add(e.target);
    }
  }
  for (const id of branchIds) {
    if (!seen.has(id)) {
      ordered.push(id);
      seen.add(id);
    }
  }
  return ordered;
}

/**
 * Resolves where each moment should appear on the canvas (unshifted).
 * Branch moments auto layout in a horizontal row to the right of parent.
 */
function createBaseCanvasPositionResolver(appMap: AppMap, viewMode: 1 | 2 | 3 | 4) {
  const { w: NODE_W } = getMomentNodeDimensions(viewMode);
  const cache = new Map<string, { x: number; y: number }>();

  function stackToRightOfParent(
    moment: Moment,
    parentPos: { x: number; y: number }
  ): { x: number; y: number } {
    const parentId = moment.branchOf!;

    const orderedIds = branchSiblingIdsOrdered(appMap, parentId);
    const siblings = orderedIds
      .map((id) => appMap.moments.find((m) => m.id === id))
      .filter((m): m is Moment => !!m && m.branchOf === parentId && !m.parentMomentId);

    const idx = siblings.findIndex((m) => m.id === moment.id);

    // First-level and nested branches: one row to the right of the parent, fixed horizontal step.
    const safeIdx = idx < 0 ? 0 : idx;
    const x =
      parentPos.x + NODE_W + BRANCH_RIGHT_GAP + safeIdx * (NODE_W + BRANCH_HORIZONTAL_GAP);
    const y = parentPos.y;
    return { x, y };
  }

  function resolve(moment: Moment): { x: number; y: number } {
    const hit = cache.get(moment.id);
    if (hit) return hit;

    if (!moment.branchOf) {
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
    const p = stackToRightOfParent(moment, parentPos);
    cache.set(moment.id, p);
    return p;
  }

  return resolve;
}

/**
 * Spine nodes are spaced ~280px apart in generated maps, but branch columns extend to the right
 * of a parent and can overlap the next spine card. Walk each journey's spine left→right and
 * nudge whole spine columns (spine + its branch subtree) right when needed.
 */
function buildSpineHorizontalNudges(
  appMap: AppMap,
  resolveBase: (moment: Moment) => { x: number; y: number },
  viewMode: 1 | 2 | 3 | 4
): Map<string, { x: number; y: number }> {
  const { w: NODE_W } = getMomentNodeDimensions(viewMode);
  const pos = new Map<string, { x: number; y: number }>();

  for (const moment of appMap.moments) {
    if (moment.parentMomentId) continue;
    pos.set(moment.id, { ...resolveBase(moment) });
  }

  function subtreeTopLevelIds(rootId: string): string[] {
    const out: string[] = [rootId];
    const queue = [rootId];
    while (queue.length) {
      const id = queue.shift()!;
      for (const m of appMap.moments) {
        if (m.parentMomentId) continue;
        if (m.branchOf === id) {
          out.push(m.id);
          queue.push(m.id);
        }
      }
    }
    return out;
  }

  function columnMaxRight(rootId: string): number {
    let max = 0;
    for (const id of subtreeTopLevelIds(rootId)) {
      const p = pos.get(id);
      if (p) max = Math.max(max, p.x + NODE_W);
    }
    return max;
  }

  for (const journey of appMap.journeys) {
    const spine = appMap.moments
      .filter((m) => m.journeyId === journey.id && !m.parentMomentId && !m.branchOf)
      .sort((a, b) => (pos.get(a.id)?.x ?? 0) - (pos.get(b.id)?.x ?? 0));

    for (let i = 1; i < spine.length; i++) {
      const prev = spine[i - 1]!;
      const curr = spine[i]!;
      const minX = columnMaxRight(prev.id) + SPINE_AFTER_BRANCH_GAP;
      const currP = pos.get(curr.id);
      if (!currP) continue;
      if (currP.x >= minX) continue;
      const delta = minX - currP.x;
      for (const id of subtreeTopLevelIds(curr.id)) {
        const p = pos.get(id);
        if (p) pos.set(id, { x: p.x + delta, y: p.y });
      }
    }
  }

  return pos;
}

function buildJourneyVerticalShifts(
  appMap: AppMap,
  resolveBase: (moment: Moment) => { x: number; y: number },
  viewMode: 1 | 2 | 3 | 4
): Record<string, number> {
  const { h: nodeHeight } = getMomentNodeDimensions(viewMode);
  const boundsByJourney = new Map<string, { minY: number; maxY: number }>();

  for (const moment of appMap.moments) {
    if (moment.parentMomentId) continue;
    const p = resolveBase(moment);
    const entry = boundsByJourney.get(moment.journeyId) ?? {
      minY: Number.POSITIVE_INFINITY,
      maxY: Number.NEGATIVE_INFINITY,
    };
    entry.minY = Math.min(entry.minY, p.y);
    entry.maxY = Math.max(entry.maxY, p.y + nodeHeight);
    boundsByJourney.set(moment.journeyId, entry);
  }

  const shifts: Record<string, number> = {};
  let previousShiftedMaxY = Number.NEGATIVE_INFINITY;

  for (const journey of appMap.journeys) {
    const b = boundsByJourney.get(journey.id);
    if (!b) {
      shifts[journey.id] = 0;
      continue;
    }

    if (!Number.isFinite(previousShiftedMaxY)) {
      shifts[journey.id] = 0;
      previousShiftedMaxY = b.maxY;
      continue;
    }

    const requiredMinY = previousShiftedMaxY + JOURNEY_FRAME_MIN_GAP_Y;
    const shift = Math.max(0, requiredMinY - b.minY);
    shifts[journey.id] = shift;
    previousShiftedMaxY = b.maxY + shift;
  }

  return shifts;
}

/** Resolves scene positions for map rendering. */
export function createCanvasPositionResolver(
  appMap: AppMap,
  viewMode: 1 | 2 | 3 | 4,
  expandedBranchParentId: string | null = null
) {
  void expandedBranchParentId;
  const resolveBase = createBaseCanvasPositionResolver(appMap, viewMode);
  if (appMap.demoMode) return resolveBase;

  const nudged = buildSpineHorizontalNudges(appMap, resolveBase, viewMode);

  const journeyShifts = buildJourneyVerticalShifts(
    appMap,
    (moment) => nudged.get(moment.id) ?? resolveBase(moment),
    viewMode
  );

  return (moment: Moment) => {
    const base = nudged.get(moment.id) ?? resolveBase(moment);
    return { x: base.x, y: base.y + (journeyShifts[moment.journeyId] ?? 0) };
  };
}
