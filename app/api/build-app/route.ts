import { NextRequest } from 'next/server';
import { requireBuildCredits } from '@/lib/build-access-server';
import { CREDIT_BUILD_PER_SCREEN } from '@/lib/credit-costs';
import Anthropic from '@anthropic-ai/sdk';
import { AppMap, Moment } from '@/lib/types';
import { transpileComponent } from '@/lib/transpile';
import { likelyContainsJsx } from '@/lib/generatedComponentGuard';
import {
  MODEL_BUILD_APP,
  MAX_TOKENS_BUILD_APP,
  TruncationError,
  extractCodeOrThrowOnTruncation,
} from '@/lib/ai-config';
import {
  emptyUsage,
  mergeMessageUsage,
  type TokenUsage,
  addUsage,
} from '@/lib/anthropic-usage';
import { logUsageEvent } from '@/lib/usage-events';
import {
  formatUpstreamStateBindingInstructions,
  getUpstreamWrittenStateKeys,
} from '@/lib/upstream-state-keys';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const FORBIDDEN_PATTERNS = /lorem|placeholder|tbd|coming soon|user name|item title/i;

const COMPONENT_SYSTEM_PROMPT = `You are generating a single screen component for a mobile/web app. Your output must look like a SHIPPED, POLISHED product — think Lovable or Linear quality, not a wireframe or prototype.

Stack: React + Tailwind CSS + shadcn-style UI components available on window.UI.

═══ COMPONENT INTERFACE ═══
The component receives these props:
- state: object — the current app-wide state shared across all screens
- onNavigate: (momentId: string) => void — call this to move to another screen
- onStateChange: (key: string, value: any) => void — call this to update app state
- onRuntimeAction: (action: object) => Promise<object> — call this ONLY for backend persistence/load actions

Write the component as:
window.__SCREEN_COMPONENT__ = function ScreenComponent({ state, onNavigate, onStateChange, onRuntimeAction }) {
  const React = window.React;
  const { Button, Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter, Input, Badge, Avatar, AvatarFallback, Separator, Tabs, TabsList, TabsTrigger, TabsContent, Sheet, SheetContent, SheetHeader, SheetTitle, Dialog, DialogContent, DialogHeader, DialogTitle, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Label, Switch, Textarea } = window.UI;
  // ... build UI ONLY with React.createElement — see rules below
};

═══ UI MUST BE React.createElement ONLY — NO JSX (MANDATORY) ═══
Babel repeatedly fails on malformed JSX (<div>, orphan text, broken fragments). Do NOT use any JSX: no <div>, no <Button>, no <> fragments.
- Use ONLY React.createElement (or a local alias: const el = React.createElement).
- DOM: React.createElement('div', { className: '...' }, ...children)
- UI kit: React.createElement(Button, { variant: 'default', onClick: () => onNavigate('moment-id'), className: '...' }, 'Label text')
- Lists: items.map((item) => React.createElement(Card, { key: item.id, className: '...' }, ...))
- Conditionals: cond ? React.createElement(...) : React.createElement(...)
- Fragment: React.createElement(React.Fragment, null, childA, childB)
- Text: pass strings as children: React.createElement('p', { className: 'text-sm text-zinc-400' }, 'Note (optional subtitle)')
- NEVER put a bare word on one line and '(' on the next — that was invalid JSX; use one createElement with a full string child instead.

═══ STYLING ═══
- Prefer className with Tailwind. Avoid large style={{ }} objects; at most one dynamic prop if needed.

═══ NAVIGATION — THIS IS CRITICAL ═══
- Every navigation button MUST call onNavigate('exact-moment-id') using the EXACT moment IDs provided in the user prompt under "NAVIGATION TARGETS".
- Do NOT invent moment IDs. Only use the IDs listed in the prompt.
- Back buttons should call onNavigate with the previous screen's exact ID.
- If a screen has no outgoing navigation targets, make the primary button show a success state or confirmation instead.

═══ STATE — READ AND WRITE ═══
- READ state: Access values via state.keyName. Display with string concat or template literals (no JSX).
- WRITE state: Call onStateChange('key', value) when the user fills a form, toggles a switch, or makes a selection.
- Never preselect user decisions. For choice fields (topic, category, goal, plan, audience, etc.), empty state must render as unselected.
- Do NOT auto-choose values on mount. Never call onStateChange inside useEffect/on first render to seed user-choice fields.
- For display-only analytics/history cards, you may show realistic sample data when state is empty.
- For interactive decision screens, do NOT use fallback values like state.topic || '...'; require the user to pick.
- Forms: Wire every input's onChange to call onStateChange with the field's key.

═══ BACKEND ACTIONS — REAL PERSISTENCE WHEN NEEDED ═══
If a user action saves, loads, submits, logs, or appends app data, call onRuntimeAction with an api-call action before navigating:
onRuntimeAction({ id: 'save-thing', label: 'Save', kind: 'api-call', operation: 'upsert_record', namespace: 'default', keyTemplate: 'thingKey', valueTemplate: state.thingValue, resultKey: 'thingValue', target: 'next-screen-id' }).then(() => onNavigate('next-screen-id')).catch(() => onStateChange('runtimeError', 'Could not save'));
Operations: upsert_record, append_record, read_record.
- upsert_record replaces one record.
- append_record appends to an array record.
- read_record loads one record into resultKey.
- Never call backend actions on first render; only in direct response to a user click/tap.

═══ UPSTREAM STATE (WHEN THE USER MESSAGE INCLUDES THE UPSTREAM BLOCK) ═══
If the user message contains "═══ UPSTREAM STATE — USER SET THESE ON PRIOR SCREENS ═══":
- Recap, profile, "your interests", summary pills, badges, or any UI that shows WHAT THE USER ALREADY CHOSE on earlier screens MUST read ONLY from state for the keys listed in that block. Never substitute unrelated demo labels (e.g. fake interest picks) for those keys.
- For string[] upstream keys, render from the array only; if empty, use a short empty-state — do not invent picks.
- The "seed sample data" rules below apply to lists/sections that do NOT purport to show those upstream user selections.

═══ DESIGN QUALITY — LOVABLE-LEVEL POLISH ═══
- Use a consistent color theme throughout. The user prompt specifies a primary color — use it for buttons, accents, badges, and active states. Use its lighter tints for backgrounds and borders.
- Every screen must have: a clear top section (eyebrow/status + heading), a content area, and a clear primary action at the bottom.
- Seed 3-5 realistic sample data items for any list or grid that is NOT an upstream recap of user picks (see UPSTREAM STATE above). Real names (Sarah Chen, Marcus Rivera), real dates (Mar 15, 2026), real amounts ($42.50), real descriptions.
- Add visual polish: subtle gradients on hero areas, rounded-2xl cards with shadow-sm, badge status indicators, avatar initials for people.
- Use proper spacing: px-5 or px-6 for page padding, gap-3 between cards, py-3 for section spacing.
- Buttons: primary action should be full-width at bottom with rounded-xl and shadow. Use active:scale-95 for press feedback.
- Status bar: Include a minimal 9:41 / battery indicator div at the very top for mobile screens.
- Empty states: For non-upstream lists, never show a bare empty list — seed sample data. For upstream-bound recap keys, prefer honest empty copy over fake picks.

═══ STRICT RULES ═══
- NEVER use placeholder text. Invent realistic, specific content matching the app domain.
- NEVER write "Lorem ipsum", "Coming soon", "TBD", "User Name", "Item Title", "Description here".
- Use window.UI components (same names as in the destructuring at the top of the component).
- Self-contained. No imports. No exports. React/useState/useEffect are on window.
- Do NOT use import or export statements. Assign to window.__SCREEN_COMPONENT__.
- On choice/branching screens, disable the primary CTA until the required selection/input is actually provided by the user.
- Return ONLY JavaScript code. No explanation. No markdown fences.`;

