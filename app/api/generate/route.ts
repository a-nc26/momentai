import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { normalizeRuntimeAppMap } from '@/lib/runtime';
import type { AppMap } from '@/lib/types';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const THINKING_MAX_TOKENS = 16000;   // thinking budget + output
const THINKING_BUDGET = 8000;        // tokens Claude can use to reason
const COMPACT_GENERATE_MAX_TOKENS = 4096;

// ─── SSE helpers ────────────────────────────────────────────────────────────

function makeStream() {
  const encoder = new TextEncoder();
  const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
  const writer = writable.getWriter();

  const send = (payload: Record<string, unknown>) => {
    const line = `data: ${JSON.stringify(payload)}\n\n`;
    writer.write(encoder.encode(line));
  };

  const close = () => writer.close();

  const response = new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });

  return { send, close, response };
}

// ─── Route ──────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const { description, platform = 'mobile' } = await req.json();

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: 'Missing ANTHROPIC_API_KEY on the server.' }, { status: 500 });
  }

  if (!description?.trim()) {
    return Response.json({ error: 'Please enter a short app description first.' }, { status: 400 });
  }

  const { send, close, response } = makeStream();

  // Run async — don't await, let the stream flow
  (async () => {
    try {
      send({ type: 'status', message: 'Reading your description…' });

      const appMap = await generateWithStreaming(description.trim(), platform as 'mobile' | 'web', send);
      const normalized = normalizeRuntimeAppMap(appMap);

      send({ type: 'status', message: 'Done.' });
      send({ type: 'result', appMap: normalized });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Generation failed. Try a shorter prompt.';
      send({ type: 'error', message });
    } finally {
      close();
    }
  })();

  return response;
}

// ─── Generation with streaming ───────────────────────────────────────────────

async function generateWithStreaming(
  description: string,
  platform: 'mobile' | 'web',
  send: (p: Record<string, unknown>) => void,
): Promise<AppMap> {
  // Attempt 1 — extended thinking for highest quality output
  try {
    send({ type: 'status', message: 'Claude is thinking about your app…' });
    const text = await streamThinkingCall(buildPrimaryPrompt(description, platform), send);
    send({ type: 'status', message: 'Parsing app structure…' });
    const parsed = await parseGeneratedMap(text, send);
    const withPlatform = { ...parsed, appPlatform: platform } as AppMap;

    // Validation pass — fix edges, missing state keys, shallow screens
    const validated = await validateAndRepair(withPlatform, description, send);
    return validated;
  } catch (err) {
    console.error('Primary generation failed:', err);
    send({ type: 'status', message: 'Retrying with compact mode…' });
  }

  // Attempt 2 — compact fallback (no thinking, smaller output)
  try {
    const text = await streamBasicCall(buildCompactPrompt(description, platform), COMPACT_GENERATE_MAX_TOKENS, send);
    send({ type: 'status', message: 'Parsing compact structure…' });
    const parsed = await parseGeneratedMap(text, send);
    return { ...parsed, appPlatform: platform } as AppMap;
  } catch (err) {
    console.error('Compact generation failed:', err);
    send({ type: 'status', message: 'Using starter scaffold…' });
  }

  return buildStarterAppMap(description, platform);
}

// ─── Streaming: extended thinking (primary) ──────────────────────────────────

async function streamThinkingCall(
  prompt: string,
  send: (p: Record<string, unknown>) => void,
): Promise<string> {
  let accumulated = '';
  let lastReportedChunk = 0;

  const stream = client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: THINKING_MAX_TOKENS,
    thinking: { type: 'enabled', budget_tokens: THINKING_BUDGET },
    messages: [{ role: 'user', content: prompt }],
  } as Parameters<typeof client.messages.stream>[0]);

  for await (const event of stream) {
    if (event.type === 'content_block_start') {
      const block = (event as { content_block?: { type?: string } }).content_block;
      if (block?.type === 'thinking') {
        send({ type: 'status', message: 'Claude is reasoning about your app…' });
      } else if (block?.type === 'text') {
        send({ type: 'status', message: 'Writing app structure…' });
      }
    }

    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      accumulated += event.delta.text;
      if (accumulated.length - lastReportedChunk >= 200) {
        lastReportedChunk = accumulated.length;
        send({ type: 'progress', chars: accumulated.length });
      }
    }
  }

  send({ type: 'progress', chars: accumulated.length, done: true });
  return accumulated.trim();
}

