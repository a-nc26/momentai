import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createCanvasPositionResolver,
  getMomentNodeDimensions,
  isBranchMomentShown,
} from '@/lib/canvasLayout';
import type { AppMap } from '@/lib/types';

function buildLayoutFixture(): AppMap {
  return {
    appName: 'Layout test',
    appDescription: 'Branch layout fixture',
    journeys: [{ id: 'j1', name: 'Journey', description: 'Test journey' }],
    moments: [
      {
        id: 'root',
        journeyId: 'j1',
        label: 'Root',
        description: 'Root',
        type: 'ui',
        preview: '',
        position: { x: 0, y: 0 },
      },
      {
        id: 'branch-a',
        journeyId: 'j1',
        label: 'Branch A',
        description: 'A',
        type: 'ui',
        preview: '',
        position: { x: 0, y: 0 },
        branchOf: 'root',
      },
      {
        id: 'branch-b',
        journeyId: 'j1',
        label: 'Branch B',
        description: 'B',
        type: 'ui',
        preview: '',
        position: { x: 0, y: 0 },
        branchOf: 'root',
      },
      {
        id: 'a-child-1',
        journeyId: 'j1',
        label: 'A Child 1',
        description: 'A1',
        type: 'ui',
        preview: '',
        position: { x: 0, y: 0 },
        branchOf: 'branch-a',
      },
      {
        id: 'a-child-2',
        journeyId: 'j1',
        label: 'A Child 2',
        description: 'A2',
        type: 'ui',
        preview: '',
        position: { x: 0, y: 0 },
        branchOf: 'branch-a',
      },
      {
        id: 'a-child-2-deep',
        journeyId: 'j1',
        label: 'A Child 2 Deep',
        description: 'A2 deep',
        type: 'ui',
        preview: '',
        position: { x: 0, y: 0 },
        branchOf: 'a-child-2',
      },
    ],
    edges: [
      { id: 'e-root-a', source: 'root', target: 'branch-a' },
      { id: 'e-root-b', source: 'root', target: 'branch-b' },
      { id: 'e-a-a1', source: 'branch-a', target: 'a-child-1' },
      { id: 'e-a-a2', source: 'branch-a', target: 'a-child-2' },
      { id: 'e-a2-a2deep', source: 'a-child-2', target: 'a-child-2-deep' },
    ],
  };
}

test('first-level branch siblings share parent Y and use fixed horizontal step', () => {
  const appMap = buildLayoutFixture();
  const viewMode = 3;
  const resolve = createCanvasPositionResolver(appMap, viewMode, null);
  const { w: nodeWidth } = getMomentNodeDimensions(viewMode);
  const BRANCH_RIGHT_GAP = 80;
  const BRANCH_HORIZONTAL_GAP = 28;
  const step = nodeWidth + BRANCH_HORIZONTAL_GAP;

  const root = appMap.moments.find((m) => m.id === 'root');
  const branchA = appMap.moments.find((m) => m.id === 'branch-a');
  const branchB = appMap.moments.find((m) => m.id === 'branch-b');
  assert.ok(root && branchA && branchB);

  const rootPos = resolve(root);
  const posA = resolve(branchA);
  const posB = resolve(branchB);

  assert.equal(posA.y, rootPos.y);
  assert.equal(posB.y, rootPos.y);
  assert.equal(posA.x, rootPos.x + nodeWidth + BRANCH_RIGHT_GAP + 0 * step);
  assert.equal(posB.x, rootPos.x + nodeWidth + BRANCH_RIGHT_GAP + 1 * step);
});

test('fork collapse: sibling branch is hidden when anchor is the other branch', () => {
  const appMap = buildLayoutFixture();
  const branchA = appMap.moments.find((m) => m.id === 'branch-a');
  const branchB = appMap.moments.find((m) => m.id === 'branch-b');
  assert.ok(branchA && branchB);
  assert.equal(isBranchMomentShown(branchB, 'branch-a', appMap), false);
  assert.equal(isBranchMomentShown(branchA, 'branch-a', appMap), true);
});

test('fork collapse: direct branch children of anchor are visible', () => {
  const appMap = buildLayoutFixture();
  const a1 = appMap.moments.find((m) => m.id === 'a-child-1');
  assert.ok(a1);
  assert.equal(isBranchMomentShown(a1, 'branch-a', appMap), true);
});

test('ancestor path: branch parent stays visible when anchor is nested under it', () => {
  const appMap = buildLayoutFixture();
  const branchA = appMap.moments.find((m) => m.id === 'branch-a');
  const aChild2 = appMap.moments.find((m) => m.id === 'a-child-2');
  assert.ok(branchA && aChild2);
  assert.equal(isBranchMomentShown(branchA, 'a-child-2', appMap), true);
});

test('ancestor path: deep leaf anchor still shows intermediate branch ancestors', () => {
  const appMap = buildLayoutFixture();
  const branchA = appMap.moments.find((m) => m.id === 'branch-a');
  const aChild2 = appMap.moments.find((m) => m.id === 'a-child-2');
  const deep = appMap.moments.find((m) => m.id === 'a-child-2-deep');
  assert.ok(branchA && aChild2 && deep);
  assert.equal(isBranchMomentShown(deep, 'a-child-2', appMap), true);
  assert.equal(isBranchMomentShown(aChild2, 'a-child-2', appMap), true);
  assert.equal(isBranchMomentShown(branchA, 'a-child-2', appMap), true);
});

