import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { AppMap, Journey, Moment, RuntimeScreenSpec } from '@/lib/types';
import { transpileComponent } from '@/lib/transpile';
import { likelyContainsJsx } from '@/lib/generatedComponentGuard';
import { buildFallbackScreenSpec } from '@/lib/runtime';
import {
  MAX_TOKENS_EDIT_MOMENT,
  MODEL_EDIT_MOMENT,
  MODEL_PROPAGATE_BATCH,
  MAX_TOKENS_PROPAGATE_BATCH,
  TruncationError,
  extractCodeOrThrowOnTruncation,
} from '@/lib/ai-config';
import { allowEditMomentRequest, clientKeyFromRequest } from '@/lib/rate-limit';
import { requireBuildCredits } from '@/lib/build-access-server';
import { CREDIT_DEFAULT } from '@/lib/credit-costs';
import {
  formatUpstreamStateBindingInstructions,
  getUpstreamWrittenStateKeys,
} from '@/lib/upstream-state-keys';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function errorResponse(
  status: number,
  payload: { error: string; code: string; suggestion?: string; retryable?: boolean }
) {
  return NextResponse.json(payload, { status });
}

function collectStateUsageFromCode(code: string): { reads: Set<string>; writes: Set<string> } {
  const reads = new Set<string>();
  const writes = new Set<string>();
  for (const match of code.matchAll(/\bstate\.([a-zA-Z0-9_]+)/g)) {
    if (match[1]) reads.add(match[1]);
  }
  for (const match of code.matchAll(/onStateChange\(\s*['"`]([^'"`]+)['"`]/g)) {
    if (match[1]) writes.add(match[1]);
  }
  return { reads, writes };
}

function collectStateUsageFromSpec(moment: Moment): { reads: Set<string>; writes: Set<string> } {
  const reads = new Set<string>();
  const writes = new Set<string>();
  for (const component of moment.screenSpec?.components ?? []) {
    if ('key' in component && typeof component.key === 'string' && component.key) {
      reads.add(component.key);
      writes.add(component.key);
    }
  }
  for (const action of moment.screenSpec?.actions ?? []) {
    for (const key of action.requiredKeys ?? []) reads.add(key);
    if (action.branchKey) reads.add(action.branchKey);
    for (const effect of action.effects ?? []) {
      if (effect.kind === 'set-values') {
        for (const key of Object.keys(effect.values ?? {})) writes.add(key);
      }
      if (effect.kind === 'append-list' && effect.key) writes.add(effect.key);
    }
  }
  return { reads, writes };
}

function parseJson(text: string): Record<string, unknown> | null {
  try {
    return JSON.parse(text.replace(/^```(?:json)?\s*/m, '').replace(/\s*```\s*$/m, '').trim());
  } catch {
    return null;
  }
}

function buildScreenSpecDigest(moment: Moment, appMap: AppMap): string {
  const spec: RuntimeScreenSpec | undefined = moment.screenSpec;
  const lines: string[] = [];

  if (!spec) {
    lines.push('(No structured screenSpec — infer from label, description, and existing code.)');
  } else {
    if (spec.eyebrow) lines.push(`Eyebrow: ${spec.eyebrow}`);
    if (spec.title) lines.push(`Title: ${spec.title}`);
    if (spec.subtitle) lines.push(`Subtitle: ${spec.subtitle}`);
    if (spec.progress) {
      lines.push(`Progress: step ${spec.progress.current} of ${spec.progress.total}`);
    }
    const comps = spec.components ?? [];
    if (comps.length) {
      lines.push('Components (type; key = state binding when present):');
      for (const c of comps.slice(0, 28)) {
        const key = 'key' in c && typeof (c as { key?: string }).key === 'string' && (c as { key: string }).key
          ? ` (state key: ${(c as { key: string }).key})`
          : '';
        lines.push(`  - ${c.type}${key}`);
      }
      if (comps.length > 28) lines.push(`  … +${comps.length - 28} more`);
    }
    const acts = spec.actions ?? [];
    if (acts.length) {
      lines.push('Actions (label → kind / target):');
      for (const a of acts) {
        const tgt = a.target ? ` → ${a.target}` : '';
        lines.push(`  - "${a.label}" [${a.kind}]${tgt}`);
      }
    }
  }

  const schema = appMap.stateSchema ?? [];
  if (schema.length) {
    lines.push('App state keys (prefer state.* + formatting for money/currency when editing amounts if a key applies):');
    for (const f of schema) {
      const iv = appMap.initialState?.[f.key];
      lines.push(
        `  - ${f.key}: ${f.type}${iv !== undefined ? ` = ${JSON.stringify(iv)}` : ''}`
      );
    }
  }

  return lines.join('\n');
}

const EDIT_SYSTEM_PROMPT = `You are editing a single screen component for a mobile/web app.

YOUR #1 GOAL: Apply the user's requested change **thoroughly and visibly**. The user should immediately see the difference. If the change affects text, layout, colors, data, or structure — make the change clearly and completely. Do NOT make a minimal token-level tweak; make the screen reflect the intent of the change.

HOWEVER: Do NOT change parts of the screen the user did NOT ask about. Preserve layout, navigation, state wiring, and unrelated content.

Stack: React + Tailwind CSS + shadcn-style UI components available on window.UI.

═══ UI — React.createElement ONLY — NO JSX (MANDATORY) ═══
Do NOT use JSX (<div>, <Button>, etc.). Build everything with React.createElement only.
- Start with: const React = window.React; const { Button, Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter, Input, Badge, Avatar, AvatarFallback, Separator, Tabs, TabsList, TabsTrigger, TabsContent, Sheet, SheetContent, SheetHeader, SheetTitle, Dialog, DialogContent, DialogHeader, DialogTitle, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Label, Switch, Textarea } = window.UI;
- Use React.createElement('div', { className: '...' }, children) and React.createElement(Button, { ... }, 'label').
- Fragment: React.createElement(React.Fragment, null, a, b)

═══ STYLING ═══
- Prefer className + Tailwind. Avoid large style={{ }} objects.

═══ READING THE EXISTING CODE ═══
The prompt includes EXISTING COMPONENT CODE. Read it carefully — it is the CURRENT state of the screen.
The screenSpec/digest may be stale; if they conflict with the existing code, **trust the code**.
Base your edit on the code, not the spec.

RULES:
- NEVER use placeholder text. All content must be realistic and specific.
- Every navigation button MUST call onNavigate('exact-moment-id') using the EXACT IDs from the prompt.
- Read state via state.keyName. Write state via onStateChange('key', value).
- When state values are empty/falsy, show demo defaults using || (e.g., state.userName || 'Sarah Chen'), EXCEPT for keys listed in any "UPSTREAM STATE — USER SET" block in the user message — for those recap keys never fabricate unrelated substitute values; use honest empty-state copy.
- Use window.UI components (destructured above).
- Self-contained. No imports. No exports. Assign to window.__SCREEN_COMPONENT__.
- Return ONLY JavaScript code. No explanation. No markdown fences.
- Do NOT output </script> inside any string literal.

When the digest lists state keys for amounts or currency, prefer updating values via onStateChange and formatting from state (rather than hardcoded currency strings), if a key fits.

COMPONENT INTERFACE:
- state: object — current app state
- onNavigate: (momentId: string) => void — navigate to another screen
- onStateChange: (key: string, value: any) => void — update state`;

export async function POST(req: NextRequest) {
  const t0 = Date.now();
  try {
    const key = clientKeyFromRequest(req);
    if (!allowEditMomentRequest(key)) {
      return errorResponse(429, {
        error: 'Too many edit requests. Try again in a minute.',
        code: 'RATE_LIMITED',
        retryable: true,
        suggestion: 'Wait 60 seconds and retry.',
      });
    }
    const denied = await requireBuildCredits(req, CREDIT_DEFAULT);
    if (denied) return denied;

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
      ? `\nEXISTING COMPONENT CODE (this is what the screen currently renders — base your edit on this):\n${moment.componentCode}`
      : '';

    const screenDigest = buildScreenSpecDigest(moment, appMap);

    const neighborContext: string[] = [];
    for (const e of outgoingEdgesForNav) {
      const t = appMap.moments.find((m) => m.id === e.target);
      if (t) {
        neighborContext.push(
          `→ Next screen "${t.label}" (${t.id}): ${t.description ?? '(no description)'}`
        );
      }
    }
    for (const e of incomingEdges) {
      const s = appMap.moments.find((m) => m.id === e.source);
      if (s) {
        neighborContext.push(
          `← Previous screen "${s.label}" (${s.id}): ${s.description ?? '(no description)'}`
        );
      }
    }

    const upstreamKeys = getUpstreamWrittenStateKeys(moment.id, appMap);
    const upstreamEditorBlock =
      upstreamKeys.length > 0 ? `${formatUpstreamStateBindingInstructions(upstreamKeys, appMap)}\n` : '';

    const userPrompt = `APP: ${appMap.appName} — ${appMap.appDescription}
PLATFORM: ${appMap.appPlatform ?? 'mobile'}
JOURNEY: ${journey.name} — ${journey.description}

SCREEN TO EDIT:
- ID: ${moment.id}
- Label: ${moment.label}
- Description: ${moment.description}
- Type: ${moment.type}

SCREEN SPEC + STATE DIGEST (may be stale — trust the existing code if they conflict):
${screenDigest}

NAVIGATION TARGETS (use these EXACT IDs):
Forward: ${navTargets || '(none)'}
Back: ${backTargets || '(none)'}

${neighborContext.length ? `NEIGHBORING SCREENS (for context about what comes before/after):\n${neighborContext.join('\n')}\n` : ''}${upstreamEditorBlock}State: ${stateFields || '(none)'}
${existingCode}

USER'S CHANGE REQUEST:
"${change}"

Apply this change thoroughly and visibly. The user should see the difference immediately. Keep all unrelated parts of the screen intact. Generate the complete updated component.`;


    const stripFences = (s: string) =>
      s
        .replace(/^```(?:javascript|jsx|js|tsx)?\n?/i, '')
        .replace(/\n?```$/, '')
        .trim();

    const message = await client.messages.create({
      model: MODEL_EDIT_MOMENT,
      max_tokens: MAX_TOKENS_EDIT_MOMENT,
      system: EDIT_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    });

    let code = stripFences(extractCodeOrThrowOnTruncation(message, 'edit-moment'));

    for (let jsxPass = 0; jsxPass < 2 && likelyContainsJsx(code); jsxPass++) {
      console.log(`[edit-moment] JSX detected (pass ${jsxPass + 1}); regenerating createElement-only`);
      const regen = await client.messages.create({
        model: MODEL_EDIT_MOMENT,
        max_tokens: MAX_TOKENS_EDIT_MOMENT,
        system: EDIT_SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `${userPrompt}

═══ FIX REQUIRED ═══
Your output contained JSX. Rewrite the ENTIRE component using ONLY React.createElement — no <div>, <Button>, or other angle-bracket tags.`,
          },
        ],
      });
      code = stripFences(extractCodeOrThrowOnTruncation(regen, 'edit-moment'));
    }

    let transpileAttempts = 0;
    while (transpileAttempts < 3) {
      try {
        code = transpileComponent(code);
        break;
      } catch (transpileErr) {
        if (
          transpileErr instanceof Error &&
          transpileErr.message.includes('Cannot find module')
        ) {
          throw transpileErr;
        }
        if (transpileErr instanceof TruncationError) throw transpileErr;
        transpileAttempts++;
        if (transpileAttempts >= 3) {
          console.error('[edit-moment] Transpile failed after retries:', transpileErr);
          throw transpileErr;
        }
        const hint =
          transpileErr instanceof Error ? transpileErr.message : String(transpileErr);
        const isTruncationLikely =
          /unexpected (token|end|eof)/i.test(hint) || /missing[^]*after argument/i.test(hint);
        console.error('[edit-moment] Transpile failed, retrying with hint:', hint);

        const retryMessage = await client.messages.create({
          model: MODEL_EDIT_MOMENT,
          max_tokens: MAX_TOKENS_EDIT_MOMENT,
          system: EDIT_SYSTEM_PROMPT,
          messages: [
            {
              role: 'user',
              content: `${userPrompt}

═══ FIX REQUIRED ═══
The previous output failed JavaScript parsing with:
${hint}
${isTruncationLikely ? '\nThis looks like TRUNCATED output. Your code was cut off before finishing. Make the component SHORTER and SIMPLER — fewer nested elements, shorter demo strings, less repetition — so it fits in one response.\n' : ''}
Output the COMPLETE fixed component using ONLY React.createElement (NO JSX). Preserve the user's change request and all onNavigate IDs.`,
            },
          ],
        });

        code = stripFences(extractCodeOrThrowOnTruncation(retryMessage, 'edit-moment'));
      }
    }

    const metadataMessage = await client.messages.create({
      model: MODEL_PROPAGATE_BATCH,
      max_tokens: MAX_TOKENS_PROPAGATE_BATCH,
      messages: [
        {
          role: 'user',
          content: `You are updating metadata for an edited app screen. Return ONLY JSON.

Edited screen:
- Label: ${moment.label}
- Description: ${moment.description}
- Preview: ${moment.preview}
- User edit request: ${change}

Return:
{"label":"optional updated label","description":"updated description","preview":"updated preview"}`,
        },
      ],
    });
    const metadataText = (metadataMessage.content[0] as { type: string; text: string }).text;
    const metadataParsed = parseJson(metadataText) ?? {};
    const metadata: Partial<Pick<Moment, 'label' | 'description' | 'preview' | 'screenSpec'>> = {
      ...(typeof metadataParsed.label === 'string' ? { label: metadataParsed.label } : {}),
      ...(typeof metadataParsed.description === 'string'
        ? { description: metadataParsed.description }
        : {}),
      ...(typeof metadataParsed.preview === 'string' ? { preview: metadataParsed.preview } : {}),
    };
    // We return the component code as the source of truth for the preview.
    // Only emit a refreshed fallback spec when the moment did NOT previously rely on code
    // (spec-driven screens). Otherwise the preview ignores the spec anyway and the
    // duplicate spec title/subtitle just bloats the payload.
    if (!moment.componentCode) {
      const syntheticMoment: Moment = {
        ...moment,
        ...metadata,
        componentCode: code,
      };
      metadata.screenSpec = buildFallbackScreenSpec(syntheticMoment, appMap);
    }

    const beforeUsage = collectStateUsageFromCode(moment.componentCode ?? '');
    const afterUsage = collectStateUsageFromCode(code);
    const changedStateKeys = new Set<string>();
    const allBefore = new Set([...beforeUsage.reads, ...beforeUsage.writes]);
    const allAfter = new Set([...afterUsage.reads, ...afterUsage.writes]);
    for (const keyChanged of allAfter) {
      if (!allBefore.has(keyChanged)) changedStateKeys.add(keyChanged);
    }
    for (const keyChanged of allBefore) {
      if (!allAfter.has(keyChanged)) changedStateKeys.add(keyChanged);
    }

    const directlyConnected = new Set<string>();
    for (const edge of outgoingEdgesForNav) directlyConnected.add(edge.target);
    for (const edge of incomingEdges) directlyConnected.add(edge.source);

    const affectedMoments: Record<string, string> = {};
    if (changedStateKeys.size > 0) {
      for (const connectedId of directlyConnected) {
        const connected = appMap.moments.find((entry) => entry.id === connectedId);
        if (!connected) continue;
        const specUsage = collectStateUsageFromSpec(connected);
        const codeUsage = collectStateUsageFromCode(connected.componentCode ?? '');
        const connectedKeys = new Set([
          ...specUsage.reads,
          ...specUsage.writes,
          ...codeUsage.reads,
          ...codeUsage.writes,
        ]);
        const matching = Array.from(changedStateKeys).filter((key) => connectedKeys.has(key));
        if (matching.length > 0) {
          affectedMoments[connected.id] =
            `Uses changed state key(s): ${matching.join(', ')} from edited screen "${moment.label}".`;
        }
      }
    }

    console.log(
      `[edit-moment] ok momentId=${moment.id} ms=${Date.now() - t0} affected=${Object.keys(affectedMoments).length}`
    );

    return NextResponse.json({
      componentCode: code,
      metadata,
      affectedMoments: Object.keys(affectedMoments).length > 0 ? affectedMoments : undefined,
    });
  } catch (err) {
    console.error('[edit-moment] Error:', err, `ms=${Date.now() - t0}`);
    return errorResponse(500, {
      error: err instanceof Error ? err.message : 'Failed to generate edit',
      code: 'EDIT_FAILED',
      retryable: true,
      suggestion: 'Try a shorter edit request or regenerate once.',
    });
  }
}
