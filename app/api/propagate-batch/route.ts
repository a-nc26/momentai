import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { Moment, Journey, AppMap } from '@/lib/types';
import { buildFallbackScreenSpec } from '@/lib/runtime';
import {
  MAX_TOKENS_PROPAGATE_BATCH,
  MODEL_PROPAGATE_BATCH,
  MODEL_EDIT_MOMENT,
  MAX_TOKENS_EDIT_MOMENT,
  extractCodeOrThrowOnTruncation,
} from '@/lib/ai-config';
import { transpileComponent } from '@/lib/transpile';
import { likelyContainsJsx } from '@/lib/generatedComponentGuard';
import { allowPropagateBatchRequest, clientKeyFromRequest } from '@/lib/rate-limit';
import { requireBuildCredits } from '@/lib/build-access-server';
import { CREDIT_DEFAULT } from '@/lib/credit-costs';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const PROPAGATE_CONCURRENCY = 4;

function errorResponse(
  status: number,
  payload: { error: string; code: string; suggestion?: string; retryable?: boolean; updates?: Record<string, unknown> }
) {
  return NextResponse.json(payload, { status });
}

function parseHaikuJson(text: string): { description?: string; preview?: string } | null {
  try {
    const stripped = text.replace(/^```(?:json)?\s*/m, '').replace(/\s*```\s*$/m, '').trim();
    const parsed = JSON.parse(stripped) as { description?: string; preview?: string };
    if (parsed && typeof parsed === 'object') return parsed;
  } catch (e) {
    console.error('[propagate-batch] JSON parse failed:', e);
  }
  return null;
}

const stripFences = (s: string) =>
  s
    .replace(/^```(?:javascript|jsx|js|tsx)?\n?/i, '')
    .replace(/\n?```$/, '')
    .trim();

async function runWithConcurrency<T, R>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R>
): Promise<PromiseSettledResult<R>[]> {
  const results: PromiseSettledResult<R>[] = new Array(items.length);
  let cursor = 0;
  const execute = async () => {
    while (cursor < items.length) {
      const index = cursor++;
      try {
        const value = await worker(items[index], index);
        results[index] = { status: 'fulfilled', value };
      } catch (error) {
        results[index] = { status: 'rejected', reason: error };
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, Math.max(items.length, 1)) }, execute));
  return results;
}