function deriveThemeColor(appDescription: string): string {
  const desc = appDescription.toLowerCase();
  if (/health|fitness|workout|walk|dog|park|nature|plant|garden/i.test(desc)) return 'emerald';
  if (/finance|bank|budget|expense|money|pay|invest|mortgage/i.test(desc)) return 'blue';
  if (/food|recipe|cook|restaurant|meal|delivery/i.test(desc)) return 'orange';
  if (/social|chat|message|community|friend/i.test(desc)) return 'violet';
  if (/music|art|creative|design|photo/i.test(desc)) return 'fuchsia';
  if (/learn|study|education|course|school/i.test(desc)) return 'sky';
  if (/shop|store|ecommerce|product|cart/i.test(desc)) return 'rose';
  if (/travel|trip|flight|hotel|book/i.test(desc)) return 'cyan';
  return 'indigo';
}

function buildUserPrompt(moment: Moment, appMap: AppMap): string {
  const journey = appMap.journeys.find((j) => j.id === moment.journeyId);
  const journeyMoments = appMap.moments.filter((m) => m.journeyId === moment.journeyId && !m.parentMomentId);
  const screenIndex = journeyMoments.findIndex((m) => m.id === moment.id);
  const prevScreen = screenIndex > 0 ? journeyMoments[screenIndex - 1] : null;
  const themeColor = deriveThemeColor(appMap.appDescription);

  // Build explicit navigation targets
  const outgoingEdges = appMap.edges.filter((e) => e.source === moment.id);
  const incomingEdges = appMap.edges.filter((e) => e.target === moment.id);

  const navTargets = outgoingEdges.map((e) => {
    const target = appMap.moments.find((m) => m.id === e.target);
    return `  Button "${e.label || 'Continue'}" → onNavigate('${e.target}')   // goes to "${target?.label ?? e.target}"`;
  }).join('\n');

  const backTargets = incomingEdges.map((e) => {
    const source = appMap.moments.find((m) => m.id === e.source);
    return `  Back button → onNavigate('${e.source}')   // returns to "${source?.label ?? e.source}"`;
  }).join('\n');

  // Full app screen list for context
  const allScreens = appMap.moments
    .filter((m) => !m.parentMomentId)
    .map((m) => `  ${m.id}: "${m.label}" (${m.type})`)
    .join('\n');

  // State with initial values
  const stateFields = (appMap.stateSchema ?? []).map((f) => {
    const initialVal = appMap.initialState?.[f.key];
    return `  state.${f.key}: ${f.type} = ${JSON.stringify(initialVal ?? f.defaultValue ?? '')}  // ${f.label}`;
  }).join('\n');

  const screenComponents = moment.screenSpec?.components?.map((c) => {
    const cc = c as Record<string, unknown>;
    return `  - ${c.type}${cc.label ? `: "${cc.label}"` : ''}${cc.title ? ` title="${cc.title}"` : ''}${cc.key ? ` (state key: ${cc.key})` : ''}`;
  }).join('\n') ?? '  (design freely based on description)';

  const screenActions = moment.screenSpec?.actions?.map((a) =>
    `  - "${a.label}" (${a.kind}${a.target ? ` → onNavigate('${a.target}')` : ''})`
  ).join('\n') ?? '  (use NAVIGATION TARGETS below)';

  const upstreamKeys = getUpstreamWrittenStateKeys(moment.id, appMap);
  const upstreamBlock =
    upstreamKeys.length > 0
      ? `\n${formatUpstreamStateBindingInstructions(upstreamKeys, appMap)}\n`
      : '';

  return `APP: ${appMap.appName} — ${appMap.appDescription}
PLATFORM: ${appMap.appPlatform ?? 'mobile'}
THEME COLOR: ${themeColor} (use ${themeColor}-500 for primary buttons/accents, ${themeColor}-50 for light backgrounds, ${themeColor}-100 for card highlights)

SCREEN TO BUILD:
- ID: ${moment.id}
- Label: ${moment.label}
- Description: ${moment.description}
- Type: ${moment.type}
- Journey: "${journey?.name ?? ''}" — screen ${screenIndex + 1} of ${journeyMoments.length}
${prevScreen ? `- Previous screen: "${prevScreen.label}" — maintain visual continuity from there` : '- This is the first screen in its journey'}
- Screen title: ${moment.screenSpec?.title ?? moment.label}
${moment.screenSpec?.subtitle ? `- Screen subtitle: ${moment.screenSpec.subtitle}` : ''}

Screen components (from app map — interpret and build beautiful UI for these):
${screenComponents}

Screen actions:
${screenActions}

═══ NAVIGATION TARGETS — use these EXACT IDs ═══
Forward navigation:
${navTargets || '  (no outgoing — this is a terminal screen, show success/confirmation)'}
Back navigation:
${backTargets || '  (no incoming — this is an entry point)'}

═══ STATE — read and write these keys ═══
${stateFields || '  (no state schema — use local React state only)'}
${upstreamBlock}
═══ ALL SCREENS IN APP (for context) ═══
${allScreens}

Build this screen now. Make it look like a shipped product — polished, with realistic content specific to "${appMap.appName}".`;
}

