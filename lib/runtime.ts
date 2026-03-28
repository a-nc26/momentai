import {
  AppMap,
  Moment,
  RuntimeActionSpec,
  RuntimeComponentSpec,
  RuntimeEffectSpec,
  RuntimePrimitive,
  RuntimeScreenSpec,
  RuntimeStateField,
  RuntimeValue,
} from './types';

export interface RuntimeSessionState {
  currentMomentId: string | null;
  history: string[];
  values: Record<string, RuntimeValue>;
}

export function getStartMomentId(appMap: AppMap): string | null {
  const incoming = new Set(appMap.edges.map((edge) => edge.target));
  return (
    appMap.moments.find((moment) => !incoming.has(moment.id) && !moment.branchOf && !moment.parentMomentId)?.id ??
    appMap.moments.find((moment) => !moment.parentMomentId)?.id ??
    appMap.moments[0]?.id ??
    null
  );
}

export function getMomentById(appMap: AppMap, momentId: string | null): Moment | null {
  if (!momentId) return null;
  return appMap.moments.find((moment) => moment.id === momentId) ?? null;
}

export function createInitialRuntimeSession(
  appMap: AppMap,
  startMomentId = getStartMomentId(appMap)
): RuntimeSessionState {
  const values: Record<string, RuntimeValue> = {};

  for (const field of appMap.stateSchema ?? []) {
    if (field.defaultValue !== undefined) {
      values[field.key] = cloneRuntimeValue(field.defaultValue);
      continue;
    }

    if (field.type === 'boolean') values[field.key] = false;
    else if (field.type === 'number') values[field.key] = 0;
    else if (field.type === 'string[]') values[field.key] = [];
    else values[field.key] = '';
  }

  for (const [key, value] of Object.entries(appMap.initialState ?? {})) {
    values[key] = cloneRuntimeValue(value);
  }

  return {
    currentMomentId: startMomentId,
    history: [],
    values,
  };
}

export function resolveScreenSpec(
  moment: Moment,
  appMap: AppMap
): RuntimeScreenSpec {
  return moment.screenSpec ?? buildFallbackScreenSpec(moment, appMap);
}

export function resolveTemplatedValue<T>(
  value: T,
  values: Record<string, RuntimeValue>
): T {
  if (typeof value === 'string') {
    return value.replace(/\{\{\s*([^}]+)\s*\}\}/g, (_, path: string) => {
      const resolved = getValueAtPath(values, path.trim());
      if (resolved === undefined || resolved === null) return '';
      if (Array.isArray(resolved)) return resolved.join(', ');
      if (typeof resolved === 'object') return JSON.stringify(resolved);
      return String(resolved);
    }) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => resolveTemplatedValue(item, values)) as T;
  }

  if (value && typeof value === 'object') {
    const output: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
      output[key] = resolveTemplatedValue(entry, values);
    }
    return output as T;
  }

  return value;
}

function evaluateFormulas(
  formulas: Record<string, string>,
  values: Record<string, RuntimeValue>
): Record<string, RuntimeValue> {
  const result: Record<string, RuntimeValue> = { ...values };
  for (const [key, formula] of Object.entries(formulas)) {
    try {
      const ctxKeys = Object.keys(result);
      const ctxVals = ctxKeys.map((k) => {
        const v = result[k];
        return typeof v === 'string' ? parseFloat(v) || 0 : (v ?? 0);
      });
      // eslint-disable-next-line no-new-func
      const fn = new Function(...ctxKeys, `return (${formula})`);
      result[key] = fn(...ctxVals);
    } catch {
      result[key] = 0;
    }
  }
  return result;
}

