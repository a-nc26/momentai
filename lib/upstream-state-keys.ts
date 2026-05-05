import type { AppMap, Moment } from '@/lib/types';

/**
 * Keys bound on this moment's screenSpec interactive components (user writes picks here).
 */
function collectMomentComponentStateKeys(moment: Moment): Set<string> {
  const keys = new Set<string>();
  for (const component of moment.screenSpec?.components ?? []) {
    if ('key' in component && typeof (component as { key?: string }).key === 'string') {
      const k = (component as { key: string }).key;
      if (k) keys.add(k);
    }
  }
  return keys;
}

/**
 * State keys set on moments connected by incoming edges — use to bind recap UIs downstream.
 * Unions edge.dataFlow.stateChanges and interactive component keys on edge sources.
 */
export function getUpstreamWrittenStateKeys(targetMomentId: string, appMap: AppMap): string[] {
  const incomingEdges = appMap.edges.filter((e) => e.target === targetMomentId);
  const keys = new Set<string>();

  for (const edge of incomingEdges) {
    for (const k of edge.dataFlow?.stateChanges ?? []) {
      if (k) keys.add(k);
    }
    const source = appMap.moments.find((m) => m.id === edge.source);
    if (!source) continue;
    for (const k of collectMomentComponentStateKeys(source)) keys.add(k);
  }

  return [...keys].sort();
}

const UPSTREAM_MARKER = '═══ UPSTREAM STATE — USER SET THESE ON PRIOR SCREENS ═══';

/** User-prompt fragment: bind recap/pill UI to upstream keys only. */
export function formatUpstreamStateBindingInstructions(
  keys: string[],
  appMap: AppMap
): string {
  if (keys.length === 0) return '';

  const lines = keys.map((key) => {
    const field = appMap.stateSchema?.find((f) => f.key === key);
    const typ = field?.type ?? 'string';
    const lbl = field?.label ?? key;
    return `  • ${key} (${typ}) — schema label: "${lbl}"`;
  });

  const keyRefs = keys.map((k) => `state.${k}`).join(', ');

  return `${UPSTREAM_MARKER}
The user reached this screen after earlier steps. These keys already hold the user's actual input or selections; any recap, profile, "your picks", summary pills, badges, or headings that reflect prior choices MUST read ONLY from: ${keyRefs}.

Keys:
${lines.join('\n')}

Mandatory:
- Read runtime values from shared state (${keyRefs}). Never swap in unrelated demo labels for these keys.
- For string[] keys: use Array.isArray(...) then .map(...) to render Badge/pill/text per element.
- When empty or missing: short empty-state copy — do not fabricate fake picks.

Forbidden for sections that present the user's prior selections:
- Canned mismatch lists (different topic/interest names than state holds).
- Placeholder arrays that contradict what the user selected on the previous screen.

You may still seed realistic demo content for lists/sections that do NOT claim to show the user's prior inputs for the keys above.
`;
}