// ─── Streaming: basic call (compact fallback) ────────────────────────────────

async function streamBasicCall(
  prompt: string,
  maxTokens: number,
  send: (p: Record<string, unknown>) => void,
): Promise<string> {
  let accumulated = '';
  let lastReportedChunk = 0;

  const stream = client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: maxTokens,
    temperature: 0,
    messages: [{ role: 'user', content: prompt }],
  });

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      accumulated += event.delta.text;
      if (accumulated.length - lastReportedChunk >= 200) {
        lastReportedChunk = accumulated.length;
        send({ type: 'progress', chars: accumulated.length });
      }
    }
  }

  send({ type: 'progress', chars: accumulated.length, done: true });
  return accumulated.trim();
}

// ─── Validation pass ─────────────────────────────────────────────────────────

async function validateAndRepair(
  appMap: AppMap,
  description: string,
  send: (p: Record<string, unknown>) => void,
): Promise<AppMap> {
  send({ type: 'status', message: 'Validating structure…' });

  try {
    const msg = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      temperature: 0,
      messages: [{ role: 'user', content: buildValidationPrompt(appMap, description) }],
    });

    const text = msg.content
      .filter((b) => b.type === 'text')
      .map((b) => ('text' in b ? b.text : ''))
      .join('')
      .trim();

    const stripped = text.replace(/^```(?:json)?\s*/m, '').replace(/\s*```\s*$/m, '').trim();
    const fixes = JSON.parse(stripped);

    if (!fixes || Object.keys(fixes).length === 0) return appMap;

    send({ type: 'status', message: 'Applying fixes…' });
    return mergeValidationFixes(appMap, fixes);
  } catch {
    // Validation failed — return original, don't block
    return appMap;
  }
}

function mergeValidationFixes(
  appMap: AppMap,
  fixes: {
    momentUpdates?: { id: string; promptTemplate?: string; screenSpec?: unknown }[];
    newEdges?: { id: string; source: string; target: string; label?: string }[];
    newStateSchemaItems?: import('@/lib/types').RuntimeStateField[];
  },
): AppMap {
  let { moments, edges, stateSchema } = appMap;

  if (fixes.momentUpdates?.length) {
    moments = moments.map((m) => {
      const fix = fixes.momentUpdates!.find((f) => f.id === m.id);
      if (!fix) return m;
      return {
        ...m,
        ...(fix.promptTemplate ? { promptTemplate: fix.promptTemplate } : {}),
        ...(fix.screenSpec ? { screenSpec: fix.screenSpec as typeof m.screenSpec } : {}),
      };
    });
  }

  if (fixes.newEdges?.length) {
    const existingIds = new Set(edges.map((e) => e.id));
    const toAdd = fixes.newEdges.filter((e) => !existingIds.has(e.id));
    edges = [...edges, ...toAdd];
  }

  if (fixes.newStateSchemaItems?.length) {
    const existingKeys = new Set((stateSchema ?? []).map((s) => s.key));
    const toAdd = fixes.newStateSchemaItems.filter((s) => !existingKeys.has(s.key));
    stateSchema = [...(stateSchema ?? []), ...toAdd];
  }

  return { ...appMap, moments, edges, stateSchema };
}

// ─── Parse + repair ──────────────────────────────────────────────────────────

async function parseGeneratedMap(
  text: string,
  send: (p: Record<string, unknown>) => void,
): Promise<AppMap> {
  const direct = tryParseJson(text);
  if (direct) return direct;

  send({ type: 'status', message: 'Repairing JSON structure…' });
  const repaired = await repairJson(text);
  const fixed = tryParseJson(repaired);
  if (fixed) return fixed;

  throw new Error('Generation returned invalid structured data. Try a shorter, more focused description.');
}

