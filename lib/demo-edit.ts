import type { AppMap, Moment } from '@/lib/types';
import type {
  EditMomentResult,
  EditMomentSuccess,
  PropagateBatchBody,
  PropagateBatchResult,
} from '@/lib/apply-moment-edit';
import { isDemoEditConsumed } from '@/lib/demo-edit-session';
import { DEMO_DAILY_WORKOUT_ROW_Y } from '@/lib/demo';
import { PULSE_DEMO } from '@/lib/demo-pulse-chrome';

/** Screen that runs the canned demo NL edit + cascade (see Compose tab in demoMode). */
export const DEMO_EDIT_MOMENT_ID = 'workout-log' as const;

const { bg, card, card2, border, text, muted, accent, onAccent, radius, radiusLg, success } = PULSE_DEMO;

type DemoEditRecipe = {
  momentId: typeof DEMO_EDIT_MOMENT_ID;
  ctaLabel: string;
  changeText: string;
  editResult: EditMomentSuccess;
  propagateUpdates: PropagateBatchResult['updates'];
  propagateAdditions: {
    moments: AppMap['moments'];
    edges: AppMap['edges'];
  };
};

const WORKOUT_LOG_COMPONENT = `window.__SCREEN_COMPONENT__ = function WorkoutLogDemoEdit(props) {
  var onNavigate = props.onNavigate;
  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', background: '${bg}', backgroundImage: 'linear-gradient(180deg, #0a0c10 0%, ${bg} 50%)', color: '${text}', padding: 18, boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: 2 }}>PULSE</span>
        <span style={{ fontSize: 9, fontWeight: 700, color: '${accent}', textTransform: 'uppercase', letterSpacing: 1 }}>Complete</span>
      </div>
      <p style={{ margin: 0, color: '${muted}', fontSize: 10, letterSpacing: 1.1, textTransform: 'uppercase' }}>Workout complete</p>
      <h1 style={{ margin: '6px 0 8px', fontSize: 24, fontWeight: 800, lineHeight: 1.15 }}>Recovery-first recap</h1>
      <p style={{ margin: 0, color: '${muted}', fontSize: 13, lineHeight: 1.5 }}>Nice work. Pulse queued a lighter cooldown plan and updated tomorrow's readiness target.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14, marginBottom: 12 }}>
        {[
          ['Duration', '42 min'],
          ['Calories', '387 kcal'],
          ['Exercises', '5'],
          ['Recovery', '84%'],
        ].map(([label, value]) => (
          <div key={label} style={{ border: '1px solid ${border}', borderRadius: '${radius}px', padding: 12, background: '${card}' }}>
            <p style={{ margin: 0, color: '${muted}', fontSize: 10 }}>{label}</p>
            <p style={{ margin: '6px 0 0', fontSize: 17, fontWeight: 700 }}>{value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button type="button" onClick={function () { onNavigate('progress-dashboard'); }} style={{ width: '100%', border: 0, borderRadius: '${radiusLg}px', padding: '13px 14px', background: '${accent}', color: '${onAccent}', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 24px rgba(199,255,0,0.25)' }}>
          View progress
        </button>
        <button type="button" onClick={function () { onNavigate('log-pr'); }} style={{ width: '100%', border: '1px solid ${border}', borderRadius: '${radiusLg}px', padding: '11px 14px', background: '${card2}', color: '${text}', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
          Log PR celebration
        </button>
        <button type="button" onClick={function () { onNavigate('share-workout'); }} style={{ width: '100%', border: '1px solid ${border}', borderRadius: '${radiusLg}px', padding: '11px 14px', background: 'transparent', color: '${text}', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
          Share workout
        </button>
        <button type="button" onClick={function () { onNavigate('ai-debrief'); }} style={{ width: '100%', border: '1px solid rgba(199,255,0,0.35)', borderRadius: '${radiusLg}px', padding: '11px 14px', background: 'rgba(199,255,0,0.08)', color: '${accent}', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
          Generate AI debrief
        </button>
      </div>
    </div>
  );
};
`;

