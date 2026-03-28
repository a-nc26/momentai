import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { AppMap, Journey, Moment } from '@/lib/types';

const client = new Anthropic();

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

export async function POST(req: NextRequest) {
  try {
    const {
      moment,
      change,
      journey,
      appMap,
    }: { moment: Moment; change: string; journey: Journey; appMap: AppMap } = await req.json();

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

    const existingCode = moment.componentCode
      ? `\nEXISTING COMPONENT CODE (modify this based on the change request):\n${moment.componentCode}`
      : '';

    const userPrompt = `APP: ${appMap.appName}
DESCRIPTION: ${appMap.appDescription}
PLATFORM: ${appMap.appPlatform ?? 'mobile'}
JOURNEY: ${journey.name} — ${journey.description}

SCREEN TO EDIT:
- Label: ${moment.label}
- Description: ${moment.description}
- Type: ${moment.type}
- Screen title: ${moment.screenSpec?.title ?? moment.label}

Connected screens:
${connectedMoments || '  (none)'}

State schema:
${stateSchema || '  (none)'}
${existingCode}

USER'S CHANGE REQUEST:
"${change}"

Apply ONLY this change. Keep everything else about the screen intact. Generate the complete updated component code.`;

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

    return NextResponse.json({ componentCode: code });
  } catch (err) {
    console.error('[edit-moment] Error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to generate edit' },
      { status: 500 }
    );
  }
}
