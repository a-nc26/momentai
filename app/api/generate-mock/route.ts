import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { Moment, Journey, AppMap } from '@/lib/types';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { moment, journey, appMap }: { moment: Moment; journey: Journey; appMap: AppMap } =
    await req.json();
  const platform = appMap.appPlatform === 'web' ? 'web' : 'mobile';
  const viewportLine =
    platform === 'web'
      ? 'Viewport: 1280px wide desktop web layout with realistic top navigation and page body'
      : 'Viewport: 390px wide mobile layout';
  const statusBarRule =
    platform === 'web'
      ? '- Include desktop page chrome where appropriate (top nav/sidebar/content area)'
      : '- Status bar: show time "9:41" on left, battery + signal on right, 44px tall';
  const safeAreaRule =
    platform === 'web'
      ? '- Use comfortable desktop spacing, sections, and cards with clear hierarchy'
      : '- Bottom safe area: 20px padding';

  const stream = client.messages.stream({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: `You are a world-class product designer and frontend engineer. Generate a pixel-perfect, production-quality HTML mockup for a specific app screen.

App: ${appMap.appName}
Description: ${appMap.appDescription}
Platform: ${platform}
Journey: ${journey.name} — ${journey.description}
Screen: ${moment.label}
What it does: ${moment.description}
UI context: ${moment.preview}

Generate a COMPLETE, self-contained HTML document that looks like a real, polished, production app screen.

CRITICAL TECHNICAL REQUIREMENTS:
- Do NOT use Google Fonts or any external CDN — the iframe is sandboxed and external fonts will not load
- Use ONLY this font stack: font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
- All styles must be self-contained in a <style> tag in the <head>
- Light theme (white/near-white backgrounds, dark text — ensure high contrast)
- ${viewportLine}
- Body: margin: 0, padding: 0, min-height: 100vh, background white or #F8F9FA

VISUAL QUALITY RULES:
- Real, specific content — no "Lorem ipsum" — use realistic data matching "${appMap.appName}"
- Typography hierarchy: page title 24-28px 700, section headers 16-18px 600, body 15px 400 #374151, secondary 13px #6B7280
- Cards: background white, border-radius 16px, box-shadow 0 1px 3px rgba(0,0,0,0.08), padding 16-20px
- Inputs: border 1.5px solid #E5E7EB, border-radius 10px, padding 12px 14px, font-size 15px, width 100%, box-sizing border-box
- Primary buttons: border-radius 12px, padding 14px 20px, font-weight 600, font-size 15px, width 100%
- ${statusBarRule}
- ${safeAreaRule}

Return ONLY the raw HTML document. No markdown. No code fences. No explanation. Start with <!DOCTYPE html>.`,
      },
    ],
  });

  // Stream raw text chunks directly to the client
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        if (
          event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta'
        ) {
          controller.enqueue(encoder.encode(event.delta.text));
        }
      }
      controller.close();
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
