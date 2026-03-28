import { AppMap, RuntimeActionSpec, RuntimeOption, RuntimeScreenSpec, RuntimeStateField } from './types';

const LEVEL_OPTIONS: RuntimeOption[] = [
  { value: 'Beginner', label: 'Beginner', description: 'Just starting out', icon: '🌱' },
  { value: 'Intermediate', label: 'Intermediate', description: '1-2 years training', icon: '⚡' },
  { value: 'Advanced', label: 'Advanced', description: '3+ years serious training', icon: '🔥' },
  { value: 'Athlete', label: 'Athlete', description: 'Competitive sports', icon: '🏆' },
];

const EQUIPMENT_OPTIONS: RuntimeOption[] = [
  { value: 'Full Gym', label: 'Full Gym', icon: '🏋️' },
  { value: 'Home Equipment', label: 'Home Equipment', icon: '🏠' },
  { value: 'No Equipment', label: 'No Equipment', icon: '🤸' },
  { value: 'Dumbbells Only', label: 'Dumbbells Only', icon: '🥊' },
];

const ENERGY_OPTIONS: RuntimeOption[] = [
  { value: '1', label: '1', description: 'Need recovery' },
  { value: '2', label: '2', description: 'Light day' },
  { value: '3', label: '3', description: 'Solid effort' },
  { value: '4', label: '4', description: 'Strong session' },
  { value: '5', label: '5', description: 'Push it today' },
];

export const PULSE_STATE_SCHEMA: RuntimeStateField[] = [
  { key: 'profileName', label: 'Name', type: 'string', defaultValue: '' },
  { key: 'profileEmail', label: 'Email', type: 'string', defaultValue: '' },
  { key: 'profilePassword', label: 'Password', type: 'string', defaultValue: '' },
  { key: 'isAuthenticated', label: 'Authenticated', type: 'boolean', defaultValue: false },
  { key: 'fitnessLevel', label: 'Fitness Level', type: 'enum', defaultValue: '', options: LEVEL_OPTIONS },
  { key: 'equipment', label: 'Equipment', type: 'string[]', defaultValue: [] },
  { key: 'currentPlanName', label: 'Current Plan', type: 'string', defaultValue: '' },
  { key: 'currentPlanFocus', label: 'Plan Focus', type: 'string', defaultValue: '' },
  { key: 'currentPlanDuration', label: 'Plan Duration', type: 'string', defaultValue: '' },
  { key: 'workoutEnergy', label: 'Energy', type: 'enum', defaultValue: '3', options: ENERGY_OPTIONS },
  { key: 'currentWorkoutTitle', label: 'Workout Title', type: 'string', defaultValue: 'Mobility Primer' },
  { key: 'currentWorkoutFocus', label: 'Workout Focus', type: 'string', defaultValue: 'Full body reset' },
  { key: 'currentWorkoutDuration', label: 'Workout Duration', type: 'string', defaultValue: '28 min' },
  { key: 'currentWorkoutCalories', label: 'Workout Calories', type: 'string', defaultValue: '210 kcal' },
  { key: 'weeklyConsistency', label: 'Consistency', type: 'string', defaultValue: '87%' },
  { key: 'prsThisWeek', label: 'PRs This Week', type: 'string', defaultValue: '3' },
  { key: 'lastWorkoutDuration', label: 'Last Workout Duration', type: 'string', defaultValue: '42 min' },
  { key: 'lastWorkoutCalories', label: 'Last Workout Calories', type: 'string', defaultValue: '387 kcal' },
  { key: 'lastWorkoutExercises', label: 'Last Workout Exercises', type: 'string', defaultValue: '5 exercises' },
  { key: 'lastMealName', label: 'Last Meal', type: 'string', defaultValue: 'Salmon Bowl' },
  { key: 'dailyCalories', label: 'Daily Calories', type: 'string', defaultValue: '1,840 / 2,400 kcal' },
];

export const PULSE_INITIAL_STATE = {
  workoutEnergy: '3',
  currentWorkoutTitle: 'Lower Body Power',
  currentWorkoutFocus: 'Glutes, quads, and core',
  currentWorkoutDuration: '45 min',
  currentWorkoutCalories: '320 kcal',
  weeklyConsistency: '87%',
  prsThisWeek: '3',
  dailyCalories: '1,840 / 2,400 kcal',
  lastMealName: 'Greek Yogurt Bowl',
};