const PROGRESS_DASHBOARD_COMPONENT = `window.__SCREEN_COMPONENT__ = function ProgressDashboardDemoEdit(props) {
  var onNavigate = props.onNavigate;
  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', background: '${bg}', backgroundImage: 'linear-gradient(180deg, #0a0c10 0%, ${bg} 50%)', color: '${text}', padding: 18, boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: 2 }}>PULSE</span>
        <span style={{ fontSize: 9, fontWeight: 700, color: '${accent}', textTransform: 'uppercase' }}>Progress</span>
      </div>
      <h1 style={{ margin: '4px 0 6px', fontSize: 24, fontWeight: 800 }}>Recovery trend now tracked</h1>
      <p style={{ margin: 0, color: '${muted}', fontSize: 13, lineHeight: 1.5 }}>Your dashboard now highlights post-workout recovery windows and next-session readiness.</p>

      <div style={{ marginTop: 16, borderRadius: '${radius}px', border: '1px solid ${border}', background: '${card}', padding: 12 }}>
        <p style={{ margin: 0, fontSize: 9, color: '${muted}', textTransform: 'uppercase' }}>Readiness</p>
        <p style={{ margin: '6px 0 0', fontSize: 28, fontWeight: 800, color: '${accent}' }}>92%</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 14 }}>
        <button type="button" onClick={function () { onNavigate('analytics'); }} style={{ width: '100%', border: 0, borderRadius: '${radiusLg}px', padding: '12px 14px', background: '${accent}', color: '${onAccent}', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 24px rgba(199,255,0,0.2)' }}>
          Strength analytics
        </button>
        <button type="button" onClick={function () { onNavigate('nutrition-log'); }} style={{ width: '100%', border: '1px solid ${border}', borderRadius: '${radiusLg}px', padding: '11px 14px', background: '${card2}', color: '${text}', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
          Track nutrition
        </button>
      </div>
    </div>
  );
};
`;

const SHARE_WORKOUT_COMPONENT = `window.__SCREEN_COMPONENT__ = function ShareWorkoutDemoEdit(props) {
  var onNavigate = props.onNavigate;
  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', background: '${bg}', backgroundImage: 'linear-gradient(180deg, #0a0c10 0%, ${bg} 50%)', color: '${text}', padding: 18, boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: 2 }}>PULSE</span>
        <span style={{ fontSize: 9, fontWeight: 700, color: '${accent}', textTransform: 'uppercase' }}>Share</span>
      </div>
      <h1 style={{ margin: '4px 0 6px', fontSize: 24, fontWeight: 800 }}>Share your recovery win</h1>
      <p style={{ margin: 0, color: '${muted}', fontSize: 13 }}>Updated card highlights cooldown consistency and readiness gains.</p>

      <div style={{ marginTop: 14, borderRadius: '${radiusLg}px', border: '1px solid ${border}', background: '${card}', padding: 14, boxShadow: '0 0 0 1px rgba(199,255,0,0.06)' }}>
        <p style={{ margin: 0, color: '${accent}', fontSize: 9, textTransform: 'uppercase', letterSpacing: 1 }}>Recovery snapshot</p>
        <h2 style={{ margin: '6px 0 4px', fontSize: 18, fontWeight: 800 }}>84% recovery consistency</h2>
        <p style={{ margin: 0, color: '${muted}', fontSize: 12, lineHeight: 1.45 }}>3 cooldown sessions completed this week. Readiness lifted to 92% for tomorrow.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
        {[
          ['Cooldown streak', '5 days'],
          ['Readiness delta', '+12%'],
        ].map(([label, value]) => (
          <div key={label} style={{ borderRadius: '${radius}px', border: '1px solid ${border}', padding: 10, background: '${card2}' }}>
            <p style={{ margin: 0, color: '${muted}', fontSize: 9 }}>{label}</p>
            <p style={{ margin: '5px 0 0', fontSize: 15, fontWeight: 700 }}>{value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
        <button type="button" onClick={function () { onNavigate('workout-home'); }} style={{ width: '100%', border: 0, borderRadius: '${radiusLg}px', padding: '12px 14px', background: '${accent}', color: '${onAccent}', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 24px rgba(199,255,0,0.2)' }}>
          Share recovery card
        </button>
        <button type="button" onClick={function () { onNavigate('progress-dashboard'); }} style={{ width: '100%', border: '1px solid ${border}', borderRadius: '${radiusLg}px', padding: '11px 14px', background: 'transparent', color: '${text}', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
          Back to progress
        </button>
      </div>
    </div>
  );
};
`;

