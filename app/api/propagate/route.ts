import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { Moment, Journey, AppMap } from '@/lib/types';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const {
    moment,
    reason,
    journey,
    appMap,
  }: { moment: Moment; reason: string; journey: Journey; appMap: AppMap } = await req.json();

  // Run metadata update and mock regeneration in parallel
  const [metaMessage, mockMessage] = await Promise.all([
    client.messages.create({
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
    }),

    client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `You are a world-class product designer. Regenerate a pixel-perfect, production-quality HTML mockup for this app screen, updated to reflect an upstream change.

App: ${appMap.appName}
Description: ${appMap.appDescription}
Journey: ${journey.name} — ${journey.description}
Screen: ${moment.label}
Current description: ${moment.description}
Current UI context: ${moment.preview}
UPSTREAM CHANGE AFFECTING THIS SCREEN: "${reason}"

Generate a COMPLETE, self-contained HTML document that looks like a real, polished, production app screen updated to reflect the upstream change.

CRITICAL TECHNICAL REQUIREMENTS:
- Do NOT use Google Fonts or any external CDN — the iframe is sandboxed
- Use ONLY: font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
- All styles self-contained in a <style> tag — no external stylesheets
- Light theme: white/light-gray backgrounds, dark text (#111 or #1F2937), high contrast
- 390px wide mobile layout, body margin 0, padding 0, min-height 100vh

VISUAL QUALITY:
- Real, specific content — no Lorem ipsum
- Cards: white bg, border-radius 16px, box-shadow 0 1px 3px rgba(0,0,0,0.08)
- Inputs: border 1.5px solid #E5E7EB, border-radius 10px, padding 12px 14px
- Buttons: border-radius 12px, padding 14px 20px, font-weight 600
- Status bar (9:41 time, battery/signal), bottom safe area

Return ONLY the raw HTML. No markdown. No code fences. Start with <!DOCTYPE html>.`,
        },
      ],
    }),
  ]);

  const metaText = (metaMessage.content[0] as { type: string; text: string }).text;
  const stripped = metaText.replace(/^```(?:json)?\s*/m, '').replace(/\s*```\s*$/m, '').trim();

  let mockHtml = (mockMessage.content[0] as { type: string; text: string }).text.trim();
  mockHtml = mockHtml.replace(/^```html?\s*/i, '').replace(/\s*```\s*$/, '').trim();
  const htmlStart = mockHtml.search(/<!DOCTYPE html>/i);
  if (htmlStart > 0) mockHtml = mockHtml.slice(htmlStart);

  const isValidHtml =
    mockHtml.toLowerCase().includes('<!doctype html') &&
    (mockHtml.toLowerCase().includes('</body>') || mockHtml.toLowerCase().includes('</html>')) &&
    mockHtml.length > 500;

  try {
    const meta = JSON.parse(stripped);
    return NextResponse.json({
      description: meta.description ?? moment.description,
      preview: meta.preview ?? moment.preview,
      mockHtml: isValidHtml ? mockHtml : null,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to parse propagate response' }, { status: 500 });
  }
}