test('demoMode: journeys keep authored vertical bands (no auto Y shift)', () => {
  const appMap: AppMap = {
    appName: 'Demo',
    appDescription: '',
    demoMode: true,
    journeys: [
      { id: 'onb', name: 'Onb', description: '' },
      { id: 'run', name: 'Run', description: '' },
    ],
    moments: [
      { id: 'a', journeyId: 'onb', label: 'A', description: '', type: 'ui', preview: '', position: { x: 0, y: 0 } },
      { id: 'b', journeyId: 'onb', label: 'B', description: '', type: 'ui', preview: '', position: { x: 0, y: 500 }, branchOf: 'a' },
      { id: 'c', journeyId: 'run', label: 'C', description: '', type: 'ui', preview: '', position: { x: 0, y: 600 } },
    ],
    edges: [],
  };
  const nullAnchor = null;
  const withAnchor: string | null = 'a';
  const resolveCollapsed = createCanvasPositionResolver(appMap, 1, nullAnchor);
  const resolveExpanded = createCanvasPositionResolver(appMap, 1, withAnchor);
  const c = appMap.moments.find((m) => m.id === 'c')!;

  assert.equal(resolveCollapsed(c).y, 600);
  assert.equal(resolveExpanded(c).y, 600);
});

test('demoMode: branch moments use the same compact right-stack as non-demo', () => {
  const base = buildLayoutFixture();
  const appMap: AppMap = { ...base, demoMode: true };
  const resolve = createCanvasPositionResolver(appMap, 3, null);
  const root = appMap.moments.find((m) => m.id === 'root');
  const branchA = appMap.moments.find((m) => m.id === 'branch-a');
  const branchB = appMap.moments.find((m) => m.id === 'branch-b');
  assert.ok(root && branchA && branchB);
  const rootPos = resolve(root);
  const { w: nodeWidth } = getMomentNodeDimensions(3);
  const BRANCH_RIGHT_GAP = 80;
  const BRANCH_HORIZONTAL_GAP = 28;
  const step = nodeWidth + BRANCH_HORIZONTAL_GAP;
  assert.equal(resolve(branchA).x, rootPos.x + nodeWidth + BRANCH_RIGHT_GAP + 0 * step);
  assert.equal(resolve(branchB).x, rootPos.x + nodeWidth + BRANCH_RIGHT_GAP + 1 * step);
  assert.equal(resolve(branchA).y, rootPos.y);
  assert.equal(resolve(branchB).y, rootPos.y);
});

test('non-demo: journeys are vertically shifted to avoid frame overlap', () => {
  const appMap: AppMap = {
    appName: 'Shift test',
    appDescription: '',
    journeys: [
      { id: 'j1', name: 'Journey 1', description: '' },
      { id: 'j2', name: 'Journey 2', description: '' },
    ],
    moments: [
      {
        id: 'j1-a',
        journeyId: 'j1',
        label: 'J1 A',
        description: '',
        type: 'ui',
        preview: '',
        position: { x: 0, y: 0 },
      },
      {
        id: 'j1-b',
        journeyId: 'j1',
        label: 'J1 B',
        description: '',
        type: 'ui',
        preview: '',
        position: { x: 280, y: 0 },
      },
      {
        id: 'j2-a',
        journeyId: 'j2',
        label: 'J2 A',
        description: '',
        type: 'ui',
        preview: '',
        position: { x: 0, y: 320 },
      },
    ],
    edges: [],
  };

  const resolve = createCanvasPositionResolver(appMap, 4, null);
  const j1a = appMap.moments.find((m) => m.id === 'j1-a')!;
  const j2a = appMap.moments.find((m) => m.id === 'j2-a')!;

  // In viewMode 4, node height is large (400), so authored y=320 would overlap
  // without journey-level vertical shifting.
  assert.ok(resolve(j2a).y > j2a.position.y);
  assert.ok(resolve(j2a).y > resolve(j1a).y + 400);
});

test('non-demo: nudges next spine when branch column would overlap it', () => {
  const appMap: AppMap = {
    appName: 'Overlap test',
    appDescription: '',
    journeys: [{ id: 'j1', name: 'J', description: '' }],
    moments: [
      {
        id: 'spine-a',
        journeyId: 'j1',
        label: 'A',
        description: '',
        type: 'ui',
        preview: '',
        position: { x: 0, y: 0 },
      },
      {
        id: 'spine-b',
        journeyId: 'j1',
        label: 'B',
        description: '',
        type: 'ui',
        preview: '',
        position: { x: 280, y: 0 },
      },
      {
        id: 'branch-x',
        journeyId: 'j1',
        label: 'Branch',
        description: '',
        type: 'ui',
        preview: '',
        position: { x: 0, y: 0 },
        branchOf: 'spine-a',
      },
    ],
    edges: [
      { id: 'e1', source: 'spine-a', target: 'spine-b' },
      { id: 'e2', source: 'spine-a', target: 'branch-x' },
    ],
  };
  const resolve = createCanvasPositionResolver(appMap, 1, null);
  const spineB = appMap.moments.find((m) => m.id === 'spine-b')!;
  const branchX = appMap.moments.find((m) => m.id === 'branch-x')!;
  // Branch is to the right of A; B must start after the branch column.
  assert.ok(resolve(spineB).x >= resolve(branchX).x + 220 + 1);
});