const AI_DEBRIEF_COMPONENT = `window.__SCREEN_COMPONENT__ = function AIDebriefDemoEdit(props) {
  var onNavigate = props.onNavigate;
  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', background: '${bg}', backgroundImage: 'linear-gradient(180deg, #0a0c10 0%, ${bg} 50%)', color: '${text}', padding: 18, boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: 2 }}>PULSE</span>
        <span style={{ fontSize: 9, fontWeight: 700, color: '${accent}', textTransform: 'uppercase' }}>AI Debrief</span>
      </div>
      <p style={{ margin: 0, color: '${muted}', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase' }}>Recovery intelligence</p>
      <h1 style={{ margin: '6px 0 8px', fontSize: 24, fontWeight: 800, lineHeight: 1.15 }}>Cooldown insights added</h1>
      <p style={{ margin: 0, color: '${muted}', fontSize: 13, lineHeight: 1.5 }}>Coach now prioritizes active recovery cues after intense lower-body sessions.</p>

      <div style={{ marginTop: 14, borderRadius: '${radiusLg}px', border: '1px solid rgba(74,222,128,0.35)', background: 'rgba(74,222,128,0.08)', padding: 14, boxShadow: '0 0 32px rgba(74,222,128,0.12)' }}>
        <p style={{ margin: 0, color: '${success}', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.1 }}>Coach recommendation</p>
        <p style={{ margin: '8px 0 0', color: '${text}', fontSize: 13, lineHeight: 1.55 }}>
          Swap tomorrow's high-intensity finisher for a 14-minute mobility cooldown. This keeps your readiness above 90% while preserving weekly volume.
        </p>
      </div>

      <div style={{ marginTop: 12, borderRadius: '${radius}px', border: '1px solid ${border}', background: '${card}', padding: 12 }}>
        <p style={{ margin: 0, color: '${muted}', fontSize: 9, textTransform: 'uppercase' }}>Next session plan</p>
        <ul style={{ margin: '8px 0 0', paddingLeft: 18, color: '${text}', fontSize: 12, lineHeight: 1.6 }}>
          <li>8 min zone-2 warmup</li>
          <li>Lower-body strength block (reduced load)</li>
          <li>14 min guided cooldown</li>
        </ul>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 18 }}>
        <button type="button" onClick={function () { onNavigate('progress-dashboard'); }} style={{ width: '100%', border: 0, borderRadius: '${radiusLg}px', padding: '14px 16px', background: '${accent}', color: '${onAccent}', fontWeight: 800, fontSize: 15, cursor: 'pointer', boxShadow: '0 4px 28px rgba(199,255,0,0.35)' }}>
          View progress
        </button>
        <button type="button" onClick={function () { onNavigate('workout-log'); }} style={{ width: '100%', border: '1px solid ${border}', borderRadius: '${radiusLg}px', padding: '12px 14px', background: '${card2}', color: '${text}', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
          Back to completion log
        </button>
      </div>
    </div>
  );
};
`;

const ADDED_AI_DEBRIEF_MOMENT: AppMap['moments'][number] = {
  id: 'ai-debrief',
  journeyId: 'daily-workout',
  label: 'AI Recovery Debrief',
  type: 'ai',
  description:
    'New AI-generated recovery plan created from workout completion data, soreness trend, and readiness predictions.',
  preview:
    'AI coach debrief with recovery score, risk flags, and a tailored next-session plan.',
  position: { x: 900, y: DEMO_DAILY_WORKOUT_ROW_Y },
  branchOf: 'workout-log',
  componentCode: AI_DEBRIEF_COMPONENT,
  promptTemplate: `You are Pulse AI Coach. Build a post-workout recovery debrief from:
- Session intensity, volume, and PR deltas
- Current soreness and sleep trend
- Next training target

Return:
1) recovery score + risk tier
2) 2-3 insights explaining readiness
3) concrete next-session adjustments
4) a one-tap "accept plan" summary`,
};

const ADDED_AI_DEBRIEF_EDGE: AppMap['edges'][number] = {
  id: 'e8c',
  source: 'workout-log',
  target: 'ai-debrief',
  label: 'Generate AI debrief',
};

/** After debrief, wire map navigation + preview CTAs (graph-based generator). */
const AI_DEBRIEF_TO_PROGRESS_EDGE: AppMap['edges'][number] = {
  id: 'e8d',
  source: 'ai-debrief',
  target: 'progress-dashboard',
  label: 'View progress',
};

