import { buildPulseVariantBlock, PULSE_DEMO } from './demo-pulse-chrome';
import type { AppMap, Moment } from './types';

const JOURNEY_LABEL: Record<string, string> = {
  onboarding: 'Onboarding',
  'daily-workout': 'Train',
  progress: 'Progress',
  nutrition: 'Nutrition',
};

const TYPE_TONE: Record<string, string> = {
  ui: 'UI',
  ai: 'AI',
  data: 'Data',
  auth: 'Auth',
};

/**
 * These screens render a full in-iframe app body — hide marketing title/description
 * and the `preview` spec (neither is end-user copy).
 * All Pulse demo `moment.id`s should stay in this set so the graph-injected fallback never
 * surfaces internal spec text if the static HTML path is bypassed.
 */
const FULL_APP_UI_IDS = new Set<string>([
  'welcome',
  'create-account',
  'fitness-assessment',
  'goal-beginner',
  'goal-beginner-foundation',
  'goal-beginner-schedule',
  'goal-beginner-summary',
  'goal-intermediate',
  'goal-intermediate-split',
  'goal-intermediate-progression',
  'goal-intermediate-summary',
  'goal-advanced',
  'goal-advanced-split',
  'goal-advanced-periodization',
  'goal-advanced-recovery',
  'goal-advanced-summary',
  'goal-athlete',
  'goal-athlete-mesocycles',
  'goal-athlete-performance',
  'goal-athlete-summary',
  'workout-home',
  'ai-workout',
  'exercise-player',
  'workout-log',
  'log-pr',
  'progress-dashboard',
  'analytics',
  'ai-insights',
  'nutrition-log',
  'ai-meals',
  'recipe-detail',
  'log-meal',
  'share-workout',
  'ai-debrief',
]);

/** `withGraphDemoComponentCode` always emits `function GraphDemoScreen` — not used for demo-edit / API builds. */
export function isGraphInjectedDemoComponentCode(code: string | undefined): boolean {
  if (!code || !code.trim()) return false;
  return /function\s+GraphDemoScreen\s*\(/.test(code);
}

/**
 * Injects a `componentCode` string for every moment that does not already have one, built from
 * the moment’s copy plus outgoing graph edges. Previews use the same React iframe shell as generated
 * screens (`onNavigate` → app map) instead of the static HTML mock path.
 */
export function withGraphDemoComponentCode(map: AppMap): AppMap {
  return {
    ...map,
    moments: map.moments.map((m) => {
      if (m.componentCode) return m;
      return { ...m, componentCode: buildGraphDemoComponentCode(m, map) };
    }),
  };
}

function buildGraphDemoComponentCode(m: Moment, map: AppMap): string {
  const { bgGradient, card, border, text, muted, accent, onAccent, radiusLg } = PULSE_DEMO;
  const journeyLine = JOURNEY_LABEL[m.journeyId] ?? 'Pulse';
  const tone = TYPE_TONE[m.type] ?? 'Screen';
  const out = (map.edges ?? [])
    .filter((e) => e.source === m.id)
    .map((e) => ({
      t: e.target,
      l: (e.label && e.label.trim()) || humanizeId(e.target),
    }));
  const navJson = JSON.stringify(out);
  const firstTarget = (out[0] && out[0].t) || '';
  const desc = m.description || '';
  const variantBlock = buildPulseVariantBlock(m.id, firstTarget);
  const fullApp = FULL_APP_UI_IDS.has(m.id);

  const topChrome = fullApp
    ? 'null'
    : `h('p', { style: { margin: 0, color: ${JSON.stringify(muted)}, fontSize: 9, letterSpacing: 1.1, textTransform: 'uppercase' } }, ${JSON.stringify(tone + ' · ' + m.label)}), h('h1', { style: { margin: '6px 0 8px', fontSize: 22, lineHeight: 1.15, fontWeight: 800 } }, ${JSON.stringify(m.label)}), h('p', { style: { margin: 0, color: ${JSON.stringify(muted)}, fontSize: 12, lineHeight: 1.55 } },
        ${JSON.stringify(desc)})`;

  return `window.__SCREEN_COMPONENT__ = function GraphDemoScreen(props) {
  var h = React.createElement;
  var onNavigate = props.onNavigate;
  var nav = ${navJson};

  return h('div', {
    style: {
      minHeight: '100vh',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      background: ${JSON.stringify(bgGradient)},
      color: ${JSON.stringify(text)},
      padding: 16,
      boxSizing: 'border-box',
    },
  },
    h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 } },
      h('span', { style: { fontSize: 13, fontWeight: 800, letterSpacing: 2, color: ${JSON.stringify(text)} } }, 'PULSE'),
      h('span', { style: { fontSize: 9, fontWeight: 700, color: ${JSON.stringify(accent)}, textTransform: 'uppercase', letterSpacing: 1 } }, ${JSON.stringify(journeyLine)}),
      h('span', { style: { width: 8, height: 8, borderRadius: 999, background: ${JSON.stringify(muted)}, opacity: 0.5 } })
    ),
    ${topChrome},
    ${variantBlock},
    nav.length
      ? h('div', { style: { display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 } },
          nav.map(function (item, i) {
            return h('button', {
              key: item.t,
              type: 'button',
              onClick: function () { onNavigate(item.t); },
              style: {
                width: '100%',
                border: i === 0 ? 0 : '1px solid ' + ${JSON.stringify(border)},
                borderRadius: ${JSON.stringify(radiusLg)} + 'px',
                padding: '12px 14px',
                background: i === 0 ? ${JSON.stringify(accent)} : ${JSON.stringify(card)},
                color: i === 0 ? ${JSON.stringify(onAccent)} : ${JSON.stringify(text)},
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
                textAlign: 'center',
                boxShadow: i === 0 ? '0 4px 24px rgba(199,255,0,0.25)' : 'none',
              },
            }, item.l);
          }),
        )
      : null
  );
};
`;
}

function humanizeId(id: string): string {
  return id
    .split('-')
    .map((p) => (p[0] ? p[0].toUpperCase() + p.slice(1) : p))
    .join(' ');
}
