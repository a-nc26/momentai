import type { AppMap, Moment } from '@/lib/types';
import {
  AI_INSIGHTS_HTML,
  AI_MEALS_HTML,
  AI_DEBRIEF_HTML,
  AI_WORKOUT_HTML,
  ANALYTICS_HTML,
  CREATE_ACCOUNT_HTML,
  EXERCISE_PLAYER_HTML,
  FITNESS_ASSESSMENT_HTML,
  GOAL_ADVANCED_HTML,
  GOAL_ATHLETE_HTML,
  GOAL_BEGINNER_HTML,
  GOAL_INTERMEDIATE_HTML,
  LOG_MEAL_HTML,
  LOG_PR_HTML,
  NUTRITION_LOG_HTML,
  PROGRESS_DASHBOARD_HTML,
  RECIPE_DETAIL_HTML,
  SHARE_WORKOUT_HTML,
  WELCOME_HTML,
  WORKOUT_HOME_HTML,
  WORKOUT_LOG_HTML,
} from '@/lib/demo-screens';

const PREBUILT_DEMO_HTML_BY_ID: Record<string, string> = {
  welcome: WELCOME_HTML,
  'create-account': CREATE_ACCOUNT_HTML,
  'fitness-assessment': FITNESS_ASSESSMENT_HTML,
  'goal-beginner': GOAL_BEGINNER_HTML,
  'goal-intermediate': GOAL_INTERMEDIATE_HTML,
  'goal-advanced': GOAL_ADVANCED_HTML,
  'goal-athlete': GOAL_ATHLETE_HTML,
  'workout-home': WORKOUT_HOME_HTML,
  'ai-workout': AI_WORKOUT_HTML,
  'exercise-player': EXERCISE_PLAYER_HTML,
  'workout-log': WORKOUT_LOG_HTML,
  'log-pr': LOG_PR_HTML,
  'share-workout': SHARE_WORKOUT_HTML,
  'progress-dashboard': PROGRESS_DASHBOARD_HTML,
  analytics: ANALYTICS_HTML,
  'ai-insights': AI_INSIGHTS_HTML,
  'ai-debrief': AI_DEBRIEF_HTML,
  'nutrition-log': NUTRITION_LOG_HTML,
  'ai-meals': AI_MEALS_HTML,
  'recipe-detail': RECIPE_DETAIL_HTML,
  'log-meal': LOG_MEAL_HTML,
};

const GOAL_BRANCH_BASE_HTML_BY_ID: Record<string, string> = {
  'goal-beginner-foundation': GOAL_BEGINNER_HTML,
  'goal-beginner-schedule': GOAL_BEGINNER_HTML,
  'goal-beginner-summary': GOAL_BEGINNER_HTML,
  'goal-intermediate-split': GOAL_INTERMEDIATE_HTML,
  'goal-intermediate-progression': GOAL_INTERMEDIATE_HTML,
  'goal-intermediate-summary': GOAL_INTERMEDIATE_HTML,
  'goal-advanced-split': GOAL_ADVANCED_HTML,
  'goal-advanced-periodization': GOAL_ADVANCED_HTML,
  'goal-advanced-recovery': GOAL_ADVANCED_HTML,
  'goal-advanced-summary': GOAL_ADVANCED_HTML,
  'goal-athlete-mesocycles': GOAL_ATHLETE_HTML,
  'goal-athlete-performance': GOAL_ATHLETE_HTML,
  'goal-athlete-summary': GOAL_ATHLETE_HTML,
};

