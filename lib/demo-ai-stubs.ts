/**
 * Instant AI copy for Pulse demo — no /api/run-moment call, no loading overlay.
 * Keys: moment ids where type === 'ai' in lib/demo.ts.
 */
export const DEMO_AI_STUBS: Record<string, string> = {
  'goal-beginner':
    'Foundation Builder: 3×/week full-body, 8 weeks. Focus: movement quality → steady volume → confidence. Equipment-aware scheduling.',
  'goal-intermediate':
    'Strength & Conditioning: 4-day upper/lower, 12 weeks. Milestones: first logged 1RM, +10% squat, bodyweight bench. Recovery built into the split.',
  'goal-intermediate-progression':
    'Progression: add load after two clean top sets; stay inside rep ranges before bumping weight. Deload every 4th week if fatigue or soreness spikes.',
  'goal-advanced':
    'Power & Hypertrophy: 5-day PPL, 16 weeks, undulating blocks. Targets: scheduled deload, 2× BW deadlift milestone, peak-week PR attempt.',
  'goal-advanced-periodization':
    'Mesocycles: accumulation → intensification → peak. Volume waves with a deload before peak block so you arrive fresh for heavy work.',
  'goal-athlete':
    'Elite Performance: 6 training days + recovery, 20 weeks. Mesocycles for strength, speed, comp simulation, and taper into peak testing.',
  'goal-athlete-mesocycles':
    'Mesocycle map: strength base (weeks 1–6), speed/power (7–12), competition simulations (13–18), taper (19–20). Readiness checks: HRV, sprint splits, bar speed.',
  'ai-workout':
    'Adapted session: trimmed volume ~20% for energy under 3/5. Kept compounds, swapped one heavy accessory for a moderate pump finisher. Est. 38 min, ~310 kcal.',
  'ai-debrief':
    'Insights: volume +18% vs last week — watch lower-back fatigue. Squat top set moved well; consider +2.5 kg next leg day. Tomorrow: light upper or mobility.',
  'ai-insights':
    '30-day view: squat volume +12%. If sleep stays under 6.5h, add a rest day or cut accessory volume. Plateau risk: deload next week if RPE creeps up.',
  'ai-meals':
    'Three ideas: (1) Grilled salmon quinoa bowl — high protein, ~520 kcal. (2) Greek yogurt parfait — quick, ~280 kcal. (3) Turkey stir-fry — balanced, ~440 kcal.',
};