function tryParseJson(text: string): AppMap | null {
  const stripped = text.replace(/^```(?:json)?\s*/m, '').replace(/\s*```\s*$/m, '').trim();
  const first = stripped.indexOf('{');
  const last = stripped.lastIndexOf('}');
  const candidates = [stripped];
  if (first !== -1 && last > first) candidates.push(stripped.slice(first, last + 1));

  for (const c of [...new Set(candidates)]) {
    try { return JSON.parse(c); } catch { /* continue */ }
    try { return JSON.parse(c.replace(/,\s*([}\]])/g, '$1')); } catch { /* continue */ }
  }
  return null;
}

async function repairJson(text: string): Promise<string> {
  const msg = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    temperature: 0,
    messages: [{
      role: 'user',
      content: `Repair the following malformed JSON into valid JSON. Return ONLY the JSON, no explanation.\n\n${text}`,
    }],
  });
  return msg.content.filter((b) => b.type === 'text').map((b) => ('text' in b ? b.text : '')).join('').trim();
}

// ─── Prompts ─────────────────────────────────────────────────────────────────

function buildValidationPrompt(appMap: AppMap, description: string): string {
  const momentIds = new Set(appMap.moments?.map((m) => m.id) ?? []);
  const edgePairs = new Set(appMap.edges?.map((e) => `${e.source}->${e.target}`) ?? []);
  const stateKeys = new Set(appMap.stateSchema?.map((s) => s.key) ?? []);

  return `You are validating a generated AppMap for a visual app builder. Fix ONLY these specific issues:

1. screenSpec actions with a "target" that has no matching edge — add the missing edge
2. screenSpec components using a "key" field not in stateSchema — add the missing state item
3. AI moments (type "ai") with no promptTemplate — write one based on the moment description using {{stateKey}} references
4. screenSpec components that are just text dumps (a "hero" or "summary-card" whose body/subtitle is identical to moment.description) — replace with real interactive components
5. "ui" moments whose screenSpec has 0 or 1 components — add appropriate choice-cards, chip-group, or input components based on the moment's label and description (e.g. a "Goals" or "Preferences" screen needs choice-cards with real options)

Known moment IDs: ${JSON.stringify([...momentIds])}
Known state keys: ${JSON.stringify([...stateKeys])}
Existing edges: ${JSON.stringify([...edgePairs])}

App description: "${description}"

AppMap:
${JSON.stringify(appMap, null, 2)}

Return ONLY a JSON patch (return {} if nothing needs fixing):
{
  "momentUpdates": [
    { "id": "moment-id", "promptTemplate": "...", "screenSpec": { "title": "...", "components": [], "actions": [] } }
  ],
  "newEdges": [
    { "id": "edge-id", "source": "moment-id", "target": "moment-id", "label": "action label" }
  ],
  "newStateSchemaItems": [
    { "key": "stateKey", "label": "Human label", "type": "string", "defaultValue": "" }
  ]
}

Return ONLY valid JSON, no explanation.`;
}