function retargetBranchHtml(baseHtml: string, targetMomentId: string | null): string {
  if (!targetMomentId) return baseHtml;
  return baseHtml.replace(/momentId:"[^"]+"/, `momentId:"${targetMomentId}"`);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

type BranchSkin = {
  h1: string;
  sub: string;
  planTitle: string;
  planSub: string;
  /** Optional: replace the two main sections (weekly + milestones) before `.ai-reasoning` */
  midSectionsHtml?: string;
  /** Replace text inside the first `.ai-text` (keeps “Why this plan” label) */
  aiText: string;
};

const GOAL_BRANCH_SKINS: Record<string, BranchSkin> = {
  'goal-beginner-foundation': {
    h1: 'Build your base',
    sub: 'Step 1 of 3 — movement quality before load.',
    planTitle: 'Foundation Builder',
    planSub: '3 full-body days, technique-first progressions, deloads baked in.',
    aiText:
      'We will keep reps controlled and RPE honest so tendons and joints keep up with muscle — the fastest safe path to a real training habit.',
  },
  'goal-beginner-schedule': {
    h1: 'Lock your week',
    sub: 'Step 2 of 3 — pick days you can protect on your calendar.',
    planTitle: 'Cadence you can keep',
    planSub: '3 sessions · Mon / Wed / Fri by default, swappable in one tap.',
    aiText: 'Consistency beats perfect splits. A sustainable weekly rhythm is the biggest predictor that you will still be training 8 weeks from now.',
  },
  'goal-beginner-summary': {
    h1: 'Your plan is ready',
    sub: 'Step 3 of 3 — review Foundation Builder, then start session one.',
    planTitle: 'Foundation Builder',
    planSub: '3 days · 8 weeks · habit and form first',
    aiText:
      'Your first two weeks bias stability and range of motion. Intensity ratchets only after we see clean reps across every pattern.',
  },
  'goal-intermediate-split': {
    h1: 'Design your split',
    sub: 'Step 1 of 3 — upper / lower with room for two heavy days.',
    planTitle: 'Strength & conditioning',
    planSub: '4-day upper / lower, progressive overload on compounds.',
    aiText: 'A 4-day cadence gives each muscle 48h before the next hard session — the sweet spot for strength and size at this level.',
  },
  'goal-intermediate-progression': {
    h1: 'Set progression',
    sub: 'Step 2 of 3 — how we add load when you are ahead of the curve.',
    planTitle: 'Progression model',
    planSub: 'Top set + backoff sets, with autoreg when sleep or HRV slip.',
    aiText:
      'We will nudge working weights only when bar speed and RPE look sustainable — no arbitrary weekly jumps that outrun recovery.',
  },
  'goal-intermediate-summary': {
    h1: 'Your plan is ready',
    sub: 'Step 3 of 3 — review, then start your first block.',
    planTitle: 'Strength & conditioning',
    planSub: '4 days · 12 weeks · upper / lower with built-in deloads',
    aiText: 'The next screen opens your first week with targets you can log set-by-set, no spreadsheet required.',
  },
  'goal-advanced-split': {
    h1: 'Advanced split',
    sub: 'Step 1 of 4 — PPL + volume cap so legs recover between heavy days.',
    planTitle: 'Power & Hypertrophy',
    planSub: '5-day PPL, undulating sets and reps, hard stop on junk volume.',
    aiText: 'We bias heavy compounds early in the week and slot arms and delts when pressing fatigue is lower.',
  },
  'goal-advanced-periodization': {
    h1: 'Periodization blocks',
    sub: 'Step 2 of 4 — 3:1 build-to-deload mesocycles across 16 weeks.',
    planTitle: 'Block model',
    planSub: 'Build weeks add volume, deloads reset the nervous system and tendons.',
    aiText: 'Intensity undulates inside each week so you never stack three heavy lower days in a row by accident.',
  },
  'goal-advanced-recovery': {
    h1: 'Recovery guardrails',
    sub: 'Step 3 of 4 — when we automatically pull volume or insert rest.',
    planTitle: 'Load safety rails',
    planSub: 'Tied to sleep debt, soreness, and a simple recovery score you log post-workout.',
    midSectionsHtml: `
<div class="section">
  <div class="section-title">Active rules</div>
  <div class="milestone"><div class="m-icon">🌙</div><div><div class="m-label">Under 6.5h sleep</div><div class="m-date">Next session: −1 top set on compounds</div></div></div>
  <div class="milestone"><div class="m-icon">📉</div><div><div class="m-label">HRV down 2 days</div><div class="m-date">Insert extra rest day or zone-2 only</div></div></div>
  <div class="milestone" style="border-bottom:0"><div class="m-icon">🦵</div><div><div class="m-label">Lower soreness 6/10+</div><div class="m-date">Cap leg volume 20% until score normalizes</div></div></div>
</div>
<div class="section">
  <div class="section-title">You stay in control</div>
  <p style="font-size:13px;color:var(--p-muted);line-height:1.55;padding:0 0 4px 0">Rules never delete sessions — they reshuffle loads so progress stays compounding after busy weeks or poor sleep.</p>
</div>`,
    aiText: 'If two signals fire at once, the coach prioritizes sleep first, then local soreness, then HRV. You will always see what changed in session notes.',
  },
  'goal-advanced-summary': {
    h1: 'Your plan is ready',
    sub: 'Step 4 of 4 — start training, or share with a partner coach.',
    planTitle: 'Power & Hypertrophy',
    planSub: '5–6 days · 16 weeks · PPL and undulating blocks',
    aiText: 'The next time you open Train, todays block reflects these guardrails, your split, and the periodisation calendar we just set.',
  },
  'goal-athlete-mesocycles': {
    h1: 'Mesocycle map',
    sub: 'Step 1 of 3 — competition or peak dates drive block length.',
    planTitle: 'Elite performance',
    planSub: '6+ sessions, meso lengths adjust when travel or comp prep shifts.',
    aiText: 'We anchor testing weeks to your performance calendar, not a generic Monday start.',
  },
  'goal-athlete-performance': {
    h1: 'Performance testing',
    sub: 'Step 2 of 3 — the lifts and metrics we track for velocity and power.',
    planTitle: 'Key checkpoints',
    planSub: 'VBT on main lifts, repeat jump height, and sprint splits where relevant.',
    aiText: 'Numbers feed load prescription so peaking is earned from trend data, not a spreadsheet guess.',
  },
  'goal-athlete-summary': {
    h1: 'Your plan is ready',
    sub: 'Step 3 of 3 — review, then start block one.',
    planTitle: 'Elite performance',
    planSub: '6+ days · 20 weeks · strength, speed, and skill windows',
    aiText: 'The training view opens with the current meso goal, this weeks KPI targets, and a single CTA to log tonights work.',
  },
};

/** Goal-branch template HTML reused the same “Your plan is ready” art for every step — swap in per-node copy + optional sections. */
function applyGoalBranchSkinsIfNeeded(momentId: string, html: string): string {
  const skin = GOAL_BRANCH_SKINS[momentId];
  if (!skin) return html;

  let out = html;

  out = out.replace(
    /<div class="goal-h1">[^<]*<\/div>/,
    `<div class="goal-h1">${escapeHtml(skin.h1)}</div>`
  );
  out = out.replace(
    /<div class="goal-sub">[^<]*<\/div>/,
    `<div class="goal-sub">${escapeHtml(skin.sub)}</div>`
  );

  out = out.replace(
    /<div class="plan-title">[^<]*<\/div>/,
    `<div class="plan-title">${escapeHtml(skin.planTitle)}</div>`
  );
  out = out.replace(
    /<div class="plan-sub">[^<]*<\/div>/,
    `<div class="plan-sub">${escapeHtml(skin.planSub)}</div>`
  );
  if (skin.midSectionsHtml) {
    out = out.replace(
      /<div class="section">\s*<div class="section-title">Weekly Schedule<\/div>[\s\S]*?(?=<div class="ai-reasoning">)/,
      `${skin.midSectionsHtml.trim()}\n`
    );
  }
  out = out.replace(
    /<div class="ai-text">[^<]*<\/div>/,
    `<div class="ai-text">${escapeHtml(skin.aiText)}</div>`
  );

  return out;
}

/**
 * Injects a single document-level click bridge so static demo HTML (mostly no scripts) still
 * drives `parent.postMessage({ type: 'navigate', momentId })` using the real app graph.
 */
function injectDemoClickBridge(html: string, moment: Moment, appMap: AppMap): string {
  if (!appMap.demoMode) return html;

  const out = (appMap.edges ?? [])
    .filter((e) => e.source === moment.id)
    .map((e) => ({ target: e.target, label: (e.label ?? '').trim() }));

  if (out.length === 0) return html;

  const payload = JSON.stringify(out);

  const bridge = `<script>
(function(){
  var OUT = ${payload};
  function nav(id){
    try { parent.postMessage({ type: 'navigate', momentId: id }, '*'); } catch (e) {}
  }
  function hasLbl(txt, l){
    if (!l) return false;
    return (txt || '').toLowerCase().indexOf(l.toLowerCase()) >= 0;
  }
  function pickFromTargetHint(tx){
    var t = (tx || '').toLowerCase();
    for (var i = 0; i < OUT.length; i++) {
      var id = OUT[i].target;
      if (t.indexOf(id.replace(/-/g, ' ')) >= 0) return id;
      var parts = id.split('-');
      for (var p = 0; p < parts.length; p++) {
        if (parts[p].length >= 4 && t.indexOf(parts[p]) >= 0) return id;
      }
    }
    return null;
  }
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || t.nodeType !== 1) return;
    if (t.closest('input, textarea, select, [contenteditable]')) return;

    var el = t.closest(
      'button, a, .option, [role=button], .btn, .btn-primary, .btn-ghost, .social-btn, .cta-btn, .streak-bar, .today-card, .nav-item, .milestone, .exercise, .act-icon'
    );
    if (!el) return;

    var targetId = null;

    if (OUT.length === 1) {
      targetId = OUT[0].target;
    } else {
      var opt = t.closest && t.closest('.option');
      if (opt) {
        var ot = (opt.textContent || '');
        for (var a = 0; a < OUT.length; a++) {
          if (OUT[a].label && hasLbl(ot, OUT[a].label)) {
            targetId = OUT[a].target;
            break;
          }
        }
      }
      if (!targetId) {
        var cont = t.closest && t.closest('.btn-primary');
        if (cont) {
          var active = document.querySelector('.option.active .option-label');
          if (active) {
            var atx = (active.textContent || '');
            for (var b = 0; b < OUT.length; b++) {
              if (OUT[b].label && hasLbl(atx, OUT[b].label)) {
                targetId = OUT[b].target;
                break;
              }
            }
          }
        }
      }
      if (!targetId) {
        var etx = (el.textContent || '');
        for (var c = 0; c < OUT.length; c++) {
          if (OUT[c].label && hasLbl(etx, OUT[c].label)) {
            targetId = OUT[c].target;
            break;
          }
        }
      }
      if (!targetId) {
        var ctx = (el.textContent || '');
        if (el.parentElement) {
          ctx += (el.parentElement.textContent || '').slice(0, 200);
        }
        targetId = pickFromTargetHint(ctx);
      }
    }

    if (!targetId) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    nav(targetId);
  }, true);
})();
<\/script>`;

  if (/<\/html>/i.test(html)) {
    return html.replace(/<\/html>\s*$/i, (closing) => bridge + '\n' + closing);
  }
  return html + bridge;
}

export function getPrebuiltDemoHtmlIfAny(moment: Moment, appMap: AppMap): string | null {
  const direct = PREBUILT_DEMO_HTML_BY_ID[moment.id];
  if (direct) return applyGoalBranchSkinsIfNeeded(moment.id, direct);

  const branchBase = GOAL_BRANCH_BASE_HTML_BY_ID[moment.id];
  if (!branchBase) return null;

  const nextTarget =
    appMap.edges.find((edge) => edge.source === moment.id)?.target ?? null;
  return applyGoalBranchSkinsIfNeeded(
    moment.id,
    retargetBranchHtml(branchBase, nextTarget)
  );
}

export function buildDemoPreviewHtml(moment: Moment, appMap: AppMap): string {
  const prebuilt = getPrebuiltDemoHtmlIfAny(moment, appMap);
  if (prebuilt) return injectDemoClickBridge(prebuilt, moment, appMap);

  const nextEdge = appMap.edges.find((edge) => edge.source === moment.id);
  const ctaLabel = nextEdge?.label || 'Open';
  const journey = appMap.journeys.find((entry) => entry.id === moment.journeyId);
  const kindLabel =
    moment.type === 'ai'
      ? 'AI Screen'
      : moment.type === 'data'
        ? 'Data Screen'
        : moment.type === 'auth'
          ? 'Auth Screen'
          : 'UI Screen';

  const fallback = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    :root{--bg:#050508;--card:#12141a;--border:#2a2f3a;--text:#f4f4f5;--muted:#8b90a0;--accent:#C7FF00;--on:#0a0a0a}
    *{box-sizing:border-box} body{margin:0;font-family:Inter,system-ui,-apple-system,sans-serif;background:linear-gradient(180deg,#0a0c10 0%,var(--bg) 55%);color:var(--text);min-height:100vh}
    .wrap{padding:18px;min-height:100vh}
    .chip{display:inline-block;padding:5px 10px;border-radius:999px;font-size:10px;letter-spacing:.08em;text-transform:uppercase;background:var(--card);color:var(--accent);border:1px solid var(--border)}
    .hero{margin-top:12px;border-radius:16px;padding:16px;background:var(--card);border:1px solid var(--border);box-shadow:0 8px 32px rgba(0,0,0,.45)}
    h1{margin:0;font-size:24px;line-height:1.2}
    .sub{margin:7px 0 0;color:var(--muted);font-size:13px;line-height:1.45}
    .stats{margin-top:12px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}
    .stat{border:1px solid var(--border);border-radius:12px;background:var(--card);padding:10px}
    .stat .k{margin:0;color:var(--muted);font-size:9px;text-transform:uppercase;letter-spacing:.09em}
    .stat .v{margin:6px 0 0;color:var(--accent);font-size:14px;font-weight:700}
    .card{margin-top:12px;border:1px solid var(--border);border-radius:14px;background:var(--card);padding:12px}
    .row{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
    .title{margin:0;color:var(--text);font-size:14px;font-weight:700}
    .badge{padding:4px 8px;border:1px solid var(--border);border-radius:999px;color:var(--muted);font-size:10px}
    .line{margin:0;color:var(--muted);font-size:12px;line-height:1.5}
    .btn{margin-top:14px;width:100%;border:0;border-radius:12px;padding:12px 14px;background:var(--accent);color:var(--on);font-weight:800;font-size:13px;cursor:pointer;box-shadow:0 4px 24px rgba(199,255,0,.2)}
  </style>
</head>
<body>
  <div class="wrap">
    <span class="chip">${escapeHtml(journey?.name || 'Pulse Demo')} • ${escapeHtml(kindLabel)}</span>
    <div class="hero">
      <h1>${escapeHtml(moment.label)}</h1>
      <p class="sub">Pre-rendered production demo screen.</p>
    </div>
    <div class="stats">
      <div class="stat"><p class="k">State</p><p class="v">Ready</p></div>
      <div class="stat"><p class="k">Mode</p><p class="v">Demo</p></div>
      <div class="stat"><p class="k">Flow</p><p class="v">${nextEdge ? 'Connected' : 'Complete'}</p></div>
    </div>
    <div class="card">
      <div class="row">
        <p class="title">Live app screen</p>
        <span class="badge">${escapeHtml(kindLabel)}</span>
      </div>
      <p class="line">This screen is rendered as part of the finished demo flow and supports in-map navigation.</p>
    </div>
    <button type="button" class="btn btn-primary" id="nextBtn">${escapeHtml(ctaLabel)}</button>
  </div>
</body>
</html>`;

  return injectDemoClickBridge(fallback, moment, appMap);
}