const PULSE_SCREEN_SPECS: Record<string, RuntimeScreenSpec> = {
  welcome: {
    eyebrow: 'Onboarding',
    title: 'Your AI Coach Awaits',
    subtitle: 'Build a fitness system that adapts to your level, equipment, and goals in real time.',
    components: [
      { id: 'welcome-badge', type: 'hero', badge: 'Pulse AI Fitness', title: 'Train smarter every day', body: 'One map. One live prototype. Real stateful flows.' },
      { id: 'welcome-note', type: 'notice', tone: 'info', title: 'Preview goal', body: 'This v1 prototype keeps all state in session so you can test the journey end to end.' },
    ],
    actions: [
      { id: 'welcome-start', label: 'Get Started', kind: 'navigate', target: 'create-account', style: 'primary' },
      { id: 'welcome-login', label: 'I already have an account', kind: 'navigate', target: 'create-account', style: 'secondary' },
    ],
  },
  'create-account': {
    eyebrow: 'Onboarding',
    title: 'Create your account',
    subtitle: 'We will use this profile to personalize your plan and session recommendations.',
    components: [
      { id: 'create-name', type: 'input', key: 'profileName', label: 'Full Name', placeholder: 'Alex Johnson' },
      { id: 'create-email', type: 'input', key: 'profileEmail', label: 'Email Address', placeholder: 'alex@email.com', inputType: 'email' },
      { id: 'create-password', type: 'input', key: 'profilePassword', label: 'Password', placeholder: 'Choose a password', inputType: 'password' },
      { id: 'create-notice', type: 'notice', tone: 'info', title: 'No backend yet', body: 'Auth is stubbed in v1, but the profile state is real and powers the rest of the flow.' },
    ],
    actions: [
      {
        id: 'create-submit',
        label: 'Create Account',
        kind: 'navigate',
        target: 'fitness-assessment',
        style: 'primary',
        requiredKeys: ['profileName', 'profileEmail', 'profilePassword'],
        effects: [{ kind: 'set-values', values: { isAuthenticated: true } }],
      },
    ],
  },
  'fitness-assessment': {
    eyebrow: 'Onboarding',
    title: "What's your current fitness level?",
    subtitle: 'We will tailor your plan to match where you are right now and what equipment you actually have.',
    progress: { current: 2, total: 4 },
    components: [
      { id: 'fitness-level', type: 'choice-cards', key: 'fitnessLevel', selection: 'single', options: LEVEL_OPTIONS },
      { id: 'fitness-equipment', type: 'chip-group', key: 'equipment', label: 'Available equipment', selection: 'multiple', options: EQUIPMENT_OPTIONS },
    ],
    actions: [
      {
        id: 'fitness-continue',
        label: 'Continue',
        kind: 'branch',
        branchKey: 'fitnessLevel',
        style: 'primary',
        requiredKeys: ['fitnessLevel'],
        branches: [
          { value: 'Beginner', target: 'goal-beginner' },
          { value: 'Intermediate', target: 'goal-intermediate' },
          { value: 'Advanced', target: 'goal-advanced' },
          { value: 'Athlete', target: 'goal-athlete' },
        ],
      },
      { id: 'fitness-back', label: 'Back', kind: 'back', style: 'ghost' },
    ],
  },
  'goal-beginner': planScreen('Beginner', 'Foundation Builder', '8 weeks', [
    '3 sessions per week',
    'Full-body movement patterns',
    'Technique-first progression',
  ]),
  'goal-beginner-foundation': planFlowStep(
    'beginner-foundation',
    'Beginner Plan',
    'Start with movement foundations',
    'Weeks one and two focus on consistency, clean movement patterns, and building confidence before intensity rises.',
    '8-week ramp',
    'This beginner path starts light on purpose so adherence stays high.',
    ['Weeks 1-2: movement quality', 'Weeks 3-5: steady volume build', 'Weeks 6-8: confidence + capacity'],
    'Set Weekly Rhythm',
    'goal-beginner-schedule'
  ),
  'goal-beginner-schedule': planFlowStep(
    'beginner-schedule',
    'Beginner Plan',
    'Lock the weekly habit',
    'The plan spreads three sessions across the week so recovery stays simple and momentum stays steady.',
    'Weekly cadence',
    'Pulse will anchor your plan around repeatable training days.',
    ['Monday: full body fundamentals', 'Wednesday: mobility + strength basics', 'Friday: repeat and progress'],
    'Review Beginner Summary',
    'goal-beginner-summary'
  ),
  'goal-beginner-summary': planSummaryStep(
    'beginner-summary',
    'Beginner Plan',
    'Your beginner plan is ready',
    'Everything is now wired into the live runtime and ready to carry into your first session.',
    ['3-day cadence confirmed', '8-week progression mapped', 'First workout prepared'],
    'Foundation Builder Session',
    'Form-first programming aligned to {{equipment}}',
    '32 min',
    '230 kcal'
  ),
  'goal-intermediate': planScreen('Intermediate', 'Strength & Conditioning', '12 weeks', [
    '4-day upper/lower split',
    'Progressive overload targets',
    'Structured recovery pacing',
  ]),
  'goal-intermediate-split': planFlowStep(
    'intermediate-split',
    'Intermediate Plan',
    'Build the upper / lower split',
    'A four-day cadence lets you increase intensity without losing recovery quality across the week.',
    '12-week structure',
    'This split balances hypertrophy and strength progression.',
    ['Day 1: upper strength', 'Day 2: lower strength', 'Day 4: upper volume', 'Day 5: lower volume'],
    'Set Progression Rules',
    'goal-intermediate-progression'
  ),
  'goal-intermediate-progression': planFlowStep(
    'intermediate-progression',
    'Intermediate Plan',
    'Define progression rules',
    'Pulse will increase load, reps, or density based on session quality so progress stays measurable week over week.',
    'Progression engine',
    'Deloads are scheduled before fatigue starts to flatten results.',
    ['Add load after 2 clean top sets', 'Use rep ranges to protect form', 'Deload every 4th week if fatigue spikes'],
    'Review Intermediate Summary',
    'goal-intermediate-summary'
  ),
  'goal-intermediate-summary': planSummaryStep(
    'intermediate-summary',
    'Intermediate Plan',
    'Your intermediate plan is ready',
    'Your split, overload rules, and recovery pacing are now packed into one launchable runtime flow.',
    ['4-day split confirmed', 'Progression rules defined', 'Recovery pacing active'],
    'Strength & Conditioning Session',
    'Intermediate programming aligned to {{equipment}}',
    '45 min',
    '320 kcal'
  ),
  'goal-advanced': planScreen('Advanced', 'Power & Hypertrophy', '16 weeks', [
    '5-day push/pull/legs rhythm',
    'Undulating intensity blocks',
    'Peak-week performance checkpoints',
  ]),
  'goal-advanced-split': {
    eyebrow: 'Advanced Plan',
    title: 'Build your weekly split',
    subtitle: 'Lock the 5-day push/pull/legs rhythm before we layer in periodization.',
    components: [
      {
        id: 'advanced-split-card',
        type: 'summary-card',
        title: 'Recommended cadence',
        body: 'A 5-day structure balances volume, recovery, and progression.',
        items: ['Mon: Push', 'Tue: Pull', 'Wed: Legs', 'Fri: Upper Focus', 'Sat: Lower Focus'],
      },
    ],
    actions: [
      {
        id: 'advanced-split-next',
        label: 'Continue to Blocks',
        kind: 'navigate',
        target: 'goal-advanced-periodization',
        style: 'primary',
        effects: [
          {
            kind: 'set-values',
            values: {
              fitnessLevel: 'Advanced',
              currentPlanName: 'Power & Hypertrophy',
              currentPlanDuration: '16 weeks',
              currentPlanFocus: 'Advanced progression track',
            },
          },
        ],
      },
      { id: 'advanced-split-back', label: 'Back', kind: 'back', style: 'secondary' },
    ],
  },
  'goal-advanced-periodization': {
    eyebrow: 'Advanced Plan',
    title: 'Periodization blocks',
    subtitle: 'Your program rotates volume and intensity so progress stays high without flattening recovery.',
    components: [
      {
        id: 'advanced-periodization-card',
        type: 'summary-card',
        title: '16-week structure',
        body: 'Three blocks guide you from accumulation to peak strength and hypertrophy expression.',
        items: ['Weeks 1-5: Volume accumulation', 'Weeks 6-10: Intensification', 'Weeks 11-16: Peak + deload'],
      },
    ],
    actions: [
      { id: 'advanced-periodization-next', label: 'Set Recovery Rules', kind: 'navigate', target: 'goal-advanced-recovery', style: 'primary' },
      { id: 'advanced-periodization-back', label: 'Back', kind: 'back', style: 'secondary' },
    ],
  },
  'goal-advanced-recovery': {
    eyebrow: 'Advanced Plan',
    title: 'Recovery constraints',
    subtitle: 'Advanced plans need explicit rules for when to push and when to pull back.',
    components: [
      {
        id: 'advanced-recovery-card',
        type: 'summary-card',
        title: 'Recovery guardrails',
        body: 'Pulse will lighten the week if fatigue stacks too high.',
        items: ['Sleep under 6h for 2 nights -> reduce intensity', 'Performance dips for 2 sessions -> trigger deload', 'High soreness + low sleep -> swap heavy compounds'],
      },
    ],
    actions: [
      { id: 'advanced-recovery-next', label: 'Review Summary', kind: 'navigate', target: 'goal-advanced-summary', style: 'primary' },
      { id: 'advanced-recovery-back', label: 'Back', kind: 'back', style: 'secondary' },
    ],
  },
  'goal-advanced-summary': {
    eyebrow: 'Advanced Plan',
    title: 'Your advanced program is ready',
    subtitle: 'This final step packages the split, block structure, and recovery rules into one launchable plan.',
    components: [
      {
        id: 'advanced-summary-card',
        type: 'summary-card',
        title: '{{currentPlanName}}',
        body: '{{currentPlanDuration}} • {{currentPlanFocus}}',
        items: ['5-day split confirmed', 'Periodization blocks defined', 'Recovery rules active'],
      },
    ],
    actions: [
      {
        id: 'advanced-summary-start',
        label: 'Start Plan',
        kind: 'navigate',
        target: 'workout-home',
        style: 'primary',
        effects: [
          {
            kind: 'set-values',
            values: {
              currentWorkoutTitle: 'Power & Hypertrophy Session',
              currentWorkoutFocus: 'Advanced programming aligned to {{equipment}}',
              currentWorkoutDuration: '52 min',
              currentWorkoutCalories: '430 kcal',
            },
          },
        ],
      },
      { id: 'advanced-summary-back', label: 'Back', kind: 'back', style: 'secondary' },
    ],
  },
  'goal-athlete': planScreen('Athlete', 'Elite Performance', '20 weeks', [
    '6-day performance split',
    'Strength + speed mesocycles',
    'Competition simulation checkpoints',
  ]),
  'goal-athlete-mesocycles': planFlowStep(
    'athlete-mesocycles',
    'Athlete Plan',
    'Map the performance mesocycles',
    'Your plan rotates strength, speed, and taper blocks so readiness keeps climbing toward competition simulation weeks.',
    '20-week runway',
    'This structure keeps peak outputs timed to the right phases.',
    ['Block 1: force production', 'Block 2: speed conversion', 'Block 3: taper + competition prep'],
    'Set Performance Constraints',
    'goal-athlete-performance'
  ),
  'goal-athlete-performance': planFlowStep(
    'athlete-performance',
    'Athlete Plan',
    'Set performance checkpoints',
    'Pulse uses competition simulations and readiness checks to know when to push harder and when to protect recovery.',
    'Checkpoint rules',
    'Testing windows are built into the cycle so performance stays measurable.',
    ['Weekly readiness review', 'Bi-weekly sprint/power checks', 'Competition sim every 6 weeks'],
    'Review Athlete Summary',
    'goal-athlete-summary'
  ),
  'goal-athlete-summary': planSummaryStep(
    'athlete-summary',
    'Athlete Plan',
    'Your athlete plan is ready',
    'The mesocycle timeline and checkpoint system are now wired into the live prototype.',
    ['Mesocycles scheduled', 'Performance checkpoints active', 'Competition sim cadence defined'],
    'Elite Performance Session',
    'Athlete programming aligned to {{equipment}}',
    '65 min',
    '540 kcal'
  ),
  'workout-home': {
    eyebrow: 'Daily Workout',
    title: 'Good morning, {{profileName}}',
    subtitle: 'Your active plan is {{currentPlanName}}. Everything below is powered by live session state in this prototype.',
    components: [
      {
        id: 'workout-stats',
        type: 'stats-grid',
        items: [
          { label: 'Consistency', value: '{{weeklyConsistency}}' },
          { label: 'PRs this week', value: '{{prsThisWeek}}' },
          { label: 'Today', value: '{{currentWorkoutDuration}}' },
          { label: 'Calories', value: '{{currentWorkoutCalories}}' },
        ],
      },
      {
        id: 'workout-summary',
        type: 'summary-card',
        title: '{{currentWorkoutTitle}}',
        body: '{{currentWorkoutFocus}}',
        items: ['Plan: {{currentPlanName}}', 'Equipment: {{equipment}}'],
      },
    ],
    actions: [
      { id: 'workout-start', label: 'Start Workout', kind: 'navigate', target: 'ai-workout', style: 'primary' },
      { id: 'workout-progress', label: 'View Progress', kind: 'navigate', target: 'progress-dashboard', style: 'secondary' },
      { id: 'workout-nutrition', label: 'Track Nutrition', kind: 'navigate', target: 'nutrition-log', style: 'secondary' },
    ],
  },
  'ai-workout': {
    eyebrow: 'AI Session Builder',
    title: 'Adapt today\'s workout',
    subtitle: 'Pick your energy level and Pulse will reshape the session instantly before you start.',
    components: [
      { id: 'energy-select', type: 'choice-cards', key: 'workoutEnergy', label: 'How do you feel today?', selection: 'single', options: ENERGY_OPTIONS },
      {
        id: 'energy-summary',
        type: 'summary-card',
        title: 'Suggested session',
        body: 'Pulse will tune intensity based on your current plan and selected energy level.',
        items: [
          'Current plan: {{currentPlanName}}',
          'Planned duration: {{currentWorkoutDuration}}',
          'Estimated burn: {{currentWorkoutCalories}}',
        ],
      },
    ],
    actions: [
      {
        id: 'energy-begin',
        label: 'Generate & Begin',
        kind: 'navigate',
        target: 'exercise-player',
        style: 'primary',
        effects: [
          {
            kind: 'set-values',
            values: {
              currentWorkoutTitle: '{{currentPlanName}} Session',
              currentWorkoutFocus: 'Energy level {{workoutEnergy}}/5 tuned around {{equipment}}',
              currentWorkoutDuration: '{{workoutEnergy}}5 min',
              currentWorkoutCalories: '{{workoutEnergy}}20 kcal',
            },
          },
        ],
      },
      { id: 'energy-back', label: 'Back', kind: 'back', style: 'ghost' },
    ],
  },
  'exercise-player': {
    eyebrow: 'Workout Player',
    title: '{{currentWorkoutTitle}}',
    subtitle: '{{currentWorkoutFocus}}',
    components: [
      {
        id: 'exercise-progress',
        type: 'stats-grid',
        items: [
          { label: 'Set', value: '2 of 4' },
          { label: 'Reps', value: '12' },
          { label: 'Rest', value: '60s' },
          { label: 'Duration', value: '{{currentWorkoutDuration}}' },
        ],
      },
      {
        id: 'exercise-note',
        type: 'summary-card',
        title: 'Now performing',
        body: 'Bulgarian Split Squat with tempo control and posture cues.',
        items: ['Energy profile: {{workoutEnergy}}/5', 'Calories target: {{currentWorkoutCalories}}'],
      },
    ],
    actions: [
      {
        id: 'exercise-finish',
        label: 'Finish Workout',
        kind: 'navigate',
        target: 'workout-log',
        style: 'primary',
        effects: [
          {
            kind: 'set-values',
            values: {
              lastWorkoutDuration: '{{currentWorkoutDuration}}',
              lastWorkoutCalories: '{{currentWorkoutCalories}}',
              lastWorkoutExercises: '5 exercises',
            },
          },
        ],
      },
      { id: 'exercise-skip', label: 'Skip Ahead', kind: 'navigate', target: 'workout-log', style: 'secondary' },
    ],
  },
  'workout-log': {
    eyebrow: 'Workout Complete',
    title: 'Strong work, {{profileName}}',
    subtitle: 'This data moment is stubbed, but it writes real session state that other screens read.',
    components: [
      { id: 'workout-success', type: 'notice', tone: 'success', title: 'Workout saved', body: 'Your session summary and streak values are now available across the prototype.' },
      {
        id: 'workout-log-stats',
        type: 'stats-grid',
        items: [
          { label: 'Duration', value: '{{lastWorkoutDuration}}' },
          { label: 'Calories', value: '{{lastWorkoutCalories}}' },
          { label: 'Exercises', value: '{{lastWorkoutExercises}}' },
          { label: 'PRs', value: '{{prsThisWeek}}' },
        ],
      },
    ],
    actions: [
      { id: 'workout-log-progress', label: 'View Progress', kind: 'navigate', target: 'progress-dashboard', style: 'primary' },
      { id: 'workout-log-pr', label: 'Log PR', kind: 'navigate', target: 'log-pr', style: 'secondary' },
      { id: 'workout-log-share', label: 'Share', kind: 'navigate', target: 'share-workout', style: 'secondary' },
      { id: 'workout-log-ai', label: 'Get AI Debrief', kind: 'navigate', target: 'ai-debrief', style: 'secondary' },
    ],
  },
  'log-pr': {
    eyebrow: 'PR Celebration',
    title: 'New PR recorded',
    subtitle: 'Your latest effort pushed the bar higher. Pulse stores this as a deterministic data stub in session.',
    components: [
      { id: 'pr-card', type: 'summary-card', title: 'Deadlift +12 kg', body: 'Previous best: 145 kg. New best: 157 kg.', items: ['Improvement: +8.2%', 'Logged to this session only'] },
    ],
    actions: [
      { id: 'pr-home', label: 'Back to Dashboard', kind: 'navigate', target: 'workout-home', style: 'primary' },
    ],
  },
  'share-workout': {
    eyebrow: 'Share',
    title: 'Share your achievement',
    subtitle: 'The share sheet is mocked, but the stats below are real session values.',
    components: [
      { id: 'share-card', type: 'summary-card', title: '{{currentPlanName}} Session', body: '{{lastWorkoutDuration}} • {{lastWorkoutCalories}} • {{prsThisWeek}} PRs this week', items: ['Instagram Story', 'WhatsApp', 'Copy link'] },
    ],
    actions: [
      { id: 'share-home', label: 'Done', kind: 'navigate', target: 'workout-home', style: 'primary' },
    ],
  },
  'ai-debrief': {
    eyebrow: 'AI Debrief',
    title: 'Coach notes for today',
    subtitle: 'This AI moment is deterministic: it turns your latest workout state into a believable coaching summary.',
    components: [
      { id: 'debrief-card', type: 'summary-card', title: 'Recovery looks solid', body: 'Pulse noticed a strong session at {{workoutEnergy}}/5 energy with {{lastWorkoutDuration}} of work.', items: ['Keep tomorrow light if soreness spikes', 'Sleep window target: 8h', 'Hydrate after lower-body volume'] },
    ],
    actions: [
      { id: 'debrief-progress', label: 'Open Progress Dashboard', kind: 'navigate', target: 'progress-dashboard', style: 'primary' },
      { id: 'debrief-home', label: 'Back Home', kind: 'navigate', target: 'workout-home', style: 'secondary' },
    ],
  },
  'progress-dashboard': {
    eyebrow: 'Progress',
    title: 'Your performance dashboard',
    subtitle: 'Everything here is driven by the same session values you created in onboarding and the workout flow.',
    components: [
      {
        id: 'progress-stats',
        type: 'stats-grid',
        items: [
          { label: 'Current plan', value: '{{currentPlanName}}' },
          { label: 'Consistency', value: '{{weeklyConsistency}}' },
          { label: 'PRs this week', value: '{{prsThisWeek}}' },
          { label: 'Last workout', value: '{{lastWorkoutDuration}}' },
        ],
      },
      { id: 'progress-summary', type: 'summary-card', title: 'Latest signal', body: 'Your selected level is {{fitnessLevel}} and the plan focus is {{currentPlanFocus}}.', items: ['Calories today: {{dailyCalories}}', 'Last meal: {{lastMealName}}'] },
    ],
    actions: [
      { id: 'progress-analytics', label: 'Strength Analytics', kind: 'navigate', target: 'analytics', style: 'primary' },
      { id: 'progress-ai', label: 'AI Coaching Insights', kind: 'navigate', target: 'ai-insights', style: 'secondary' },
      { id: 'progress-home', label: 'Back Home', kind: 'navigate', target: 'workout-home', style: 'secondary' },
    ],
  },
  analytics: {
    eyebrow: 'Analytics',
    title: 'Strength analytics',
    subtitle: 'Charts are simplified in v1, but the screen still reacts to your current plan and latest workout state.',
    components: [
      { id: 'analytics-summary', type: 'summary-card', title: 'Trend summary', body: 'Plan: {{currentPlanName}} • Last workout: {{lastWorkoutDuration}} • PRs this week: {{prsThisWeek}}', items: ['Squat trend rising', 'Bench stable', 'Recovery on track'] },
    ],
    actions: [
      { id: 'analytics-ai', label: 'Get insights', kind: 'navigate', target: 'ai-insights', style: 'primary' },
      { id: 'analytics-back', label: 'Back', kind: 'back', style: 'secondary' },
    ],
  },
  'ai-insights': {
    eyebrow: 'AI Insights',
    title: 'What Pulse sees',
    subtitle: 'This AI screen produces deterministic insight copy using your live prototype state.',
    components: [
      { id: 'insight-main', type: 'summary-card', title: 'Primary insight', body: 'Because you are training at the {{fitnessLevel}} level with {{equipment}}, Pulse is prioritizing {{currentPlanFocus}}.', items: ['Consistency: {{weeklyConsistency}}', 'Latest workout duration: {{lastWorkoutDuration}}', 'Calories logged today: {{dailyCalories}}'] },
    ],
    actions: [
      { id: 'insight-home', label: 'Back Home', kind: 'navigate', target: 'workout-home', style: 'primary' },
      { id: 'insight-progress', label: 'Return to Progress', kind: 'navigate', target: 'progress-dashboard', style: 'secondary' },
    ],
  },
  'nutrition-log': {
    eyebrow: 'Nutrition',
    title: 'Nutrition dashboard',
    subtitle: 'Nutrition is session-only in v1, but entries made here update the rest of the prototype immediately.',
    components: [
      {
        id: 'nutrition-stats',
        type: 'stats-grid',
        items: [
          { label: 'Calories', value: '{{dailyCalories}}' },
          { label: 'Last meal', value: '{{lastMealName}}' },
          { label: 'Protein target', value: '142g' },
          { label: 'Meals today', value: '4' },
        ],
      },
    ],
    actions: [
      { id: 'nutrition-ai', label: 'Get meal suggestions', kind: 'navigate', target: 'ai-meals', style: 'primary' },
      { id: 'nutrition-home', label: 'Back Home', kind: 'navigate', target: 'workout-home', style: 'secondary' },
    ],
  },
  'ai-meals': {
    eyebrow: 'Meal Suggestions',
    title: 'AI meal suggestions',
    subtitle: 'Pulse turns your current calorie state into simple recommendations you can log immediately.',
    components: [
      { id: 'meal-suggestion', type: 'summary-card', title: 'Tonight\'s pick: Salmon Bowl', body: 'Built to support {{currentPlanName}} while keeping dinner around 520 kcal.', items: ['48g protein', '42g carbs', '14g fat'] },
      { id: 'meal-suggestion-2', type: 'summary-card', title: 'Backup: Greek Yogurt Bowl', body: 'Quick recovery snack with steady protein.', items: ['34g protein', '22g carbs', '6g fat'] },
    ],
    actions: [
      { id: 'meal-open-recipe', label: 'Open recipe', kind: 'navigate', target: 'recipe-detail', style: 'primary' },
      { id: 'meal-back', label: 'Back', kind: 'back', style: 'secondary' },
    ],
  },
  'recipe-detail': {
    eyebrow: 'Recipe Detail',
    title: 'Grilled Salmon & Quinoa Bowl',
    subtitle: 'A protein-forward dinner aligned to your current training phase.',
    components: [
      { id: 'recipe-summary', type: 'summary-card', title: 'Macro breakdown', body: '520 kcal • 48g protein • 42g carbs • 14g fat', items: ['Salmon fillet', 'Quinoa', 'Roasted vegetables', 'Tahini drizzle'] },
    ],
    actions: [
      { id: 'recipe-log', label: 'Log this meal', kind: 'navigate', target: 'log-meal', style: 'primary' },
      { id: 'recipe-back', label: 'Back', kind: 'back', style: 'secondary' },
    ],
  },
  'log-meal': {
    eyebrow: 'Log Meal',
    title: 'Save this meal',
    subtitle: 'This data step updates the current nutrition state in-session.',
    components: [
      { id: 'log-meal-card', type: 'summary-card', title: 'Salmon Bowl', body: 'Confirm your portion and save it to today\'s log.', items: ['Default portion: 1.0x', 'Meal type: Dinner'] },
    ],
    actions: [
      {
        id: 'log-meal-save',
        label: 'Save to Log',
        kind: 'navigate',
        target: 'nutrition-log',
        style: 'primary',
        effects: [
          {
            kind: 'set-values',
            values: {
              lastMealName: 'Grilled Salmon & Quinoa Bowl',
              dailyCalories: '2,360 / 2,400 kcal',
            },
          },
        ],
      },
      { id: 'log-meal-back', label: 'Back', kind: 'back', style: 'secondary' },
    ],
  },
};

