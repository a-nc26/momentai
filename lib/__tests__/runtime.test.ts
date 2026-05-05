import { describe, it, expect } from 'vitest';
import {
  getStartMomentId,
  createInitialRuntimeSession,
  resolveTemplatedValue,
  applyActionToSession,
  setSessionValue,
  toggleSessionArrayValue,
  isActionEnabled,
  isRuntimeValueFilled,
} from '../runtime';
import type { AppMap, RuntimeActionSpec } from '../types';

// ─── Fixtures ────────────────────────────────────────────────────────────────

function makeAppMap(overrides: Partial<AppMap> = {}): AppMap {
  return {
    appName: 'Test App',
    appDescription: 'A test app',
    appPlatform: 'mobile',
    journeys: [{ id: 'j1', name: 'Onboarding', description: 'Get started' }],
    moments: [
      { id: 'welcome', journeyId: 'j1', label: 'Welcome', type: 'ui', description: '', preview: '', position: { x: 0, y: 0 } },
      { id: 'step-2', journeyId: 'j1', label: 'Step 2', type: 'ui', description: '', preview: '', position: { x: 280, y: 0 } },
      { id: 'step-3', journeyId: 'j1', label: 'Step 3', type: 'ui', description: '', preview: '', position: { x: 560, y: 0 } },
    ],
    edges: [
      { id: 'e1', source: 'welcome', target: 'step-2' },
      { id: 'e2', source: 'step-2', target: 'step-3' },
    ],
    stateSchema: [
      { key: 'name', label: 'Name', type: 'string', defaultValue: '' },
      { key: 'age', label: 'Age', type: 'number', defaultValue: 0 },
      { key: 'active', label: 'Active', type: 'boolean', defaultValue: false },
      { key: 'tags', label: 'Tags', type: 'string[]', defaultValue: [] },
    ],
    initialState: {},
    ...overrides,
  };
}

// ─── getStartMomentId ────────────────────────────────────────────────────────

describe('getStartMomentId', () => {
  it('returns the moment with no incoming edges', () => {
    const appMap = makeAppMap();
    expect(getStartMomentId(appMap)).toBe('welcome');
  });

  it('returns first moment when all have incoming edges', () => {
    const appMap = makeAppMap({
      edges: [
        { id: 'e1', source: 'welcome', target: 'step-2' },
        { id: 'e2', source: 'step-2', target: 'welcome' },
      ],
    });
    // All have incoming — falls back to first moment with no parentMomentId, then first moment
    expect(getStartMomentId(appMap)).toBeTruthy();
  });

  it('returns null for empty moments', () => {
    const appMap = makeAppMap({ moments: [], edges: [] });
    expect(getStartMomentId(appMap)).toBeNull();
  });

  it('skips branch moments (branchOf set)', () => {
    const appMap = makeAppMap({
      moments: [
        { id: 'branch-a', journeyId: 'j1', label: 'Branch A', type: 'ui', description: '', preview: '', position: { x: 0, y: 0 }, branchOf: 'welcome' },
        { id: 'welcome', journeyId: 'j1', label: 'Welcome', type: 'ui', description: '', preview: '', position: { x: 0, y: 0 } },
      ],
      edges: [],
    });
    expect(getStartMomentId(appMap)).toBe('welcome');
  });
});

// ─── createInitialRuntimeSession ─────────────────────────────────────────────

describe('createInitialRuntimeSession', () => {
  it('initializes values from stateSchema defaults', () => {
    const session = createInitialRuntimeSession(makeAppMap());
    expect(session.values.name).toBe('');
    expect(session.values.age).toBe(0);
    expect(session.values.active).toBe(false);
    expect(session.values.tags).toEqual([]);
  });

  it('overrides defaults with initialState values', () => {
    const appMap = makeAppMap({ initialState: { name: 'Alice', age: 30 } });
    const session = createInitialRuntimeSession(appMap);
    expect(session.values.name).toBe('Alice');
    expect(session.values.age).toBe(30);
  });

  it('sets currentMomentId to start moment', () => {
    const session = createInitialRuntimeSession(makeAppMap());
    expect(session.currentMomentId).toBe('welcome');
  });

  it('starts with empty history', () => {
    const session = createInitialRuntimeSession(makeAppMap());
    expect(session.history).toEqual([]);
  });

  it('uses explicit startMomentId when provided', () => {
    const session = createInitialRuntimeSession(makeAppMap(), 'step-2');
    expect(session.currentMomentId).toBe('step-2');
  });
});