export function applyActionToSession(
  session: RuntimeSessionState,
  action: RuntimeActionSpec
): RuntimeSessionState {
  const nextValues = applyEffects(session.values, action.effects ?? []);

  if (action.kind === 'compute') {
    const computed = evaluateFormulas(action.formulas ?? {}, nextValues);
    const target = action.target ?? session.currentMomentId;
    return {
      currentMomentId: target,
      history: session.currentMomentId ? [...session.history, session.currentMomentId] : session.history,
      values: computed,
    };
  }

  if (action.kind === 'back') {
    const history = [...session.history];
    const previousMomentId = history.pop() ?? session.currentMomentId;
    return {
      currentMomentId: previousMomentId,
      history,
      values: nextValues,
    };
  }

  const nextTarget = resolveActionTarget(action, nextValues);
  if (!nextTarget) {
    return {
      ...session,
      values: nextValues,
    };
  }

  return {
    currentMomentId: nextTarget,
    history: session.currentMomentId ? [...session.history, session.currentMomentId] : session.history,
    values: nextValues,
  };
}

export function setSessionValue(
  session: RuntimeSessionState,
  key: string,
  value: RuntimeValue
): RuntimeSessionState {
  return {
    ...session,
    values: {
      ...session.values,
      [key]: cloneRuntimeValue(value),
    },
  };
}

export function toggleSessionArrayValue(
  session: RuntimeSessionState,
  key: string,
  value: string
): RuntimeSessionState {
  const current = Array.isArray(session.values[key]) ? [...(session.values[key] as string[])] : [];
  const exists = current.includes(value);
  const next = exists ? current.filter((entry) => entry !== value) : [...current, value];

  return setSessionValue(session, key, next);
}

export function isActionEnabled(
  action: RuntimeActionSpec,
  session: RuntimeSessionState
): boolean {
  if (!action.requiredKeys?.length) return true;
  return action.requiredKeys.every((key) => isRuntimeValueFilled(session.values[key]));
}

export function isRuntimeValueFilled(value: RuntimeValue | undefined): boolean {
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'number') return true;
  if (typeof value === 'boolean') return true;
  if (value && typeof value === 'object') return Object.keys(value).length > 0;
  return Boolean(value);
}

export function buildFallbackStateSchema(appMap: AppMap): RuntimeStateField[] {
  const fields = [...(appMap.stateSchema ?? [])];
  if (fields.length > 0) return fields;

  const looksLikeAuth = appMap.moments.some((moment) => moment.type === 'auth');
  if (looksLikeAuth) {
    fields.push(
      { key: 'profileName', label: 'Name', type: 'string', defaultValue: '' },
      { key: 'profileEmail', label: 'Email', type: 'string', defaultValue: '' },
      { key: 'profilePassword', label: 'Password', type: 'string', defaultValue: '' }
    );
  }

  return fields;
}

export function normalizeRuntimeAppMap(appMap: AppMap): AppMap {
  const normalizedStateSchema = buildFallbackStateSchema(appMap);
  const normalizedMoments = appMap.moments.map((moment) => ({
    ...moment,
    screenSpec: normalizeScreenSpec(moment.screenSpec, moment, appMap),
  }));

  // Auto-fill edges that are implied by action targets but missing from the edge list
  const edges = autoFillMissingEdges(appMap, normalizedMoments);

  // Auto-derive branchOf from branch actions (pure branch destinations get hidden until expanded)
  const momentsWithBranches = autoDeriveBranchOf({ ...appMap, moments: normalizedMoments, edges });

  return {
    ...appMap,
    appPlatform: appMap.appPlatform ?? 'mobile',
    runtimeVersion: 1,
    stateSchema: normalizedStateSchema,
    initialState: appMap.initialState ?? {},
    moments: momentsWithBranches,
    edges,
  };
}