function buildPrimaryPrompt(description: string, platform: 'mobile' | 'web' = 'mobile') {
  return `You are a system that analyzes app descriptions and generates structured Journey Maps for a visual app builder called Momentum.

App Description: "${description}"
Platform: ${platform}

Generate a Journey Map as a JSON object. Return ONLY valid JSON, no markdown code fences, no explanation.

The JSON must follow this exact structure:
{
  "appName": "Short app name",
  "appDescription": "One sentence description",
  "appPlatform": "${platform}",
  "runtimeVersion": 1,
  "stateSchema": [
    {
      "key": "profileName",
      "label": "Profile Name",
      "type": "string",
      "defaultValue": ""
    }
  ],
  "initialState": {
    "profileName": ""
  },
  "journeys": [
    {
      "id": "journey-id-lowercase-hyphenated",
      "name": "Journey Name",
      "description": "What this user flow accomplishes"
    }
  ],
  "moments": [
    {
      "id": "moment-id-lowercase-hyphenated",
      "journeyId": "journey-id",
      "label": "Short step name",
      "description": "What this step does (1-2 sentences)",
      "type": "ui",
      "preview": "Detailed description of what this screen or step looks like to the user",
      "promptTemplate": "ONLY for type=ai moments: describe the Claude prompt that would run here, e.g. 'You are a fitness coach. Given {{goal}} and {{fitnessLevel}}, generate a weekly workout plan.'",
      "branchOf": "OPTIONAL — parent moment ID when this is a conditional branch variant (see BRANCH NODES below)",
      "position": { "x": 0, "y": 0 },
      "screenSpec": {
        "eyebrow": "Optional short section label",
        "title": "Screen title",
        "subtitle": "Short supporting copy",
        "progress": { "current": 1, "total": 4 },
        "components": [
          {
            "id": "component-id",
            "type": "input",
            "key": "profileName",
            "label": "Full Name",
            "placeholder": "Alex Johnson"
          }
        ],
        "actions": [
          {
            "id": "primary-action",
            "label": "Continue",
            "kind": "navigate",
            "style": "primary",
            "target": "next-moment-id",
            "requiredKeys": ["profileName"]
          }
        ]
      }
    }
  ],
  "edges": [
    {
      "id": "edge-id",
      "source": "moment-id",
      "target": "moment-id",
      "label": "optional short transition label"
    }
  ]
}

Rules:
- Create 2-5 distinct journeys representing real user flows
- Each journey should have 3-6 moments
- Prefer the smallest complete map that still captures the main product loops
- Moment types: "ui" (screens/forms), "ai" (AI-powered steps), "data" (database/storage operations), "auth" (authentication steps)
- Every "ai" moment MUST include a "promptTemplate" (use {{stateKey}} references) AND a "responseKey" (the state key where the AI response is stored, e.g. "affordanceAdvice")
- appPlatform must be "mobile" and runtimeVersion must be 1
- Every moment MUST include a runnable screenSpec with REAL interactive components — never just description text
- Use ONLY these component types: "hero", "input", "choice-cards", "chip-group", "notice", "summary-card", "stats-grid", "list", "spacer"
- Use ONLY these action kinds: "navigate", "branch", "back", "compute"
- Use requiredKeys to block submit/continue until the needed fields are filled
- Use branch actions when navigation depends on a selected state key
- Use app-level stateSchema for any field a user can edit or any value later screens depend on
- Position nodes: each journey on its own horizontal row, spaced 320px apart vertically (y: 0, 320, 640, etc.)
- Within each journey, space moments 280px apart horizontally starting at x: 0
- Create edges connecting moments within each journey in sequence
- Add cross-journey edges where flows naturally intersect
- All IDs must be unique, lowercase, with hyphens only

BRANCH NODES — conditional paths that fork from a parent moment:
- When a moment has multiple possible outcomes (success/failure, different choices, conditional paths), create BRANCH NODES.
- A branch node is a moment with "branchOf": "parent-moment-id" — it represents one conditional outcome of the parent.
- Branch nodes are hidden by default on the canvas and expand when the parent is clicked, keeping the map clean.
- Every app MUST have at least 1-2 branch points. Real apps always have conditional flows.
- Example: A "Login" screen has two outcomes:
    { "id": "login-success", "branchOf": "login", "label": "Login Success", ... }
    { "id": "login-error", "branchOf": "login", "label": "Login Failed", ... }
  With edges: login → login-success → dashboard, login → login-error → login (retry)
- Example: A "Pick Plan" screen branches on the selected plan:
    { "id": "free-plan-setup", "branchOf": "pick-plan", "label": "Free Plan Setup", ... }
    { "id": "pro-plan-checkout", "branchOf": "pick-plan", "label": "Pro Checkout", ... }
- Position branch nodes 150px below their parent (same x, y + 150)
- Branch nodes belong to the same journeyId as their parent
- Create edges FROM the parent TO each branch node, AND from each branch node to its next destination
- Think about: What if the user cancels? What if validation fails? What if they choose option A vs B? These are branches.

CRITICAL — screenSpec must be real UI, not text descriptions:
- "ui" moments: MUST have at minimum 2-3 real interactive components (inputs, choice-cards, chip-groups). NEVER a screen with only a hero component and nothing else.
- "auth" moments: use input components for name/email/password with real stateSchema keys
- "data" moments that involve user entry (calculators, forms, search): use "input" components with the actual field names as keys (e.g. propertyPrice, interestRate, loanTerm). Add these to stateSchema.
- "data" moments that show results: use stats-grid with templated values like "{{monthlyPayment}}"
- "ai" moments: the runtime auto-calls Claude with the promptTemplate when the screen loads — show the result with notice (tone: "success") body: "{{responseKey}}"
- Selection screens (goals, preferences, categories, plan types): ALWAYS use "choice-cards" with real options derived from the app domain — never leave a selection screen with an empty components array
- EVERY screenSpec components array MUST have at least 2 items — a screen with 0 or 1 components is always wrong

COMPUTE ACTION — use for any deterministic math (calculators, projections, scores):
- On the input screen's submit button, use kind: "compute" instead of "navigate"
- formulas: a map of output state key → JS expression using input state keys as variable names
- The compute action evaluates the formulas, writes results to state, then navigates to the target screen
- Example for a mortgage calculator:
  actions: [{
    "id": "calculate",
    "label": "Calculate",
    "kind": "compute",
    "style": "primary",
    "target": "mortgage-results",
    "requiredKeys": ["propertyPrice", "downPayment", "interestRate", "loanTerm"],
    "formulas": {
      "loanAmount": "propertyPrice - downPayment",
      "monthlyPayment": "Math.round((loanAmount * (interestRate/100/12)) / (1 - Math.pow(1 + interestRate/100/12, -loanTerm*12)))",
      "totalCost": "monthlyPayment * loanTerm * 12"
    }
  }]
- The results screen then uses stats-grid: [{ label: "Monthly Payment", value: "\${{monthlyPayment}}" }, { label: "Loan Amount", value: "\${{loanAmount}}" }]
- ALWAYS add the computed output keys (loanAmount, monthlyPayment, etc.) to stateSchema with type "number" and defaultValue 0

AI MOMENT PATTERN — use for qualitative analysis, recommendations, personalization:
- Add promptTemplate: a Claude prompt using {{stateKey}} references, e.g. "You are a financial advisor. The user wants to buy a \${{propertyPrice}} home with \${{downPayment}} down. Their income is \${{annualIncome}}. Give concise affordability advice in 3 bullet points."
- Add responseKey: the state key that stores the response, e.g. "affordabilityAdvice"
- Add responseKey to stateSchema with type "string" and defaultValue ""
- The AI moment's screenSpec shows the response: notice { tone: "success", title: "AI Advice", body: "{{affordabilityAdvice}}" }
- Claude runs automatically when the user navigates to this screen

ACTIVITY TRACKING PATTERN — for apps that log repeated actions (walks, meals, workouts, expenses):
- Use a string[] state field (e.g. "recentWalks") to track logged items
- On the "Log Walk" form screen, the save action must use append-list effect:
    effects: [{ kind: "append-list", key: "recentWalks", item: "{{walkDuration}} min walk" }]
- The Dashboard screen must use stats-grid or list to SHOW that data:
    { id: "s1", type: "stats-grid", items: [{ label: "Walks Today", value: "{{recentWalks.length}}" }] }
- EVERY action that saves user data must include the relevant effects to update state
- ALL edges must match action targets exactly${platform === 'web' ? `

WEB PLATFORM SPECIFICS (appPlatform: "web"):
- Design for desktop/laptop screens — wider layouts, more data-dense screens
- Typical web app patterns: dashboard home, sidebar navigation, data tables, settings pages, modals
- screenSpec components: use stats-grid with 3-4 items per row for dashboards, wider summary-cards, multi-column layouts
- Hero components can have shorter titles and longer subtitles — users read more on desktop
- Prefer stats-grid + list combinations for dashboard screens over single-column stacks
- Forms can have more fields visible at once (2-column layouts are implied by wider space)
- Actions: web apps typically have an inline "Save" or "Submit" button, not a fixed bottom bar
- Navigation moments: include a "Dashboard" or "Home" as the hub, with spoke flows branching out
- Auth flows: standard email + password form, no phone-number or biometric patterns
- Avoid mobile-only patterns: no swipe gestures, no bottom sheets, no tab bars` : ''}`;
}