async function generateScreenComponent(
  moment: Moment,
  appMap: AppMap,
  repairHint: string | undefined,
  usage: TokenUsage
): Promise<string> {
  let userPrompt = buildUserPrompt(moment, appMap);
  if (repairHint) {
    userPrompt += `

═══ FIX REQUIRED ═══
The previous code failed JavaScript/JSX parsing (Babel) with this error:
${repairHint}

Output a COMPLETE corrected component using ONLY React.createElement (NO JSX tags like <div>). Keep the same screen intent and navigation IDs. Return ONLY code.`;
  }

  const message = await client.messages.create({
    model: MODEL_BUILD_APP,
    max_tokens: MAX_TOKENS_BUILD_APP,
    system: COMPONENT_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  });
  mergeMessageUsage(usage, message);

  let code = extractCodeOrThrowOnTruncation(message, `build-app:${moment.id}`);

  code = code
    .replace(/^```(?:javascript|jsx|js|tsx)?\n?/i, '')
    .replace(/\n?```$/, '')
    .trim();

  return code;
}

export async function POST(req: NextRequest) {
  try {
    const { appMap } = (await req.json()) as { appMap: AppMap };
    if (!appMap?.moments?.length) {
      return new Response(JSON.stringify({ error: 'Invalid appMap' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const topLevel = appMap.moments.filter((m) => !m.parentMomentId);
    const cost = topLevel.length * CREDIT_BUILD_PER_SCREEN;
    const denied = await requireBuildCredits(req, cost);
    if (denied) return denied;

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const moments = appMap.moments.filter((m) => !m.parentMomentId);

        const byMoment: Record<string, TokenUsage> = {};

        const promises = moments.map(async (moment) => {
          const usageForMoment = emptyUsage();
          try {
            let code = await generateScreenComponent(moment, appMap, undefined, usageForMoment);

            if (FORBIDDEN_PATTERNS.test(code)) {
              console.log(`[build-app] Retrying ${moment.id} — forbidden pattern detected`);
              code = await generateScreenComponent(moment, appMap, undefined, usageForMoment);
            }

            for (let jsxPass = 0; jsxPass < 2 && likelyContainsJsx(code); jsxPass++) {
              console.log(
                `[build-app] Retrying ${moment.id} — JSX detected (pass ${jsxPass + 1}); require createElement-only`
              );
              code = await generateScreenComponent(
                moment,
                appMap,
                'Your output contained JSX/HTML-like tags. Rewrite the ENTIRE component using ONLY React.createElement and React.Fragment — zero <div>, <Button>, or other angle-bracket tags.',
                usageForMoment
              );
            }

            let transpiled: string | undefined;
            for (let attempt = 0; attempt < 4; attempt++) {
              try {
                transpiled = transpileComponent(code);
                break;
              } catch (transpileErr) {
                if (transpileErr instanceof TruncationError) throw transpileErr;
                const msg =
                  transpileErr instanceof Error ? transpileErr.message : String(transpileErr);
                console.error(
                  `[build-app] Transpile failed for ${moment.id} (attempt ${attempt + 1}):`,
                  transpileErr
                );
                if (attempt === 3) throw transpileErr;
                const isTruncationLikely =
                  /unexpected (token|end|eof)/i.test(msg) || /missing[^]*after argument/i.test(msg);
                const hint = isTruncationLikely
                  ? `${msg}\n\nThis looks like TRUNCATED output — your code was cut off. Make the component SHORTER and SIMPLER: fewer nested elements, shorter demo strings, less repetition.`
                  : msg;
                console.error(`[build-app] Failing code sample:\n${code.slice(0, 800)}`);
                code = await generateScreenComponent(moment, appMap, hint, usageForMoment);
              }
            }
            if (!transpiled) throw new Error('Transpile produced no output');

            byMoment[moment.id] = { ...usageForMoment };

            const event = `data: ${JSON.stringify({
              momentId: moment.id,
              componentCode: transpiled,
              status: 'done',
              usage: { ...usageForMoment },
            })}\n\n`;
            controller.enqueue(encoder.encode(event));
          } catch (err) {
            console.error(`[build-app] Error generating ${moment.id}:`, err);
            byMoment[moment.id] = { ...usageForMoment };
            const event = `data: ${JSON.stringify({
              momentId: moment.id,
              componentCode: null,
              status: 'error',
              error: err instanceof Error ? err.message : 'Generation failed',
              usage: { ...usageForMoment },
            })}\n\n`;
            controller.enqueue(encoder.encode(event));
          }
        });

        await Promise.all(promises);

        let buildTotal = emptyUsage();
        for (const u of Object.values(byMoment)) {
          buildTotal = addUsage(buildTotal, u);
        }
        const summaryEvent = `data: ${JSON.stringify({
          status: 'usage',
          model: MODEL_BUILD_APP,
          source: 'build-app',
          total: buildTotal,
          byMoment,
        })}\n\n`;
        controller.enqueue(encoder.encode(summaryEvent));
        await logUsageEvent({
          eventType: 'build_app',
          route: '/api/build-app',
          model: MODEL_BUILD_APP,
          usage: buildTotal,
          metadata: {
            screens: moments.length,
            moments: moments.map((m) => m.id),
          },
        });
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (err) {
    console.error('[build-app] Error:', err);
    await logUsageEvent({
      eventType: 'build_app',
      status: 'error',
      route: '/api/build-app',
      model: MODEL_BUILD_APP,
      metadata: {
        message: err instanceof Error ? err.message : 'Unknown error',
      },
    });
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