// Automatically mark branch-target moments with branchOf when they have only one
// incoming edge — meaning they exist solely as a conditional branch destination.
function autoDeriveBranchOf(appMap: AppMap): Moment[] {
  // Build incoming-edge sources per moment
  const incoming = new Map<string, string[]>();
  for (const edge of appMap.edges) {
    if (!incoming.has(edge.target)) incoming.set(edge.target, []);
    incoming.get(edge.target)!.push(edge.source);
  }

  // Find all branch-action targets: targetId → sourceId
  const branchSourceOf = new Map<string, string>();
  for (const moment of appMap.moments) {
    for (const action of moment.screenSpec?.actions ?? []) {
      if (action.kind !== 'branch') continue;
      for (const branch of action.branches ?? []) {
        if (branch.target) branchSourceOf.set(branch.target, moment.id);
      }
      if (action.fallbackTarget) branchSourceOf.set(action.fallbackTarget, moment.id);
    }
  }

  return appMap.moments.map((moment) => {
    if (moment.branchOf) return moment; // already set explicitly
    const sourceId = branchSourceOf.get(moment.id);
    if (!sourceId) return moment;
    const incomingIds = incoming.get(moment.id) ?? [];
    // Only mark as branch if every incoming edge comes from the same source
    if (incomingIds.length > 0 && incomingIds.every((s) => s === sourceId)) {
      return { ...moment, branchOf: sourceId };
    }
    return moment;
  });
}

function autoFillMissingEdges(appMap: AppMap, moments: Moment[]): AppMap['edges'] {
  const momentIds = new Set(moments.map((m) => m.id));
  const existing = new Set(appMap.edges.map((e) => `${e.source}→${e.target}`));
  const extra: AppMap['edges'] = [];

  for (const moment of moments) {
    const actions = moment.screenSpec?.actions ?? [];
    for (const action of actions) {
      const targets: Array<{ id: string; label: string }> = [];

      if (action.target && action.kind !== 'branch') {
        targets.push({ id: action.target, label: action.label });
      }
      if (action.kind === 'branch') {
        for (const branch of action.branches ?? []) {
          targets.push({ id: branch.target, label: String(branch.value) });
        }
        if (action.fallbackTarget) {
          targets.push({ id: action.fallbackTarget, label: 'other' });
        }
      }

      for (const { id: targetId, label } of targets) {
        if (!targetId || !momentIds.has(targetId)) continue;
        const key = `${moment.id}→${targetId}`;
        if (existing.has(key)) continue;
        existing.add(key);
        extra.push({
          id: `auto-${moment.id}-${targetId}`,
          source: moment.id,
          target: targetId,
          label,
        });
      }
    }
  }

  return [...appMap.edges, ...extra];
}

export function buildFallbackScreenSpec(
  moment: Moment,
  appMap: AppMap
): RuntimeScreenSpec {
  const outgoingEdges = appMap.edges.filter((edge) => edge.source === moment.id);
  const actions: RuntimeActionSpec[] =
    outgoingEdges.length > 1
      ? outgoingEdges.map((edge) => ({
          id: `${moment.id}-${edge.id}`,
          label: edge.label || labelForTarget(edge.target, appMap),
          kind: 'navigate',
          style: 'primary',
          target: edge.target,
        }))
      : outgoingEdges.length === 1
        ? [
            {
              id: `${moment.id}-${outgoingEdges[0].id}`,
              label: outgoingEdges[0].label || 'Continue',
              kind: 'navigate',
              style: 'primary',
              target: outgoingEdges[0].target,
            },
          ]
        : [];

  // For ui moments, the screen header (title + subtitle) already shows label + description.
  // Adding a hero with the same content just duplicates it — so skip the hero for ui fallbacks.
  const components: RuntimeComponentSpec[] = moment.type !== 'ui' ? [
    {
      id: `${moment.id}-hero`,
      type: 'hero',
      badge: badgeForMomentType(moment.type),
      title: moment.label,
      body: moment.description,
      align: 'left',
    },
  ] : [];

  if (moment.type === 'auth') {
    components.push(
      {
        id: `${moment.id}-name`,
        type: 'input',
        key: 'profileName',
        label: 'Name',
        placeholder: 'Enter your name',
      },
      {
        id: `${moment.id}-email`,
        type: 'input',
        key: 'profileEmail',
        label: 'Email',
        placeholder: 'alex@email.com',
        inputType: 'email',
      },
      {
        id: `${moment.id}-password`,
        type: 'input',
        key: 'profilePassword',
        label: 'Password',
        placeholder: 'Choose a password',
        inputType: 'password',
      }
    );
  } else if (moment.type === 'ai') {
    components.push({
      id: `${moment.id}-ai-notice`,
      type: 'notice',
      tone: 'info',
      title: 'AI Step',
      body: 'This step runs an AI model. Edit this moment to add specific inputs and outputs.',
    });
  } else if (moment.type === 'data') {
    // Infer simple inputs from stateSchema keys that match this moment's description
    const descLower = (moment.description + ' ' + moment.preview).toLowerCase();
    const dataInputs = inferDataInputs(moment.id, descLower, appMap);
    if (dataInputs.length > 0) {
      components.push(...dataInputs);
    } else {
      components.push({
        id: `${moment.id}-data-notice`,
        type: 'notice',
        tone: 'info',
        title: 'Data Step',
        body: 'This step reads or writes data. Edit this moment to define the fields.',
      });
    }
  }
  // ui type: screen header (title/subtitle) is sufficient — no extra components needed

  if (actions.length === 0) {
    actions.push({
      id: `${moment.id}-noop`,
      label: 'Done',
      kind: 'navigate',
      style: 'secondary',
    });
  }

  return {
    eyebrow: appMap.journeys.find((journey) => journey.id === moment.journeyId)?.name,
    title: moment.label,
    subtitle: moment.description,
    components,
    actions,
  };
}