function buildCompactPrompt(description: string, platform: 'mobile' | 'web' = 'mobile') {
  return `You are generating a compact starter app graph for Momentum.

App Description: "${description}"

Return ONLY valid JSON:
{
  "appName": "Short app name",
  "appDescription": "One sentence description",
  "appPlatform": "${platform}",
  "journeys": [
    { "id": "journey-id", "name": "Journey Name", "description": "What this flow does" }
  ],
  "moments": [
    {
      "id": "moment-id",
      "journeyId": "journey-id",
      "label": "Moment Label",
      "description": "1-2 sentence explanation of the step",
      "type": "ui",
      "preview": "Describe what the user sees and can do on this step",
      "position": { "x": 0, "y": 0 }
    }
  ],
  "edges": [
    { "id": "edge-id", "source": "moment-id", "target": "moment-id", "label": "optional label" }
  ]
}

Rules:
- 2-4 journeys, 3-5 moments per journey
- Types: "ui", "ai", "data", "auth"
- No screenSpec, stateSchema, or initialState
- Position journeys on separate rows: y = 0, 320, 640, 960
- Position moments 280px apart within each journey
- All IDs unique, lowercase, hyphenated
- Return JSON only`;
}

// ─── Starter scaffold ────────────────────────────────────────────────────────