export function withPulseRuntime(appMap: AppMap): AppMap {
  return {
    ...appMap,
    appPlatform: 'mobile',
    runtimeVersion: 1,
    stateSchema: PULSE_STATE_SCHEMA,
    initialState: PULSE_INITIAL_STATE,
    moments: appMap.moments.map((moment) => ({
      ...moment,
      screenSpec: PULSE_SCREEN_SPECS[moment.id] ?? moment.screenSpec,
    })),
  };
}

function planScreen(
  level: string,
  planName: string,
  duration: string,
  bullets: string[]
): RuntimeScreenSpec {
  const planKey = level.toLowerCase();
  const nextTarget =
    level === 'Beginner'
      ? 'goal-beginner-foundation'
      : level === 'Intermediate'
        ? 'goal-intermediate-split'
        : level === 'Advanced'
          ? 'goal-advanced-split'
          : level === 'Athlete'
            ? 'goal-athlete-mesocycles'
            : 'workout-home';

  const action: RuntimeActionSpec = {
    id: `${planKey}-plan-start`,
    label: nextTarget === 'workout-home' ? 'Start Plan' : 'Review Plan',
    kind: 'navigate',
    target: nextTarget,
    style: 'primary',
    effects: [
      {
        kind: 'set-values',
        values: {
          fitnessLevel: level,
          currentPlanName: planName,
          currentPlanDuration: duration,
          currentPlanFocus: `${level} progression track`,
          currentWorkoutTitle: `${planName} Session`,
          currentWorkoutFocus: `${level} programming aligned to {{equipment}}`,
          currentWorkoutDuration: level === 'Athlete' ? '65 min' : level === 'Advanced' ? '52 min' : level === 'Intermediate' ? '45 min' : '32 min',
          currentWorkoutCalories: level === 'Athlete' ? '540 kcal' : level === 'Advanced' ? '430 kcal' : level === 'Intermediate' ? '320 kcal' : '230 kcal',
        },
      },
    ],
  };

  return {
    eyebrow: 'AI Plan',
    title: planName,
    subtitle: `Pulse generated a ${duration} plan for your ${level} profile.`,
    components: [
      { id: `${planKey}-plan-card`, type: 'summary-card', title: '{{fitnessLevel}} athlete profile', body: 'Equipment detected: {{equipment}}', items: bullets },
      { id: `${planKey}-plan-note`, type: 'notice', tone: 'success', title: 'AI stub complete', body: 'This plan is deterministic, but it is now wired into the rest of the runtime.' },
    ],
    actions: [
      action,
      { id: `${planKey}-plan-back`, label: 'Back', kind: 'back', style: 'secondary' },
    ],
  };
}