// ─── resolveTemplatedValue ───────────────────────────────────────────────────

describe('resolveTemplatedValue', () => {
  const values = { name: 'Alice', age: 30, score: 99 };

  it('replaces {{key}} with value', () => {
    expect(resolveTemplatedValue('Hello {{name}}!', values)).toBe('Hello Alice!');
  });

  it('replaces multiple references in one string', () => {
    expect(resolveTemplatedValue('{{name}} is {{age}}', values)).toBe('Alice is 30');
  });

  it('handles missing keys by substituting empty string', () => {
    expect(resolveTemplatedValue('{{missing}}', values)).toBe('');
  });

  it('handles whitespace inside braces: {{ name }}', () => {
    expect(resolveTemplatedValue('{{ name }}', values)).toBe('Alice');
  });

  it('resolves nested objects recursively', () => {
    const obj = { title: 'Hi {{name}}', count: 42 };
    const result = resolveTemplatedValue(obj, values) as typeof obj;
    expect(result.title).toBe('Hi Alice');
    expect(result.count).toBe(42);
  });

  it('resolves arrays recursively', () => {
    const arr = ['{{name}}', '{{age}}'];
    expect(resolveTemplatedValue(arr, values)).toEqual(['Alice', '30']);
  });

  it('returns non-string primitives unchanged', () => {
    expect(resolveTemplatedValue(42, values)).toBe(42);
    expect(resolveTemplatedValue(true, values)).toBe(true);
  });
});

// ─── applyActionToSession ────────────────────────────────────────────────────

describe('applyActionToSession', () => {
  function makeSession(momentId = 'welcome') {
    return {
      currentMomentId: momentId,
      history: [],
      values: { name: '', plan: '', score: 0 },
    };
  }

  it('navigate: moves to target and records history', () => {
    const action: RuntimeActionSpec = { id: 'a1', label: 'Next', kind: 'navigate', style: 'primary', target: 'step-2' };
    const next = applyActionToSession(makeSession(), action);
    expect(next.currentMomentId).toBe('step-2');
    expect(next.history).toEqual(['welcome']);
  });

  it('back: pops history and restores previous moment', () => {
    const session = { currentMomentId: 'step-2', history: ['welcome'], values: {} };
    const action: RuntimeActionSpec = { id: 'a1', label: 'Back', kind: 'back', style: 'secondary' };
    const next = applyActionToSession(session, action);
    expect(next.currentMomentId).toBe('welcome');
    expect(next.history).toEqual([]);
  });

  it('back with empty history stays on current moment', () => {
    const session = { currentMomentId: 'step-2', history: [], values: {} };
    const action: RuntimeActionSpec = { id: 'a1', label: 'Back', kind: 'back', style: 'secondary' };
    const next = applyActionToSession(session, action);
    expect(next.currentMomentId).toBe('step-2');
  });

  it('branch: navigates to matching branch target', () => {
    const session = makeSession();
    session.values.plan = 'premium';
    const action: RuntimeActionSpec = {
      id: 'a1', label: 'Choose', kind: 'branch', style: 'primary',
      branchKey: 'plan',
      branches: [
        { value: 'basic', target: 'basic-screen' },
        { value: 'premium', target: 'premium-screen' },
      ],
    };
    const next = applyActionToSession(session, action);
    expect(next.currentMomentId).toBe('premium-screen');
    expect(next.history).toEqual(['welcome']);
  });

  it('branch: falls back to fallbackTarget when no match', () => {
    const session = makeSession();
    session.values.plan = 'unknown';
    const action: RuntimeActionSpec = {
      id: 'a1', label: 'Choose', kind: 'branch', style: 'primary',
      branchKey: 'plan',
      branches: [{ value: 'basic', target: 'basic-screen' }],
      fallbackTarget: 'fallback-screen',
    };
    const next = applyActionToSession(session, action);
    expect(next.currentMomentId).toBe('fallback-screen');
  });

  it('compute: evaluates formulas and writes results to state', () => {
    const session = { currentMomentId: 'calc', history: [], values: { price: 100, qty: 3, total: 0 } };
    const action: RuntimeActionSpec = {
      id: 'a1', label: 'Calculate', kind: 'compute', style: 'primary',
      target: 'results',
      formulas: { total: 'price * qty' },
    };
    const next = applyActionToSession(session, action);
    expect(next.values.total).toBe(300);
    expect(next.currentMomentId).toBe('results');
  });

  it('compute: handles invalid formula gracefully (returns 0)', () => {
    const session = { currentMomentId: 'calc', history: [], values: { x: 10 } };
    const action: RuntimeActionSpec = {
      id: 'a1', label: 'Calc', kind: 'compute', style: 'primary',
      formulas: { result: 'x.nonexistent.broken(' },
    };
    const next = applyActionToSession(session, action);
    expect(next.values.result).toBe(0);
  });

  it('applies append-list effect before navigating', () => {
    const session = { currentMomentId: 'log', history: [], values: { items: [] as string[], itemName: 'Apple' } };
    const action: RuntimeActionSpec = {
      id: 'a1', label: 'Save', kind: 'navigate', style: 'primary',
      target: 'dashboard',
      effects: [{ kind: 'append-list', key: 'items', item: '{{itemName}}' }],
    };
    const next = applyActionToSession(session, action);
    expect(next.values.items).toEqual(['Apple']);
    expect(next.currentMomentId).toBe('dashboard');
  });
});

