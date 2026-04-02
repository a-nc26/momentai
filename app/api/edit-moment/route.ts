import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { AppMap, Journey, Moment } from '@/lib/types';
import { transpileComponent } from '@/lib/transpile';

const client = new Anthropic();

const EDIT_SYSTEM_PROMPT = `You are editing a single screen component for a mobile/web app. Apply ONLY the user's requested change — keep everything else about the screen intact.

Stack: React + Tailwind CSS + shadcn-style UI components available on window.UI.

═══ JSX SYNTAX — CRITICAL ═══
- ALWAYS wrap JSX expressions in parentheses: return ( <div>...</div> );
- NEVER have dangling braces or unclosed tags
- Array.map() MUST have complete arrow function: items.map((item, i) => ( <div key={i}>...</div> ))
- Ternary in JSX MUST be wrapped: { condition ? ( <Component /> ) : ( <Other /> ) }
- Multi-line JSX MUST use parentheses: const el = ( <div>...</div> );

RULES:
- NEVER use placeholder text. All content must be realistic and specific.
- Every navigation button MUST call onNavigate('exact-moment-id') using the IDs from the prompt.
- Read state via state.keyName. Write state via onStateChange('key', value).
- When state values are empty/falsy, show demo defaults using || (e.g., state.userName || 'Sarah Chen').
- Use window.UI components: Button, Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter, Input, Badge, Avatar, AvatarFallback, Separator, Tabs, TabsList, TabsTrigger, TabsContent, Sheet, SheetContent, SheetHeader, SheetTitle, Dialog, DialogContent, DialogHeader, DialogTitle, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Label, Switch, Textarea.
- Self-contained. No imports. No exports. Assign to window.__SCREEN_COMPONENT__.
- Return ONLY JavaScript code. No explanation. No markdown fences.

COMPONENT INTERFACE:
- state: object — current app state
- onNavigate: (momentId: string) => void — navigate to another screen
- onStateChange: (key: string, value: any) => void — update state`;

export async function POST(req: NextRequest) {
  try {
    const {
      moment,
      change,
      journey,
      appMap,
    }: { moment: Moment; change: string; journey: Journey; appMap: AppMap } = await req.json();

    const outgoingEdgesForNav = appMap.edges.filter((e) => e.source === moment.id);
    const incomingEdges = appMap.edges.filter((e) => e.target === moment.id);

    const navTargets = outgoingEdgesForNav.map((e) => {
      const target = appMap.moments.find((m) => m.id === e.target);
      return `  Button "${e.label || 'Continue'}" → onNavigate('${e.target}')  // "${target?.label ?? e.target}"`;
    }).join('\n');

    const backTargets = incomingEdges.map((e) => {
      const source = appMap.moments.find((m) => m.id === e.source);
      return `  Back → onNavigate('${e.source}')  // "${source?.label ?? e.source}"`;
    }).join('\n');

    const stateFields = (appMap.stateSchema ?? []).map((f) => {
      const initialVal = appMap.initialState?.[f.key];
      return `  state.${f.key}: ${f.type} = ${JSON.stringify(initialVal ?? f.defaultValue ?? '')}`;
    }).join('\n');

    const existingCode = moment.componentCode
      ? `\nEXISTING COMPONENT CODE (modify this based on the change request):\n${moment.componentCode}`
      : '';

    const userPrompt = `APP: ${appMap.appName} — ${appMap.appDescription}
PLATFORM: ${appMap.appPlatform ?? 'mobile'}
JOURNEY: ${journey.name} — ${journey.description}

SCREEN TO EDIT:
- ID: ${moment.id}
- Label: ${moment.label}
- Description: ${moment.description}
- Type: ${moment.type}

NAVIGATION TARGETS (use these EXACT IDs):
Forward: ${navTargets || '(none)'}
Back: ${backTargets || '(none)'}

State: ${stateFields || '(none)'}
${existingCode}

USER'S CHANGE REQUEST:
"${change}"

Apply ONLY this change. Keep everything else intact. Generate the complete updated component.`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system: EDIT_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    });

    let code = (message.content[0] as { type: string; text: string }).text.trim();

    code = code
      .replace(/^```(?:javascript|jsx|js|tsx)?\n?/i, '')
      .replace(/\n?```$/, '')
      .trim();

    try {
      code = transpileComponent(code);
    } catch (transpileErr) {
      console.error('[edit-moment] Transpile failed, retrying generation:', transpileErr);
      console.error('[edit-moment] Original code:', code.slice(0, 500));
      
      // Retry once
      const retryMessage = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 4096,
        system: EDIT_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
      });
      
      code = (retryMessage.content[0] as { type: string; text: string }).text.trim();
      code = code
        .replace(/^```(?:javascript|jsx|js|tsx)?\n?/i, '')
        .replace(/\n?```$/, '')
        .trim();
      
      try {
        code = transpileComponent(code);
      } catch (secondErr) {
        return NextResponse.json(
          { 
            error: `JSX validation failed: ${secondErr instanceof Error ? secondErr.message : 'Invalid syntax'}`,
            suggestion: 'Try simplifying your request or check for syntax issues'
          },
          { status: 422 }
        );
      }
    }

    const outgoingEdges = appMap.edges.filter((e) => e.source === moment.id);
    const affectedMoments: Record<string, string> = {};

    for (const edge of outgoingEdges) {
      const targetMoment = appMap.moments.find((m) => m.id === edge.target);
      if (targetMoment) {
        affectedMoments[edge.target] = `Upstream screen "${moment.label}" was edited: ${change}`;
      }
    }

    return NextResponse.json({ 
      componentCode: code,
      affectedMoments: Object.keys(affectedMoments).length > 0 ? affectedMoments : undefined
    });
  } catch (err) {
    console.error('[edit-moment] Error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to generate edit' },
      { status: 500 }
    );
  }
}