// Infer simple form inputs from state schema keys that seem relevant to this data moment
function inferDataInputs(momentId: string, descLower: string, appMap: AppMap): RuntimeComponentSpec[] {
  const inputs: RuntimeComponentSpec[] = [];
  const schema = appMap.stateSchema ?? [];

  // Try to match state schema keys to this moment's description
  for (const field of schema) {
    const keyLower = field.key.toLowerCase();
    const labelLower = field.label.toLowerCase();
    // Only add inputs for fields that seem relevant to this moment
    const relevant =
      descLower.includes(keyLower) ||
      descLower.includes(labelLower) ||
      descLower.includes(keyLower.replace(/([A-Z])/g, ' $1').toLowerCase());
    if (!relevant) continue;

    if (field.type === 'string' || field.type === 'number') {
      inputs.push({
        id: `${momentId}-input-${field.key}`,
        type: 'input',
        key: field.key,
        label: field.label,
        placeholder: field.type === 'number' ? '0' : `Enter ${field.label.toLowerCase()}`,
        inputType: field.type === 'number' ? 'number' : 'text',
      });
    }
  }

  return inputs.slice(0, 4); // cap at 4 inputs
}

function applyEffects(
  values: Record<string, RuntimeValue>,
  effects: RuntimeEffectSpec[]
): Record<string, RuntimeValue> {
  const nextValues = { ...values };

  for (const effect of effects) {
    if (effect.kind === 'set-values') {
      const resolvedValues = resolveTemplatedValue(effect.values, nextValues);
      for (const [key, value] of Object.entries(resolvedValues)) {
        nextValues[key] = cloneRuntimeValue(value as RuntimeValue);
      }
    }

    if (effect.kind === 'append-list') {
      const current = Array.isArray(nextValues[effect.key]) ? [...(nextValues[effect.key] as RuntimePrimitive[])] : [];
      current.push(resolveTemplatedValue(effect.item, nextValues));
      nextValues[effect.key] = current;
    }
  }

  return nextValues;
}

function normalizeScreenSpec(
  screenSpec: RuntimeScreenSpec | undefined,
  moment: Moment,
  appMap: AppMap
): RuntimeScreenSpec {
  const fallback = buildFallbackScreenSpec(moment, appMap);

  if (!screenSpec || !Array.isArray(screenSpec.components) || !Array.isArray(screenSpec.actions)) {
    console.warn(`[runtime] normalizeScreenSpec: no screenSpec or missing arrays for moment "${moment.id}" — using fallback`);
    return fallback;
  }

  const components = screenSpec.components.filter(isValidRuntimeComponentSpec);
  const rejected = screenSpec.components.filter((c) => !isValidRuntimeComponentSpec(c));
  if (rejected.length > 0) {
    console.warn(`[runtime] moment "${moment.id}": rejected ${rejected.length} component(s):`, rejected);
  }

  const actions = screenSpec.actions.filter(isValidRuntimeActionSpec);
  const rejectedActions = screenSpec.actions.filter((a) => !isValidRuntimeActionSpec(a));
  if (rejectedActions.length > 0) {
    console.warn(`[runtime] moment "${moment.id}": rejected ${rejectedActions.length} action(s):`, rejectedActions);
  }

  return {
    ...screenSpec,
    components: components.length > 0 ? components : fallback.components,
    actions: actions.length > 0 ? actions : fallback.actions,
  };
}