async function regenerateComponentCode(
  moment: Moment,
  editedMoment: Moment,
  editChange: string,
  appMap: AppMap,
  journey: Journey
): Promise<string | null> {
  if (!moment.componentCode) return null;

  const outEdges = appMap.edges.filter((e) => e.source === moment.id);
  const inEdges = appMap.edges.filter((e) => e.target === moment.id);
  const navTargets = outEdges
    .map((e) => {
      const t = appMap.moments.find((m) => m.id === e.target);
      return `  Button "${e.label || 'Continue'}" → onNavigate('${e.target}')  // "${t?.label ?? e.target}"`;
    })
    .join('\n');
  const backTargets = inEdges
    .map((e) => {
      const s = appMap.moments.find((m) => m.id === e.source);
      return `  Back → onNavigate('${e.source}')  // "${s?.label ?? e.source}"`;
    })
    .join('\n');
  const stateFields = (appMap.stateSchema ?? [])
    .map((f) => `  state.${f.key}: ${f.type} = ${JSON.stringify(f.defaultValue ?? '')}`)
    .join('\n');

  try {
    const msg = await client.messages.create({
      model: MODEL_EDIT_MOMENT,
      max_tokens: MAX_TOKENS_EDIT_MOMENT,
      system: `You are updating a screen component because a connected screen was edited. Apply changes that logically follow from the upstream/downstream edit. Keep the overall structure and purpose of THIS screen intact — only adjust parts that reference the changed screen.

Stack: React + Tailwind CSS + shadcn-style UI components on window.UI.

═══ React.createElement ONLY — NO JSX ═══
- Start with: const React = window.React; const { Button, Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter, Input, Badge, Avatar, AvatarFallback, Separator, Tabs, TabsList, TabsTrigger, TabsContent, Sheet, SheetContent, SheetHeader, SheetTitle, Dialog, DialogContent, DialogHeader, DialogTitle, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, Label, Switch, Textarea } = window.UI;
- Use React.createElement only. No JSX.
- Assign to window.__SCREEN_COMPONENT__.
- Return ONLY JavaScript code. No explanation. No markdown.
- Do NOT output </script> in any string.`,
      messages: [
        {
          role: 'user',
          content: `APP: ${appMap.appName} — ${appMap.appDescription}
JOURNEY: ${journey.name} — ${journey.description}

WHAT CHANGED:
Screen "${editedMoment.label}" (${editedMoment.id}) was edited: "${editChange}"

THIS SCREEN (to update):
- ID: ${moment.id}
- Label: ${moment.label}
- Description: ${moment.description}

NAVIGATION:
Forward: ${navTargets || '(none)'}
Back: ${backTargets || '(none)'}
State: ${stateFields || '(none)'}

EXISTING CODE (update this to reflect the upstream change):
${moment.componentCode}

Update this component to be consistent with the change made to "${editedMoment.label}". If the edit doesn't affect this screen's content, return the code unchanged. Output the complete component.`,
        },
      ],
    });

    let code = stripFences(extractCodeOrThrowOnTruncation(msg, `propagate-code:${moment.id}`));

    if (likelyContainsJsx(code)) {
      console.warn(`[propagate-code] JSX detected for ${moment.id}, skipping code regen`);
      return null;
    }

    code = transpileComponent(code);
    return code;
  } catch (err) {
    console.error(`[propagate-code] Failed for ${moment.id}:`, err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  const t0 = Date.now();
  try {
    const key = clientKeyFromRequest(req);
    if (!allowPropagateBatchRequest(key)) {
      return errorResponse(429, {
        error: 'Too many propagation requests. Try again in a minute.',
        code: 'RATE_LIMITED',
        retryable: true,
        suggestion: 'Wait 60 seconds and retry.',
      });
    }
    const denied = await requireBuildCredits(req, CREDIT_DEFAULT);
    if (denied) return denied;

    const {
      items,
      editChange,
      editedMoment,
      journey,
      appMap,
    }: {
      items: { moment: Moment; reason: string }[];
      editChange: string;
      editedMoment: Moment;
      journey: Journey;
      appMap: AppMap;
    } = await req.json();

    if (!items.length) return NextResponse.json({ updates: {}, errors: {} });

    const directlyConnectedIds = new Set<string>();
    for (const edge of appMap.edges) {
      if (edge.source === editedMoment.id) directlyConnectedIds.add(edge.target);
      if (edge.target === editedMoment.id) directlyConnectedIds.add(edge.source);
    }

    const results = await runWithConcurrency(
      items,
      PROPAGATE_CONCURRENCY,
      async ({ moment, reason }) => {
        const metadataPromise = client.messages.create({
          model: MODEL_PROPAGATE_BATCH,
          max_tokens: MAX_TOKENS_PROPAGATE_BATCH,
          messages: [
            {
              role: 'user',
              content: `You are updating a Moment in an app to reflect a change to a connected screen. Return ONLY a JSON object — no markdown, no explanation.

App: ${appMap.appName}
Journey: ${journey.name} — ${journey.description}

EDIT THAT WAS MADE:
- Screen edited: "${editedMoment.label}"
- Change: "${editChange}"

Moment to update:
- Label: ${moment.label}
- Type: ${moment.type}
- Current description: ${moment.description}
- Current preview: ${moment.preview}

How this moment is affected: "${reason}"

Update the description and preview to correctly reflect the change. Be specific about new data/context. Keep label and type unchanged.

Return ONLY:
{"description":"updated description","preview":"updated UI preview"}`,
            },
          ],
        });

        const shouldRegenCode =
          directlyConnectedIds.has(moment.id) && !!moment.componentCode;
        const codePromise = shouldRegenCode
          ? regenerateComponentCode(moment, editedMoment, editChange, appMap, journey)
          : Promise.resolve(null);

        const [metaMsg, newCode] = await Promise.all([metadataPromise, codePromise]);

        const text = (metaMsg.content[0] as { type: string; text: string }).text;
        const parsed = parseHaikuJson(text);
        if (!parsed || (parsed.description === undefined && parsed.preview === undefined)) {
          throw new Error('Model returned invalid or empty JSON');
        }
        return {
          id: moment.id,
          moment,
          description: parsed.description,
          preview: parsed.preview,
          componentCode: newCode,
        };
      }
    );

    const updates: Record<
      string,
      {
        description?: string;
        preview?: string;
        screenSpec?: Moment['screenSpec'];
        mockHtml: null;
        componentCode?: string;
        buildStatus?: 'done';
      }
    > = {};
    const errors: Record<string, string> = {};

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const momentId = items[i].moment.id;
      if (result.status === 'fulfilled') {
        const { id, description, preview, moment, componentCode } = result.value;
        const targetMoment = appMap.moments.find((m) => m.id === id);
        updates[id] = {
          description,
          preview,
          screenSpec: targetMoment
            ? buildFallbackScreenSpec(
                {
                  ...moment,
                  description: description ?? targetMoment.description,
                  preview: preview ?? targetMoment.preview,
                },
                appMap
              )
            : undefined,
          mockHtml: null,
          ...(componentCode ? { componentCode, buildStatus: 'done' } : {}),
        };
      } else {
        const reason =
          result.reason instanceof Error ? result.reason.message : String(result.reason);
        errors[momentId] = reason;
        console.error('[propagate-batch] item rejected', momentId, result.reason);
      }
    }

    const codeRegenCount = Object.values(updates).filter((u) => u.componentCode).length;
    console.log(
      `[propagate-batch] ok ms=${Date.now() - t0} updated=${Object.keys(updates).length} codeRegen=${codeRegenCount} errors=${Object.keys(errors).length}`
    );

    return NextResponse.json({
      updates,
      errors: Object.keys(errors).length > 0 ? errors : undefined,
    });
  } catch (err) {
    console.error('[propagate-batch] Error:', err, `ms=${Date.now() - t0}`);
    return errorResponse(500, {
      error: err instanceof Error ? err.message : 'Propagation failed',
      code: 'PROPAGATE_FAILED',
      retryable: true,
      suggestion: 'Retry the cascade or refresh affected screens manually.',
      updates: {},
    });
  }
}
