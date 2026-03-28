import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { AppMap, Moment } from '@/lib/types';

const client = new Anthropic();

const FORBIDDEN_PATTERNS = /lorem|placeholder|tbd|coming soon|user name|item title/i;

const COMPONENT_SYSTEM_PROMPT = `You are generating a single screen component for a mobile/web app.
Stack: React + Tailwind CSS + shadcn-style UI components available on window.UI.

STRICT RULES — violation of any of these is a failure:
- NEVER use placeholder text. Invent realistic, specific content.
- NEVER write "Lorem ipsum", "Coming soon", "TBD", "User Name", "Item Title", "Description here", or any placeholder equivalent.
- Every button must trigger a visible action — navigation, state change, or UI feedback.
- Every form must have real field labels, real placeholder examples, and real validation states.
- Use window.UI components throughout. Available: Button, Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter, Input, Badge, Avatar, AvatarFallback, Separator, Tabs, TabsList, TabsTrigger, TabsContent, Sheet, SheetContent, SheetHeader, SheetTitle, Dialog, DialogContent, DialogHeader, DialogTitle, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Label, Switch, Textarea.
- Access them via: const { Button, Card, Input, Badge, ... } = window.UI;
- Mobile-first layout using Tailwind flex, gap, and padding. No fixed pixel widths.
- Invent realistic data: real names, real prices, real dates, real copy. The screen must look like a shipped product, not a wireframe.
- The component must be self-contained. No imports. React is globally available (React, useState, useEffect, etc. are on window).
- Do NOT use import statements at all.
- Do NOT use export statements. Assign the component to window.__SCREEN_COMPONENT__ instead.

COMPONENT INTERFACE:
The component receives these props:
- state: object — the current app state
- onNavigate: (momentId: string) => void — call this to move to another screen
- onStateChange: (key: string, value: any) => void — call this to update app state

Write the component as:
window.__SCREEN_COMPONENT__ = function ScreenComponent({ state, onNavigate, onStateChange }) {
  // component body using React hooks, window.UI components, Tailwind classes
};

Return ONLY the JavaScript code. No explanation. No markdown fences. No imports. No exports.`;

function buildUserPrompt(moment: Moment, appMap: AppMap): string {
  const journey = appMap.journeys.find((j) => j.id === moment.journeyId);
  const connectedEdges = appMap.edges.filter(
    (e) => e.source === moment.id || e.target === moment.id
  );
  const connectedMoments = connectedEdges.map((e) => {
    const targetId = e.source === moment.id ? e.target : e.source;
    const target = appMap.moments.find((m) => m.id === targetId);
    return `  - ${e.source === moment.id ? '→' : '←'} "${target?.label ?? targetId}" (id: ${targetId})${e.label ? ` [${e.label}]` : ''}`;
  }).join('\n');

  const stateSchema = (appMap.stateSchema ?? []).map((f) =>
    `  ${f.key}: ${f.type}${f.defaultValue !== undefined ? ` (default: ${JSON.stringify(f.defaultValue)})` : ''}`
  ).join('\n');

  const screenComponents = moment.screenSpec?.components?.map((c) => {
    const cc = c as Record<string, unknown>;
    return `  - ${c.type}${cc.label ? `: "${cc.label}"` : ''}${cc.title ? ` title="${cc.title}"` : ''}`;
  }).join('\n') ?? '  (none specified)';

  const screenActions = moment.screenSpec?.actions?.map((a) =>
    `  - "${a.label}" (${a.kind}${a.target ? ` → ${a.target}` : ''})`
  ).join('\n') ?? '  (none specified)';

  return `APP: ${appMap.appName}
DESCRIPTION: ${appMap.appDescription}
PLATFORM: ${appMap.appPlatform ?? 'mobile'}

SCREEN TO BUILD:
- Label: ${moment.label}
- Description: ${moment.description}
- Type: ${moment.type}
- Journey: ${journey?.name ?? moment.journeyId}
- Screen title: ${moment.screenSpec?.title ?? moment.label}
- Screen subtitle: ${moment.screenSpec?.subtitle ?? ''}

Screen components:
${screenComponents}

Screen actions:
${screenActions}

Connected screens:
${connectedMoments || '  (none)'}

State schema:
${stateSchema || '  (none)'}

Build this screen now. Use window.UI components and Tailwind classes. Invent realistic content specific to "${appMap.appName}" — a ${appMap.appDescription}.`;
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