function isValidRuntimeComponentSpec(component: unknown): component is RuntimeComponentSpec {
  if (!component || typeof component !== 'object') return false;

  const candidate = component as Record<string, unknown>;
  if (typeof candidate.id !== 'string' || typeof candidate.type !== 'string') return false;

  if (candidate.type === 'hero') {
    return typeof candidate.title === 'string';
  }

  if (candidate.type === 'input') {
    return typeof candidate.key === 'string' && typeof candidate.label === 'string';
  }

  if (candidate.type === 'choice-cards' || candidate.type === 'chip-group') {
    return (
      typeof candidate.key === 'string' &&
      (candidate.selection === 'single' || candidate.selection === 'multiple') &&
      Array.isArray(candidate.options)
    );
  }

  if (candidate.type === 'notice') {
    return (
      (candidate.tone === 'info' || candidate.tone === 'success' || candidate.tone === 'warning') &&
      typeof candidate.title === 'string'
    );
  }

  if (candidate.type === 'summary-card') {
    return typeof candidate.title === 'string';
  }

  if (candidate.type === 'stats-grid') {
    return Array.isArray(candidate.items);
  }

  if (candidate.type === 'list') {
    return Array.isArray(candidate.items);
  }

  if (candidate.type === 'spacer') {
    return true;
  }

  // Unknown component type — log and treat as invalid so it gets filtered
  console.warn(`[runtime] unknown component type "${candidate.type}" on component "${candidate.id}" — skipping`);
  return false;
}

function isValidRuntimeActionSpec(action: unknown): action is RuntimeActionSpec {
  if (!action || typeof action !== 'object') return false;

  const candidate = action as Record<string, unknown>;
  if (typeof candidate.id !== 'string' || typeof candidate.label !== 'string' || typeof candidate.kind !== 'string') {
    return false;
  }

  if (candidate.kind === 'navigate' || candidate.kind === 'back') {
    return true;
  }

  if (candidate.kind === 'branch') {
    return typeof candidate.branchKey === 'string' && Array.isArray(candidate.branches);
  }

  if (candidate.kind === 'compute') {
    return typeof candidate.target === 'string' && typeof candidate.formulas === 'object';
  }

  return false;
}

function resolveActionTarget(
  action: RuntimeActionSpec,
  values: Record<string, RuntimeValue>
): string | null {
  if (action.kind === 'navigate') return action.target ?? null;

  if (action.kind === 'branch') {
    const currentValue = values[action.branchKey ?? ''];
    const matchedBranch = action.branches?.find((branch) => branch.value === currentValue);
    return matchedBranch?.target ?? action.fallbackTarget ?? null;
  }

  return null;
}

function getValueAtPath(
  values: Record<string, RuntimeValue>,
  path: string
): unknown {
  const parts = path.split('.');
  let current: unknown = values;
  for (const part of parts) {
    if (!current || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

function cloneRuntimeValue<T>(value: T): T {
  if (value === undefined) return value;
  return JSON.parse(JSON.stringify(value)) as T;
}

function badgeForMomentType(type: Moment['type']): string {
  if (type === 'auth') return 'Auth Step';
  if (type === 'ai') return 'AI-Powered';
  if (type === 'data') return 'Data Layer';
  return 'UI Screen';
}

function labelForTarget(targetId: string, appMap: AppMap): string {
  return appMap.moments.find((moment) => moment.id === targetId)?.label ?? 'Continue';
}