function buildStarterAppMap(description: string, platform: 'mobile' | 'web' = 'mobile'): AppMap {
  const appName = description
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/).filter(Boolean).slice(0, 4)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ') || 'Momentum App';

  const appDescription =
    description.split(/[.!?]/).map((p) => p.trim()).filter(Boolean)[0] ?? description.trim();

  return {
    appName,
    appDescription,
    appPlatform: platform,
    journeys: [
      { id: 'onboarding', name: 'Onboarding', description: 'Gets the user into the product.' },
      { id: 'core-loop', name: 'Core Loop', description: 'Primary experience.' },
    ],
    moments: [
      { id: 'welcome', journeyId: 'onboarding', label: 'Welcome', description: `Introduces ${appName}.`, type: 'ui', preview: 'Welcome screen with CTA.', position: { x: 0, y: 0 } },
      { id: 'create-account', journeyId: 'onboarding', label: 'Create Account', description: 'Captures profile details.', type: 'auth', preview: 'Sign-up form.', position: { x: 280, y: 0 } },
      { id: 'setup-preferences', journeyId: 'onboarding', label: 'Setup', description: 'Collects preferences.', type: 'ui', preview: 'Preference picker.', position: { x: 560, y: 0 } },
      { id: 'dashboard', journeyId: 'core-loop', label: 'Dashboard', description: 'Home screen.', type: 'ui', preview: 'Dashboard with summary cards.', position: { x: 0, y: 320 } },
      { id: 'primary-action', journeyId: 'core-loop', label: 'Primary Action', description: 'Main task.', type: 'ui', preview: 'Main task screen.', position: { x: 280, y: 320 } },
      { id: 'results', journeyId: 'core-loop', label: 'Results', description: 'Shows outcome.', type: 'data', preview: 'Results summary.', position: { x: 560, y: 320 } },
    ],
    edges: [
      { id: 'e1', source: 'welcome', target: 'create-account', label: 'Get Started' },
      { id: 'e2', source: 'create-account', target: 'setup-preferences', label: 'Continue' },
      { id: 'e3', source: 'setup-preferences', target: 'dashboard', label: 'Finish Setup' },
      { id: 'e4', source: 'dashboard', target: 'primary-action', label: 'Start' },
      { id: 'e5', source: 'primary-action', target: 'results', label: 'Complete' },
      { id: 'e6', source: 'results', target: 'dashboard', label: 'Back' },
    ],
  };
}