function planFlowStep(
  key: string,
  eyebrow: string,
  title: string,
  subtitle: string,
  cardTitle: string,
  body: string,
  items: string[],
  nextLabel: string,
  target: string
): RuntimeScreenSpec {
  return {
    eyebrow,
    title,
    subtitle,
    components: [
      {
        id: `${key}-card`,
        type: 'summary-card',
        title: cardTitle,
        body,
        items,
      },
    ],
    actions: [
      { id: `${key}-next`, label: nextLabel, kind: 'navigate', target, style: 'primary' },
      { id: `${key}-back`, label: 'Back', kind: 'back', style: 'secondary' },
    ],
  };
}

function planSummaryStep(
  key: string,
  eyebrow: string,
  title: string,
  subtitle: string,
  items: string[],
  workoutTitle: string,
  workoutFocus: string,
  workoutDuration: string,
  workoutCalories: string
): RuntimeScreenSpec {
  return {
    eyebrow,
    title,
    subtitle,
    components: [
      {
        id: `${key}-summary`,
        type: 'summary-card',
        title: '{{currentPlanName}}',
        body: '{{currentPlanDuration}} • {{currentPlanFocus}}',
        items,
      },
      {
        id: `${key}-notice`,
        type: 'notice',
        tone: 'success',
        title: 'Plan ready',
        body: 'Your subflow is complete, and the workout dashboard will now launch with the right plan context.',
      },
    ],
    actions: [
      {
        id: `${key}-start`,
        label: 'Start Plan',
        kind: 'navigate',
        target: 'workout-home',
        style: 'primary',
        effects: [
          {
            kind: 'set-values',
            values: {
              currentWorkoutTitle: workoutTitle,
              currentWorkoutFocus: workoutFocus,
              currentWorkoutDuration: workoutDuration,
              currentWorkoutCalories: workoutCalories,
            },
          },
        ],
      },
      { id: `${key}-back`, label: 'Back', kind: 'back', style: 'secondary' },
    ],
  };
}
