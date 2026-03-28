import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { AppMap, Journey, Moment } from '@/lib/types';
import { buildFallbackScreenSpec } from '@/lib/runtime';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const {
    moment,
    change,
    journey,
    appMap,
  }: { moment: Moment; change: string; journey: Journey; appMap: AppMap } = await req.json();

  const allMomentsContext = appMap.moments
    .filter((entry) => entry.id !== moment.id)
    .map((entry) => `  { "id": "${entry.id}", "label": "${entry.label}", "type": "${entry.type}", "description": "${entry.description.slice(0, 120).replace(/"/g, "'")}" }`)
    .join('\n');

  const connectedEdges = appMap.edges.filter(
    (edge) => edge.source === moment.id || edge.target === moment.id
  );

  const edgeContext = connectedEdges
    .map((edge) => {
      const sourceLabel = appMap.moments.find((entry) => entry.id === edge.source)?.label ?? edge.source;
      const targetLabel = appMap.moments.find((entry) => entry.id === edge.target)?.label ?? edge.target;
      return `  { "id": "${edge.id}", "source": "${edge.source}" (${sourceLabel}), "target": "${edge.target}" (${targetLabel})${edge.label ? `, "label": "${edge.label}"` : ''} }`;
    })
    .join('\n');

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: `You are editing a specific moment inside a mobile prototype builder. Return ONLY valid JSON.

App: ${appMap.appName}
Description: ${appMap.appDescription}
Journey: ${journey.name} — ${journey.description}

Current app runtime schema:
${JSON.stringify(appMap.stateSchema ?? [], null, 2)}

Current moment:
- ID: ${moment.id}
- Label: ${moment.label}
- Type: ${moment.type}
- Description: ${moment.description}
- Preview: ${moment.preview}
- Existing screenSpec: ${JSON.stringify(moment.screenSpec ?? null)}

Connected edges:
${edgeContext || '  (none)'}

Other moments in the app:
${allMomentsContext || '  (none)'}

User change request:
"${change}"

Return ONLY this JSON shape:
{
  "label": "updated label",
  "type": "ui|ai|data|auth",
  "description": "updated description",
  "preview": "updated preview",
  "screenSpec": {
    "eyebrow": "Short label",
    "title": "Screen title",
    "subtitle": "Supporting copy",
    "progress": { "current": 1, "total": 4 },
    "components": [],
    "actions": []
  },
  "stateSchema": [],
  "initialState": {},
  "newMoments": [],
  "newEdges": [],
  "removedEdgeIds": [],
  "affectedMomentIds": [{"id": "moment-id", "reason": "why this downstream moment is affected"}]
}

Rules:
- This is mobile-only v1
- Do NOT return HTML
- The moment must remain runnable in a constrained runtime schema
- Supported component types: "hero", "input", "choice-cards", "chip-group", "notice", "summary-card", "stats-grid", "list", "spacer"
- Supported action kinds: "navigate", "branch", "back"
- If the edit adds a new input or new stateful choice, add or update the app-level stateSchema
- If the edit adds a new screen, include it in newMoments with its own full screenSpec
- If the edit inserts a screen into the flow, use removedEdgeIds and newEdges to rewire the graph correctly
- Each action should use requiredKeys if it depends on user input
- Return full stateSchema and full initialState after the edit, not partial diffs
- Keep IDs lowercase and hyphenated
- Only flag downstream moments that genuinely need updates`,
      },
    ],
  });

  const text = (message.content[0] as { type: string; text: string }).text;
  const stripped = text.replace(/^```(?:json)?\s*/m, '').replace(/\s*```\s*$/m, '').trim();

  try {
    const parsed = JSON.parse(stripped);

    const outgoingEdges = appMap.edges.filter((edge) => edge.source === moment.id);
    const downstreamMoments = outgoingEdges
      .map((edge) => appMap.moments.find((entry) => entry.id === edge.target))
      .filter(Boolean) as Moment[];

    const updatedMoment: Moment = {
      ...moment,
      label: parsed.label ?? moment.label,
      type: parsed.type ?? moment.type,
      description: parsed.description ?? moment.description,
      preview: parsed.preview ?? moment.preview,
      screenSpec: parsed.screenSpec ?? buildFallbackScreenSpec(
        {
          ...moment,
          label: parsed.label ?? moment.label,
          type: parsed.type ?? moment.type,
          description: parsed.description ?? moment.description,
          preview: parsed.preview ?? moment.preview,
        },
        appMap
      ),
    };

    const newMoments = (parsed.newMoments ?? []).map((entry: Record<string, unknown>, index: number) => {
      let x = moment.position.x + 320 * (index + 1);
      let y = moment.position.y;

      if (downstreamMoments.length > 0) {
        const avgDownstreamX =
          downstreamMoments.reduce((sum, downstream) => sum + downstream.position.x, 0) /
          downstreamMoments.length;
        const avgDownstreamY =
          downstreamMoments.reduce((sum, downstream) => sum + downstream.position.y, 0) /
          downstreamMoments.length;
        x = Math.round((moment.position.x + avgDownstreamX) / 2) + index * 300;
        y = Math.round((moment.position.y + avgDownstreamY) / 2);
      }

      const candidateMoment: Moment = {
        id: String(entry.id),
        journeyId: String(entry.journeyId ?? moment.journeyId),
        label: String(entry.label ?? 'New Screen'),
        type: (entry.type as Moment['type']) ?? 'ui',
        description: String(entry.description ?? 'New moment'),
        preview: String(entry.preview ?? 'Generated screen'),
        position: { x, y },
        screenSpec: entry.screenSpec as Moment['screenSpec'],
      };

      return {
        ...candidateMoment,
        screenSpec: candidateMoment.screenSpec ?? buildFallbackScreenSpec(candidateMoment, appMap),
      };
    });

    const affectedMoments: Record<string, string> = {};
    for (const item of parsed.affectedMomentIds ?? []) {
      if (item?.id && item?.reason) affectedMoments[item.id] = item.reason;
    }

    return NextResponse.json({
      ...updatedMoment,
      stateSchema: parsed.stateSchema ?? appMap.stateSchema ?? [],
      initialState: parsed.initialState ?? appMap.initialState ?? {},
      runtimeVersion: 1,
      appPlatform: 'mobile',
      mockHtml: null,
      newMoments,
      newEdges: parsed.newEdges ?? [],
      removedEdgeIds: parsed.removedEdgeIds ?? [],
      affectedMoments,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to parse update' }, { status: 500 });
  }
}
