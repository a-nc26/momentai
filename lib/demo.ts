import { AppMap } from './types';
import { withPulseRuntime } from './pulse-runtime';
import {
  WELCOME_HTML,
  CREATE_ACCOUNT_HTML,
  FITNESS_ASSESSMENT_HTML,
  WORKOUT_HOME_HTML,
  AI_WORKOUT_HTML,
  EXERCISE_PLAYER_HTML,
  WORKOUT_LOG_HTML,
  PROGRESS_DASHBOARD_HTML,
  ANALYTICS_HTML,
  AI_INSIGHTS_HTML,
  NUTRITION_LOG_HTML,
  AI_MEALS_HTML,
  RECIPE_DETAIL_HTML,
  LOG_MEAL_HTML,
  GOAL_BEGINNER_HTML,
  GOAL_INTERMEDIATE_HTML,
  GOAL_ADVANCED_HTML,
  GOAL_ATHLETE_HTML,
  LOG_PR_HTML,
  SHARE_WORKOUT_HTML,
  AI_DEBRIEF_HTML,
} from './demo-screens';

const BASE_DEMO_MAP: AppMap = {
  appName: 'Pulse — AI Fitness Coach',
  appDescription:
    'An AI-powered fitness app that generates personalised workouts, tracks progress, and adapts your plan in real time based on your performance and goals.',
  appPlatform: 'mobile',
  journeys: [
    {
      id: 'onboarding',
      name: 'Onboarding',
      description: 'New user setup — account creation, fitness assessment, goal selection',
    },
    {
      id: 'daily-workout',
      name: 'Daily Workout',
      description: 'AI-generated workout sessions, guided exercise player, and completion logging',
    },
    {
      id: 'progress',
      name: 'Track Progress',
      description: 'Personal analytics dashboard, streaks, body metrics, and AI coaching insights',
    },
    {
      id: 'nutrition',
      name: 'Nutrition',
      description: 'AI meal planning, calorie tracking, macro breakdown, and recipe discovery',
    },
  ],
  moments: [
    // Onboarding — y: 0
    {
      id: 'welcome',
      journeyId: 'onboarding',
      label: 'Welcome Screen',
      type: 'ui',
      description: 'Brand introduction with animated logo, headline, and sign-up/login CTAs.',
      preview:
        'Full-screen gradient background, large Pulse logo centred, bold "Your AI Coach Awaits" headline, "Get Started" primary button, "I already have an account" link below.',
      position: { x: 0, y: 0 },
      mockHtml: WELCOME_HTML,
    },
    {
      id: 'create-account',
      journeyId: 'onboarding',
      label: 'Create Account',
      type: 'auth',
      description: 'Email/password registration with Apple and Google sign-in options.',
      preview:
        'Clean form with name, email, password fields. Divider "or continue with". Apple and Google social buttons. "Already have an account? Log in" footer link.',
      position: { x: 280, y: 0 },
      mockHtml: CREATE_ACCOUNT_HTML,
    },
    {
      id: 'fitness-assessment',
      journeyId: 'onboarding',
      label: 'Fitness Assessment',
      type: 'ui',
      description:
        'Multi-step questionnaire capturing fitness level, available equipment, and schedule.',
      preview:
        'Progress bar at top (Step 2 of 4). Large question "What\'s your current fitness level?" with illustrated option cards: Beginner, Intermediate, Advanced, Athlete. Back and Continue buttons.',
      position: { x: 560, y: 0 },
      mockHtml: FITNESS_ASSESSMENT_HTML,
    },
    {
      id: 'goal-beginner',
      journeyId: 'onboarding',
      label: 'Plan: Beginner',
      type: 'ai',
      description: 'Claude generates a Foundation Builder plan — 3 days/week, 30–40 min, 8-week program focused on form and habit.',
      preview: 'Full-body split Mon/Wed/Fri. Milestones: first workout, 7-day streak, bodyweight squat mastered. AI reasoning shown.',
      position: { x: 420, y: 220 },
      mockHtml: GOAL_BEGINNER_HTML,
      branchOf: 'fitness-assessment',
      promptTemplate: `You are Pulse AI. A user completed onboarding.
User profile:
- Fitness level: Beginner
- Goal: Build consistent habit & learn fundamentals
- Available days: {{availableDays}} / week
- Equipment: {{equipment}}

Design a personalised 8-week Foundation Builder program.
Return JSON: { planName, weeklySchedule[], milestones[], aiReasoning }`,
    },
    {
      id: 'goal-beginner-foundation',
      journeyId: 'onboarding',
      label: 'Foundation Ramp',
      type: 'ui',
      description: 'Introduces the first two training phases so the beginner plan ramps skill and consistency gradually.',
      preview: 'A clear 8-week roadmap card showing movement-pattern foundations, habit targets, and a low-friction starting volume.',
      position: { x: 0, y: 0 },
      parentMomentId: 'goal-beginner',
    },
    {
      id: 'goal-beginner-schedule',
      journeyId: 'onboarding',
      label: 'Weekly Habit Builder',
      type: 'data',
      description: 'Translates the beginner plan into an easy 3-day weekly schedule with recovery spacing.',
      preview: 'Simple weekly cadence cards for Monday, Wednesday, Friday sessions with rest-day callouts and habit checkpoints.',
      position: { x: 280, y: 0 },
      parentMomentId: 'goal-beginner',
    },
    {
      id: 'goal-beginner-summary',
      journeyId: 'onboarding',
      label: 'Beginner Plan Summary',
      type: 'ui',
      description: 'Wraps the beginner plan into a final summary before entering the workout dashboard.',
      preview: 'Final recap with 8-week focus, weekly cadence, first session recommendation, and a start-plan CTA.',
      position: { x: 560, y: 0 },
      parentMomentId: 'goal-beginner',
    },
    {
      id: 'goal-intermediate',
      journeyId: 'onboarding',
      label: 'Plan: Intermediate',
      type: 'ai',
      description: 'Claude generates a Strength & Conditioning plan — 4 days/week upper/lower split, 12-week progressive overload.',
      preview: 'Upper/lower 4-day split. Milestones: first 1RM recorded, +10% squat, bodyweight bench. AI reasoning shown.',
      position: { x: 700, y: 220 },
      mockHtml: GOAL_INTERMEDIATE_HTML,
      branchOf: 'fitness-assessment',
      promptTemplate: `You are Pulse AI. A user completed onboarding.
User profile:
- Fitness level: Intermediate
- Goal: Build strength & muscle with progressive overload
- Available days: {{availableDays}} / week
- Equipment: {{equipment}}

Design a personalised 12-week Strength & Conditioning program.
Return JSON: { planName, weeklySchedule[], milestones[], aiReasoning }`,
    },
    {
      id: 'goal-intermediate-split',
      journeyId: 'onboarding',
      label: 'Upper / Lower Split',
      type: 'ui',
      description: 'Breaks the intermediate plan into a balanced 4-day upper/lower schedule with clear weekly rhythm.',
      preview: 'Four-day split cards with upper/lower emphasis, recovery spacing, and a progression note for the week.',
      position: { x: 0, y: 0 },
      parentMomentId: 'goal-intermediate',
    },
    {
      id: 'goal-intermediate-progression',
      journeyId: 'onboarding',
      label: 'Progression Rules',
      type: 'ai',
      description: 'Explains how progressive overload, rep targets, and deload pacing are applied to the plan.',
      preview: 'Progression framework cards showing volume targets, load increases, and when to deload.',
      position: { x: 280, y: 0 },
      parentMomentId: 'goal-intermediate',
      promptTemplate: `You are Pulse AI. Turn an intermediate strength goal into clear weekly progression rules.
Return JSON: { split, progressionRules[], deloadLogic, whyItWorks }`,
    },
    {
      id: 'goal-intermediate-summary',
      journeyId: 'onboarding',
      label: 'Intermediate Plan Summary',
      type: 'ui',
      description: 'Final intermediate plan recap with weekly schedule, overload guidance, and first session recommendation.',
      preview: 'Plan summary screen with upper/lower cadence, overload rules, checkpoints, and a start-plan CTA.',
      position: { x: 560, y: 0 },
      parentMomentId: 'goal-intermediate',
    },
    {
      id: 'goal-advanced',
      journeyId: 'onboarding',
      label: 'Plan: Advanced',
      type: 'ai',
      description: 'Claude generates a Power & Hypertrophy plan — 5-day PPL with undulating periodisation, 16 weeks.',
      preview: 'Push/Pull/Legs 5-day split. Milestones: deload week, 2× BW deadlift, peak week PR. AI reasoning shown.',
      position: { x: 980, y: 220 },
      mockHtml: GOAL_ADVANCED_HTML,
      branchOf: 'fitness-assessment',
      promptTemplate: `You are Pulse AI. A user completed onboarding.
User profile:
- Fitness level: Advanced
- Goal: Maximise power & hypertrophy with periodisation
- Available days: {{availableDays}} / week
- Equipment: {{equipment}}

      Design a 16-week Power & Hypertrophy program with undulating periodisation.
Return JSON: { planName, weeklySchedule[], milestones[], deloadWeeks[], aiReasoning }`,
    },
    {
      id: 'goal-advanced-split',
      journeyId: 'onboarding',
      label: 'Advanced Split Builder',
      type: 'ui',
      description: 'Defines the weekly Push/Pull/Legs split and how training days are distributed across the week.',
      preview: 'Weekly calendar builder with 5 training days, color-coded push/pull/legs cards, and a compact recovery balance summary.',
      position: { x: 0, y: 0 },
      parentMomentId: 'goal-advanced',
    },
    {
      id: 'goal-advanced-periodization',
      journeyId: 'onboarding',
      label: 'Periodization Blocks',
      type: 'ai',
      description: 'Breaks the program into accumulation, intensification, and peak blocks with planned deload timing.',
      preview: 'Three stacked mesocycle cards showing intensity, volume focus, and a clear deload week before the peak block.',
      position: { x: 280, y: 0 },
      parentMomentId: 'goal-advanced',
      promptTemplate: `You are Pulse AI. Convert an advanced hypertrophy goal into clear mesocycles.
Return JSON: { blockName, intensityFocus, volumeFocus, deloadTiming, whyItWorks }`,
    },
    {
      id: 'goal-advanced-recovery',
      journeyId: 'onboarding',
      label: 'Recovery Constraints',
      type: 'data',
      description: 'Captures recovery rules, weekly fatigue limits, and conditions that trigger a lighter training week.',
      preview: 'Recovery rule cards with sleep, fatigue, soreness, and performance triggers that adjust the plan cadence.',
      position: { x: 560, y: 0 },
      parentMomentId: 'goal-advanced',
    },
    {
      id: 'goal-advanced-summary',
      journeyId: 'onboarding',
      label: 'Advanced Plan Summary',
      type: 'ui',
      description: 'Summarizes the full advanced plan, expected weekly cadence, and the first session recommendation.',
      preview: 'A final recap screen with split overview, mesocycle timeline, recovery notes, and a start-plan CTA.',
      position: { x: 840, y: 0 },
      parentMomentId: 'goal-advanced',
    },
    {
      id: 'goal-athlete',
      journeyId: 'onboarding',
      label: 'Plan: Athlete',
      type: 'ai',
      description: 'Claude generates an Elite Performance plan — 6-day competition-grade program, 20 weeks with mesocycles.',
      preview: '6-day max strength + speed + conditioning. Milestones: baseline test, competition sim, peak performance test.',
      position: { x: 1260, y: 220 },
      mockHtml: GOAL_ATHLETE_HTML,
      branchOf: 'fitness-assessment',
      promptTemplate: `You are Pulse AI. A user completed onboarding.
User profile:
- Fitness level: Athlete
- Goal: Elite performance with mesocycle periodisation
- Available days: {{availableDays}} / week
- Equipment: Full gym + competition access

Design a 20-week Elite Performance program with structured mesocycles.
Return JSON: { planName, mesocycles[], weeklySchedule[], milestones[], competitionSims[], aiReasoning }`,
    },
    {
      id: 'goal-athlete-mesocycles',
      journeyId: 'onboarding',
      label: 'Performance Mesocycles',
      type: 'ai',
      description: 'Maps the athlete program into mesocycles for strength, speed, and competition readiness.',
      preview: 'Mesocycle cards for strength, speed, taper, and competition simulation blocks across a 20-week runway.',
      position: { x: 0, y: 0 },
      parentMomentId: 'goal-athlete',
      promptTemplate: `You are Pulse AI. Turn an elite athlete goal into clear mesocycles.
Return JSON: { mesocycles[], priorityShifts[], readinessChecks[] }`,
    },
    {
      id: 'goal-athlete-performance',
      journeyId: 'onboarding',
      label: 'Performance Constraints',
      type: 'data',
      description: 'Captures performance testing, recovery windows, and competition simulation checkpoints.',
      preview: 'Performance checkpoint cards for sprint, power, and readiness testing with competition sim milestones.',
      position: { x: 280, y: 0 },
      parentMomentId: 'goal-athlete',
    },
    {
      id: 'goal-athlete-summary',
      journeyId: 'onboarding',
      label: 'Athlete Plan Summary',
      type: 'ui',
      description: 'Summarizes the elite performance plan before handing off to the day-to-day workout dashboard.',
      preview: 'Final athlete plan overview with mesocycle timeline, comp sim checkpoints, and a launch-plan CTA.',
      position: { x: 560, y: 0 },
      parentMomentId: 'goal-athlete',
    },

    // Daily Workout — y: 320
    {
      id: 'workout-home',
      journeyId: 'daily-workout',
      label: 'Workout Dashboard',
      type: 'ui',
      description:
        'Home screen showing today\'s workout, streak counter, and quick stats.',
      preview:
        'Greeting header "Good morning, Alex 💪", streak badge "14 days", today\'s plan card with workout name and estimated duration, "Start Workout" prominent button, recent activity list below.',
      position: { x: 0, y: 480 },
      mockHtml: WORKOUT_HOME_HTML,
    },
    {
      id: 'ai-workout',
      journeyId: 'daily-workout',
      label: 'AI Workout Generator',
      type: 'ai',
      description:
        'Generates a dynamic workout adapted to today\'s energy level, recovery status, and equipment.',
      preview:
        'Card asking "How are you feeling today?" with energy slider (1–5). Below: AI-generated workout card showing exercise count, muscle groups targeted, estimated calories. "Looks good, let\'s go" and "Regenerate" buttons.',
      position: { x: 280, y: 480 },
      mockHtml: AI_WORKOUT_HTML,
      promptTemplate: `You are Pulse AI. Generate today's adapted workout.
User state:
- Energy level: {{energyLevel}} / 5
- Recovery score: {{recoveryScore}}%
- Scheduled: {{planDay}} — {{muscleGroups}}
- Equipment available: {{equipment}}

Adapt the session to the user's current energy. If energy < 3, reduce
volume by 20% and swap heavy compounds for moderate accessories.
Return JSON: { exercises[], sets, reps, estimatedDuration, estimatedCalories, adaptationNote }`,
    },
    {
      id: 'exercise-player',
      journeyId: 'daily-workout',
      label: 'Exercise Player',
      type: 'ui',
      description: 'Guided exercise view with video placeholder, rep/set counter, and rest timer.',
      preview:
        'Large exercise illustration/video area, exercise name "Bulgarian Split Squat" in large type, set counter "Set 2 of 4", rep target "12 reps", animated countdown rest timer, "Done" and "Skip" buttons, progress bar at bottom.',
      position: { x: 560, y: 480 },
      mockHtml: EXERCISE_PLAYER_HTML,
    },
    {
      id: 'workout-log',
      journeyId: 'daily-workout',
      label: 'Completion & Log',
      type: 'data',
      description:
        'Post-workout summary showing performance, calories burned, and personal records.',
      preview:
        'Celebration animation at top, "Workout Complete! 🎉" headline, stat row: 42 min · 387 kcal · 5 exercises, personal record badge "New PR: Deadlift", weekly progress ring, "Share" and "Done" buttons.',
      position: { x: 840, y: 480 },
      mockHtml: WORKOUT_LOG_HTML,
    },

    // Completion & Log branches
    {
      id: 'log-pr',
      journeyId: 'daily-workout',
      label: 'New PR Logged',
      type: 'data',
      description: 'When a personal record is detected, a celebration screen shows the old vs new PR with delta and share options.',
      preview: 'Dark celebration screen with trophy animation, lift name, previous vs new weight comparison, +% improvement, share PR button.',
      position: { x: 700, y: 640 },
      mockHtml: LOG_PR_HTML,
      branchOf: 'workout-log',
    },
    {
      id: 'share-workout',
      journeyId: 'daily-workout',
      label: 'Share Achievement',
      type: 'ui',
      description: 'Share a pre-formatted workout summary card to Instagram, Twitter, WhatsApp, or copy a link.',
      preview: 'Dark branded share card with stats (calories, exercises, streak, volume), PR badge, social platform options grid.',
      position: { x: 980, y: 640 },
      mockHtml: SHARE_WORKOUT_HTML,
      branchOf: 'workout-log',
    },
    {
      id: 'ai-debrief',
      journeyId: 'daily-workout',
      label: 'AI Debrief',
      type: 'ai',
      description: 'Claude analyses the completed session and surfaces insights: volume spikes, plateau breaks, rest period flags, and next session prep.',
      preview: 'Coach banner with AI avatar, 3 insight cards (recovery alert, strength gain, form tip), next session recommendation with exercise chips.',
      position: { x: 1260, y: 640 },
      mockHtml: AI_DEBRIEF_HTML,
      branchOf: 'workout-log',
      promptTemplate: `You are Pulse AI Coach. Analyse the completed session.
Session data:
- Duration: {{duration}} min
- Exercises: {{exercises}}
- Total volume: {{totalVolume}} kg
- PRs set: {{prs}}
- Avg rest period: {{avgRest}}s

Surface 2–3 specific coaching insights. Flag recovery risks if volume
spiked >25% vs prior week. Recommend next session adjustments.
Return JSON: { insights[{ title, body, severity }], recoveryRating, nextSessionTip }`,
    },

    // Progress — y: 640
    {
      id: 'progress-dashboard',
      journeyId: 'progress',
      label: 'Progress Dashboard',
      type: 'ui',
      description:
        'Personal analytics overview: body metrics, workout frequency, and strength trends.',
      preview:
        'Body weight chart (past 30 days, line graph), metric cards: Workouts This Month (18), Total Volume (24,500 kg), Avg Session (41 min). Muscle group heatmap diagram. Navigation tabs: Overview · Strength · Body.',
      position: { x: 0, y: 800 },
      mockHtml: PROGRESS_DASHBOARD_HTML,
    },
    {
      id: 'analytics',
      journeyId: 'progress',
      label: 'Strength Analytics',
      type: 'data',
      description: 'Detailed lift progression charts with volume, 1RM estimates, and milestones.',
      preview:
        'Lift selector (Squat / Bench / Deadlift / OHP) as pill tabs. Line chart showing 1RM estimate over 12 weeks. Milestone markers on chart. Below: personal records table with dates and weights. Export CSV button.',
      position: { x: 280, y: 800 },
      mockHtml: ANALYTICS_HTML,
    },
    {
      id: 'ai-insights',
      journeyId: 'progress',
      label: 'AI Coaching Insights',
      type: 'ai',
      description:
        'Claude analyses training history and surfaces actionable coaching insights and recovery recommendations.',
      preview:
        'Weekly insight card with coach avatar: "Your squat volume increased 23% — consider a deload next week." Three insight cards below: Recovery Alert, Strength Plateau Detected, Nutrition Gap. Each tappable for detail.',
      position: { x: 560, y: 800 },
      mockHtml: AI_INSIGHTS_HTML,
      promptTemplate: `You are Pulse AI Coach. Review 30 days of training.
Training summary:
- Total sessions: {{sessionCount}}
- Total volume: {{totalVolume}} kg
- Muscle group distribution: {{muscleGroups}}
- Avg session quality score: {{avgQuality}} / 10
- Avg sleep: {{sleepAvg}}h / night

Identify patterns, flag plateau risk, and surface 3 actionable insights.
Return JSON: { weeklyInsight, alertCards[{ title, body, type }], recommendations[] }`,
    },

    // Nutrition — y: 960
    {
      id: 'nutrition-log',
      journeyId: 'nutrition',
      label: 'Nutrition Dashboard',
      type: 'ui',
      description: 'Daily calorie and macro tracker with meal timeline and progress rings.',
      preview:
        'Top: calorie ring (1,840 / 2,400 kcal). Three macro rings: Protein 142g, Carbs 186g, Fat 58g. Meal timeline: Breakfast · Lunch · Dinner · Snacks with logged items. "+ Log Food" sticky button at bottom.',
      position: { x: 0, y: 1120 },
      mockHtml: NUTRITION_LOG_HTML,
    },
    {
      id: 'ai-meals',
      journeyId: 'nutrition',
      label: 'AI Meal Suggestions',
      type: 'ai',
      description:
        'Claude recommends meals based on remaining macros, dietary preferences, and what\'s in the fridge.',
      preview:
        'Header: "You need 58g more protein today." Three AI-suggested meal cards with photo placeholder, name, macro breakdown chips, and prep time. "Add to Plan" button on each. Dietary filter pills at top: All · High Protein · Low Carb · Vegan.',
      position: { x: 280, y: 1120 },
      mockHtml: AI_MEALS_HTML,
      promptTemplate: `You are Pulse Nutrition AI. Recommend meals for the rest of today.
User state:
- Remaining calories: {{caloriesLeft}} kcal
- Remaining macros: {{proteinLeft}}g protein · {{carbsLeft}}g carbs · {{fatLeft}}g fat
- Dietary preferences: {{preferences}}
- Time of day: {{mealType}}

Suggest exactly 3 meals that fit the remaining macros. Prioritise whole foods.
Return JSON: { meals[{ name, calories, protein, carbs, fat, prepTime, ingredients[] }] }`,
    },
    {
      id: 'recipe-detail',
      journeyId: 'nutrition',
      label: 'Recipe Detail',
      type: 'ui',
      description: 'Full recipe view with ingredients, instructions, and macro breakdown.',
      preview:
        'Hero food image, recipe name "Grilled Salmon & Quinoa Bowl", macro badge row: 520 kcal · 48g protein · 42g carbs · 14g fat. Tabbed sections: Ingredients · Instructions. Sticky "Log This Meal" button at bottom.',
      position: { x: 560, y: 1120 },
      mockHtml: RECIPE_DETAIL_HTML,
    },
    {
      id: 'log-meal',
      journeyId: 'nutrition',
      label: 'Log Meal',
      type: 'data',
      description: 'Confirm meal portions and commit to daily nutrition log.',
      preview:
        'Meal confirmation screen: food item with portion size stepper (0.5x · 1x · 1.5x · 2x), live macro update as portion changes, meal category picker (Breakfast/Lunch/Dinner/Snack), time logged automatically, "Save to Log" button.',
      position: { x: 840, y: 1120 },
      mockHtml: LOG_MEAL_HTML,
    },
  ],
  edges: [
    // Onboarding
    { id: 'e1', source: 'welcome', target: 'create-account' },
    { id: 'e2', source: 'create-account', target: 'fitness-assessment' },
    { id: 'e3a', source: 'fitness-assessment', target: 'goal-beginner', label: 'Beginner' },
    { id: 'e3b', source: 'fitness-assessment', target: 'goal-intermediate', label: 'Intermediate' },
    { id: 'e3c', source: 'fitness-assessment', target: 'goal-advanced', label: 'Advanced' },
    { id: 'e3d', source: 'fitness-assessment', target: 'goal-athlete', label: 'Athlete' },
    { id: 'e4a', source: 'goal-beginner', target: 'workout-home', label: 'Plan ready' },
    { id: 'e4b', source: 'goal-intermediate', target: 'workout-home', label: 'Plan ready' },
    { id: 'e4c', source: 'goal-advanced', target: 'workout-home', label: 'Plan ready' },
    { id: 'e4d', source: 'goal-athlete', target: 'workout-home', label: 'Plan ready' },
    { id: 'e4a-1', source: 'goal-beginner-foundation', target: 'goal-beginner-schedule', label: 'Set weekly cadence' },
    { id: 'e4a-2', source: 'goal-beginner-schedule', target: 'goal-beginner-summary', label: 'Review beginner plan' },
    { id: 'e4a-3', source: 'goal-beginner-summary', target: 'workout-home', label: 'Start beginner plan' },
    { id: 'e4b-1', source: 'goal-intermediate-split', target: 'goal-intermediate-progression', label: 'Define progression' },
    { id: 'e4b-2', source: 'goal-intermediate-progression', target: 'goal-intermediate-summary', label: 'Review intermediate plan' },
    { id: 'e4b-3', source: 'goal-intermediate-summary', target: 'workout-home', label: 'Start intermediate plan' },
    { id: 'e4c-1', source: 'goal-advanced-split', target: 'goal-advanced-periodization', label: 'Define blocks' },
    { id: 'e4c-2', source: 'goal-advanced-periodization', target: 'goal-advanced-recovery', label: 'Set recovery rules' },
    { id: 'e4c-3', source: 'goal-advanced-recovery', target: 'goal-advanced-summary', label: 'Review full plan' },
    { id: 'e4c-4', source: 'goal-advanced-summary', target: 'workout-home', label: 'Start advanced plan' },
    { id: 'e4d-1', source: 'goal-athlete-mesocycles', target: 'goal-athlete-performance', label: 'Set checkpoints' },
    { id: 'e4d-2', source: 'goal-athlete-performance', target: 'goal-athlete-summary', label: 'Review athlete plan' },
    { id: 'e4d-3', source: 'goal-athlete-summary', target: 'workout-home', label: 'Start athlete plan' },

    // Workout
    { id: 'e5', source: 'workout-home', target: 'ai-workout', label: 'Start' },
    { id: 'e6', source: 'ai-workout', target: 'exercise-player', label: 'Begin' },
    { id: 'e7', source: 'exercise-player', target: 'workout-log', label: 'Finish' },
    { id: 'e8', source: 'workout-log', target: 'progress-dashboard', label: 'View progress' },
    { id: 'e8a', source: 'workout-log', target: 'log-pr', label: 'PR detected' },
    { id: 'e8b', source: 'workout-log', target: 'share-workout', label: 'Share' },
    { id: 'e8c', source: 'workout-log', target: 'ai-debrief', label: 'Get debrief' },

    // Progress
    { id: 'e9', source: 'progress-dashboard', target: 'analytics' },
    { id: 'e10', source: 'analytics', target: 'ai-insights', label: 'Get insights' },

    // Nutrition
    { id: 'e11', source: 'workout-home', target: 'nutrition-log', label: 'Track nutrition' },
    { id: 'e12', source: 'nutrition-log', target: 'ai-meals', label: 'Get suggestions' },
    { id: 'e13', source: 'ai-meals', target: 'recipe-detail' },
    { id: 'e14', source: 'recipe-detail', target: 'log-meal' },
    { id: 'e15', source: 'log-meal', target: 'nutrition-log', label: 'Back to log' },
  ],
};

export const DEMO_MAP: AppMap = withPulseRuntime(BASE_DEMO_MAP);