// ─── setSessionValue ─────────────────────────────────────────────────────────

describe('setSessionValue', () => {
  it('sets a value without mutating the original', () => {
    const session = { currentMomentId: 'a', history: [], values: { name: '' } };
    const next = setSessionValue(session, 'name', 'Bob');
    expect(next.values.name).toBe('Bob');
    expect(session.values.name).toBe('');
  });

  it('clones array values so mutations do not propagate', () => {
    const arr = ['x'];
    const session = { currentMomentId: 'a', history: [], values: { list: arr } };
    const next = setSessionValue(session, 'list', arr);
    (next.values.list as string[]).push('y');
    expect(arr).toEqual(['x']);
  });
});

// ─── toggleSessionArrayValue ─────────────────────────────────────────────────

describe('toggleSessionArrayValue', () => {
  it('adds value when not present', () => {
    const session = { currentMomentId: 'a', history: [], values: { tags: [] } };
    const next = toggleSessionArrayValue(session, 'tags', 'fitness');
    expect(next.values.tags).toEqual(['fitness']);
  });

  it('removes value when already present', () => {
    const session = { currentMomentId: 'a', history: [], values: { tags: ['fitness', 'health'] } };
    const next = toggleSessionArrayValue(session, 'tags', 'fitness');
    expect(next.values.tags).toEqual(['health']);
  });

  it('handles non-array key by treating it as empty', () => {
    const session = { currentMomentId: 'a', history: [], values: { tags: 'oops' } };
    const next = toggleSessionArrayValue(session, 'tags', 'fitness');
    expect(next.values.tags).toEqual(['fitness']);
  });
});

// ─── isActionEnabled ─────────────────────────────────────────────────────────

describe('isActionEnabled', () => {
  const session = { currentMomentId: 'a', history: [], values: { name: 'Alice', plan: '', count: 0 } };

  it('returns true when no requiredKeys', () => {
    const action: RuntimeActionSpec = { id: 'a1', label: 'Next', kind: 'navigate', style: 'primary' };
    expect(isActionEnabled(action, session)).toBe(true);
  });

  it('returns true when all required keys are filled', () => {
    const action: RuntimeActionSpec = { id: 'a1', label: 'Next', kind: 'navigate', style: 'primary', requiredKeys: ['name'] };
    expect(isActionEnabled(action, session)).toBe(true);
  });

  it('returns false when a required string key is empty', () => {
    const action: RuntimeActionSpec = { id: 'a1', label: 'Next', kind: 'navigate', style: 'primary', requiredKeys: ['plan'] };
    expect(isActionEnabled(action, session)).toBe(false);
  });
});

// ─── isRuntimeValueFilled ────────────────────────────────────────────────────

describe('isRuntimeValueFilled', () => {
  it('treats non-empty string as filled', () => expect(isRuntimeValueFilled('hello')).toBe(true));
  it('treats empty string as not filled', () => expect(isRuntimeValueFilled('')).toBe(false));
  it('treats non-empty array as filled', () => expect(isRuntimeValueFilled(['a'])).toBe(true));
  it('treats empty array as not filled', () => expect(isRuntimeValueFilled([])).toBe(false));
  it('treats any number as filled', () => expect(isRuntimeValueFilled(0)).toBe(true));
  it('treats boolean as filled', () => expect(isRuntimeValueFilled(false)).toBe(true));
  it('treats undefined as not filled', () => expect(isRuntimeValueFilled(undefined)).toBe(false));
});