const DEMO_EDIT_RECIPE: DemoEditRecipe = {
  momentId: DEMO_EDIT_MOMENT_ID,
  ctaLabel: 'Try demo edit',
  changeText:
    'Big upgrade: transform this completion screen into a recovery cockpit, add a new AI Recovery Debrief screen to the flow, wire a CTA into it, and make downstream screens mirror the new recovery narrative.',
  editResult: {
    ok: true,
    componentCode: WORKOUT_LOG_COMPONENT,
    metadata: {
      label: 'Completion & Recovery Log',
      description: 'Post-workout recap with recovery score and cooldown-first next step.',
      preview:
        'Recovery-first completion card with score, updated metrics, and a cooldown CTA.',
    },
    affectedMoments: {
      'progress-dashboard': 'Progress dashboard references the completion summary and should include recovery trend messaging.',
      'share-workout': 'Share card copy mirrors the completion message and should highlight recovery wins.',
      'ai-debrief': 'Create a brand new AI Recovery Debrief node from this edit with a dedicated edge and high-signal coaching UI.',
    },
  },
  propagateUpdates: {
    'progress-dashboard': {
      componentCode: PROGRESS_DASHBOARD_COMPONENT,
      description: 'Progress dashboard updated with recovery trend messaging from the completion flow.',
    },
    'share-workout': {
      componentCode: SHARE_WORKOUT_COMPONENT,
      description: 'Share flow now highlights recovery and readiness progress.',
    },
    'ai-debrief': {
      componentCode: AI_DEBRIEF_COMPONENT,
      label: 'AI Recovery Debrief',
      description: 'Newly created AI debrief screen with recovery score, risk framing, and an action plan.',
      preview:
        'Coach-led recovery debrief with highlighted recommendation and next session checklist.',
    },
  },
  propagateAdditions: {
    moments: [ADDED_AI_DEBRIEF_MOMENT],
    edges: [ADDED_AI_DEBRIEF_EDGE, AI_DEBRIEF_TO_PROGRESS_EDGE],
  },
};

/** Short description for in-app demo hints. */
export function getDemoEditFlowDescription(): {
  primaryLabel: string;
  summary: string;
} {
  return {
    primaryLabel: 'Completion & Log',
    summary:
      'Applies a ready-made “recovery-first” completion screen, then opens Review cascade to update Progress + Share and create a brand new AI Recovery Debrief node (all stubbed, no API).',
  };
}

export function getDemoEditPreset(momentId: string): { label: string; changeText: string } | null {
  if (momentId !== DEMO_EDIT_RECIPE.momentId) return null;
  return {
    label: DEMO_EDIT_RECIPE.ctaLabel,
    changeText: DEMO_EDIT_RECIPE.changeText,
  };
}

export function resolveDemoEditMoment(params: {
  appMap: AppMap;
  moment: Moment;
}): EditMomentResult | null {
  if (!params.appMap.demoMode) return null;
  if (params.moment.id !== DEMO_EDIT_RECIPE.momentId) return null;
  if (isDemoEditConsumed()) {
    return {
      ok: false,
      error: 'The demo includes one free edit per browser session.',
      suggestion: 'Click “Reset demo” in the header or run the demo again from the start screen, or open /app?demo=true in a new tab.',
    };
  }
  return DEMO_EDIT_RECIPE.editResult;
}

export function resolveDemoPropagateBatch(body: PropagateBatchBody): PropagateBatchResult | null {
  if (!body.appMap.demoMode) return null;
  if (body.editedMoment.id !== DEMO_EDIT_RECIPE.momentId) return null;

  const acceptedIds = new Set(body.items.map((item) => item.moment.id));
  const updates = Object.fromEntries(
    Object.entries(DEMO_EDIT_RECIPE.propagateUpdates).filter(([momentId]) =>
      acceptedIds.has(momentId)
    )
  );
  const shouldAddAIDebrief = acceptedIds.has('ai-debrief');
  const additions = shouldAddAIDebrief
    ? {
        moments: DEMO_EDIT_RECIPE.propagateAdditions.moments,
        edges: DEMO_EDIT_RECIPE.propagateAdditions.edges,
      }
    : undefined;
  return { updates, additions };
}
