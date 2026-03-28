import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { AppMap, Journey, Moment } from '@/lib/types';
import { buildFallbackScreenSpec } from '@/lib/runtime';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const {
    moment,
    reason,
    journey,
    appMap,
  }: { moment: Moment; reason: string; journey: Journey; appMap: AppMap } = await req.json();

  const metaMessage = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `You are updating a Moment in an app's Journey Map to reflect an upstream change. Return ONLY a JSON object — no markdown, no explanation.

App: ${appMap.appName}
Journey: ${journey.name} — ${journey.description}

Moment to update:
- ID: ${moment.id}
- Label: ${moment.label}
- Type: ${moment.type}
- Current description: ${moment.description}
- Current preview: ${moment.preview}

Upstream change that affects this moment:
"${reason}"

Update this moment's description and preview to correctly reflect how the upstream change impacts it. Keep the label and type unchanged. Be specific about what new data/context is now available from upstream.

Return ONLY:
{
  "description": "updated description",
  "preview": "updated UI preview"
}`,
      },
    ],
  });

  const metaText = (metaMessage.content[0] as { type: string; text: string }).text;
  const stripped = metaText.replace(/^```(?:json)?\s*/m, '').replace(/\s*```\s*$/m, '').trim();

  try {
    const meta = JSON.parse(stripped);
    const updatedMoment: Moment = {
      ...moment,
      description: meta.description ?? moment.description,
      preview: meta.preview ?? moment.preview,
    };

    return NextResponse.json({
      description: updatedMoment.description,
      preview: updatedMoment.preview,
      screenSpec: buildFallbackScreenSpec(updatedMoment, appMap),
      mockHtml: null,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to parse propagate response' }, { status: 500 });
  }
}
