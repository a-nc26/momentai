import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { AppMap, Moment } from '@/lib/types';
import { transpileComponent } from '@/lib/transpile';

const client = new Anthropic();

const FORBIDDEN_PATTERNS = /lorem|placeholder|tbd|coming soon|user name|item title/i;

const COMPONENT_SYSTEM_PROMPT = `You are generating a single screen component for a mobile/web app. Your output must look like a SHIPPED, POLISHED product — think Lovable or Linear quality, not a wireframe or prototype.

Stack: React + Tailwind CSS + shadcn-style UI components available on window.UI.

═══ COMPONENT INTERFACE ═══
The component receives these props:
- state: object — the current app-wide state shared across all screens
- onNavigate: (momentId: string) => void — call this to move to another screen
- onStateChange: (key: string, value: any) => void — call this to update app state

Write the component as:
window.__SCREEN_COMPONENT__ = function ScreenComponent({ state, onNavigate, onStateChange }) {
  // component body
};

═══ NAVIGATION — THIS IS CRITICAL ═══
- Every navigation button MUST call onNavigate('exact-moment-id') using the EXACT moment IDs provided in the user prompt under "NAVIGATION TARGETS".
- Do NOT invent moment IDs. Only use the IDs listed in the prompt.
- Back buttons should call onNavigate with the previous screen's exact ID.
- If a screen has no outgoing navigation targets, make the primary button show a success state or confirmation instead.

═══ STATE — READ AND WRITE ═══
- READ state: Access values via state.keyName. Display them in the UI (e.g., "Welcome, {state.userName}").
- WRITE state: Call onStateChange('key', value) when the user fills a form, toggles a switch, or makes a selection.
- When state values are empty/falsy, show realistic DEMO defaults using || (e.g., state.userName || 'Sarah Chen').
- Never show empty strings, $0, 0%, or "undefined" in the UI. Always fall back to realistic demo data.
- Forms: Wire every input's onChange to call onStateChange with the field's key.

═══ DESIGN QUALITY — LOVABLE-LEVEL POLISH ═══
- Use a consistent color theme throughout. The user prompt specifies a primary color — use it for buttons, accents, badges, and active states. Use its lighter tints for backgrounds and borders.
- Every screen must have: a clear top section (eyebrow/status + heading), a content area, and a clear primary action at the bottom.
- Seed 3-5 realistic sample data items for any list or grid. Real names (Sarah Chen, Marcus Rivera), real dates (Mar 15, 2026), real amounts ($42.50), real descriptions.
- Add visual polish: subtle gradients on hero areas, rounded-2xl cards with shadow-sm, badge status indicators, avatar initials for people.
- Use proper spacing: px-5 or px-6 for page padding, gap-3 between cards, py-3 for section spacing.
- Buttons: primary action should be full-width at bottom with rounded-xl and shadow. Use active:scale-95 for press feedback.
- Status bar: Include a minimal 9:41 / battery indicator div at the very top for mobile screens.
- Empty states: Never show an empty list. Always seed sample data.

═══ STRICT RULES ═══
- NEVER use placeholder text. Invent realistic, specific content matching the app domain.
- NEVER write "Lorem ipsum", "Coming soon", "TBD", "User Name", "Item Title", "Description here".
- Use window.UI components. Available: Button, Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter, Input, Badge, Avatar, AvatarFallback, Separator, Tabs, TabsList, TabsTrigger, TabsContent, Sheet, SheetContent, SheetHeader, SheetTitle, Dialog, DialogContent, DialogHeader, DialogTitle, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Label, Switch, Textarea.
- Access via: const { Button, Card, Input, Badge, ... } = window.UI;
- Self-contained. No imports. No exports. React/useState/useEffect are on window.
- Do NOT use import or export statements. Assign to window.__SCREEN_COMPONENT__.
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

═══ ALL SCREENS IN APP (for context) ═══
${allScreens}

Build this screen now. Make it look like a shipped product — polished, with realistic content specific to "${appMap.appName}".`;
}

async function generateScreenComponent(
  moment: Moment,
  appMap: AppMap
): Promise<string> {
  const userPrompt = buildUserPrompt(moment, appMap);

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: COMPONENT_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  });

  let code = (message.content[0] as { type: string; text: string }).text.trim();

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

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const moments = appMap.moments.filter((m) => !m.parentMomentId);

        const promises = moments.map(async (moment) => {
          try {
            let code = await generateScreenComponent(moment, appMap);

            if (FORBIDDEN_PATTERNS.test(code)) {
              console.log(`[build-app] Retrying ${moment.id} — forbidden pattern detected`);
              code = await generateScreenComponent(moment, appMap);
            }

            // Pre-transpile JSX → plain JS so the preview iframe never needs Babel
            try {
              code = transpileComponent(code);
            } catch (transpileErr) {
              console.warn(`[build-app] Transpile failed for ${moment.id}, sending raw JSX:`, transpileErr);
            }

            const event = `data: ${JSON.stringify({
              momentId: moment.id,
              componentCode: code,
              status: 'done',
            })}\n\n`;
            controller.enqueue(encoder.encode(event));
          } catch (err) {
            console.error(`[build-app] Error generating ${moment.id}:`, err);
            const event = `data: ${JSON.stringify({
              momentId: moment.id,
              componentCode: null,
              status: 'error',
              error: err instanceof Error ? err.message : 'Generation failed',
            })}\n\n`;
            controller.enqueue(encoder.encode(event));
          }
        });

        await Promise.all(promises);
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
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
