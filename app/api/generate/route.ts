import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { description } = await req.json();

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: `You are a system that analyzes app descriptions and generates structured Journey Maps for a visual app builder called Momentum.

App Description: "${description}"

Generate a Journey Map as a JSON object. Return ONLY valid JSON, no markdown code fences, no explanation.

The JSON must follow this exact structure:
{
  "appName": "Short app name",
  "appDescription": "One sentence description",
  "journeys": [
    {
      "id": "journey-id-lowercase-hyphenated",
      "name": "Journey Name",
      "description": "What this user flow accomplishes"
    }
  ],
  "moments": [
    {
      "id": "moment-id-lowercase-hyphenated",
      "journeyId": "journey-id",
      "label": "Short step name",
      "description": "What this step does (1-2 sentences)",
      "type": "ui",
      "preview": "Detailed description of what this screen or step looks like to the user — what UI elements appear, what actions are available, what information is shown",
      "position": { "x": 0, "y": 0 }
    }
  ],
  "edges": [
    {
      "id": "edge-id",
      "source": "moment-id",
      "target": "moment-id",
      "label": "optional short transition label"
    }
  ]
}

Rules:
- Create 2-5 distinct journeys representing real user flows
- Each journey should have 3-6 moments
- Moment types: "ui" (screens/forms), "ai" (AI-powered steps), "data" (database/storage operations), "auth" (authentication steps)
- Position nodes: each journey on its own horizontal row, spaced 320px apart vertically (y: 0, 320, 640, etc.)
- Within each journey, space moments 280px apart horizontally starting at x: 0
- Create edges connecting moments within each journey in sequence
- Add cross-journey edges where flows naturally intersect (e.g. auth completes then leads to dashboard)
- All IDs must be unique, lowercase, with hyphens only`,
      },
    ],
  });

  const text = (message.content[0] as { type: string; text: string }).text;

  // Strip markdown code fences if present
  const stripped = text.replace(/^```(?:json)?\s*/m, '').replace(/\s*```\s*$/m, '').trim();

  try {
    const data = JSON.parse(stripped);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to parse map', raw: text }, { status: 500 });
  }
}
