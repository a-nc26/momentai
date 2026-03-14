import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { Moment, Journey, AppMap } from '@/lib/types';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
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

  if (!items.length) return NextResponse.json({ updates: {} });

  // Run all metadata updates in parallel — metadata only, no mock (mocks re-stream lazily)
  const results = await Promise.allSettled(
    items.map(({ moment, reason }) =>
      client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 512,
        messages: [
          {
            role: 'user',
            content: `You are updating a Moment in an app to reflect an upstream change. Return ONLY a JSON object — no markdown, no explanation.

App: ${appMap.appName}
Journey: ${journey.name} — ${journey.description}

UPSTREAM EDIT THAT WAS MADE:
- Screen edited: "${editedMoment.label}"
- Change: "${editChange}"

Moment to update:
- Label: ${moment.label}
- Type: ${moment.type}
- Current description: ${moment.description}
- Current preview: ${moment.preview}

How this moment is affected: "${reason}"

Update the description and preview to correctly reflect the upstream change. Be specific about new data/context now available. Keep label and type unchanged.

Return ONLY:
{"description":"updated description","preview":"updated UI preview"}`,
          },
        ],
      }).then((msg) => {
        const text = (msg.content[0] as { type: string; text: string }).text;
        const stripped = text.replace(/^```(?:json)?\s*/m, '').replace(/\s*```\s*$/m, '').trim();
        const parsed = JSON.parse(stripped);
        return { id: moment.id, description: parsed.description, preview: parsed.preview };
      })
    )
  );

  const updates: Record<string, { description?: string; preview?: string; mockHtml: null }> = {};
  for (const result of results) {
    if (result.status === 'fulfilled') {
      const { id, description, preview } = result.value;
      // Clear mockHtml so the node re-streams its updated screen next time it's viewed
      updates[id] = { description, preview, mockHtml: null };
    }
  }

  return NextResponse.json({ updates });
}
