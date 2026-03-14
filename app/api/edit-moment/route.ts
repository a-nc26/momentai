import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { Moment, Journey, AppMap } from '@/lib/types';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const {
    moment,
    change,
    journey,
    appMap,
  }: { moment: Moment; change: string; journey: Journey; appMap: AppMap } = await req.json();

  // Build full moment list context for downstream impact analysis
  const allMomentsContext = appMap.moments
    .filter((m) => m.id !== moment.id)
    .map((m) => `  { "id": "${m.id}", "label": "${m.label}", "description": "${m.description.slice(0, 100).replace(/"/g, "'")}" }`)
    .join('\n');

  // Build edge context: edges directly connected to this moment
  const connectedEdges = appMap.edges.filter(
    (e) => e.source === moment.id || e.target === moment.id
  );
  const edgeContext = connectedEdges
    .map((e) => {
      const srcLabel = appMap.moments.find((m) => m.id === e.source)?.label ?? e.source;
      const tgtLabel = appMap.moments.find((m) => m.id === e.target)?.label ?? e.target;
      return `  { "id": "${e.id}", "source": "${e.source}" (${srcLabel}), "target": "${e.target}" (${tgtLabel})${e.label ? `, "label": "${e.label}"` : ''} }`;
    })
    .join('\n');

  // Run metadata update and mock regeneration in parallel
  const [metaMessage, mockMessage] = await Promise.all([
    // 1. Update moment metadata + detect new steps + structural wiring
    client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 3000,
      messages: [
        {
          role: 'user',
          content: `You are editing a specific Moment in an app's Journey Map. Apply the requested change and return ONLY a JSON object — no markdown, no explanation.

Current Moment:
- ID: ${moment.id}
- Journey ID: ${moment.journeyId}
- Label: ${moment.label}
- Type: ${moment.type}
- Description: ${moment.description}
- Preview: ${moment.preview}

Current edges connected to this moment:
${edgeContext || '  (none)'}

Requested change: "${change}"

Return ONLY this JSON:
{
  "label": "updated or unchanged",
  "type": "ui|ai|data|auth",
  "description": "updated or unchanged",
  "preview": "updated or unchanged",
  "newMoments": [],
  "newEdges": [],
  "removedEdgeIds": [],
  "affectedMomentIds": [{"id": "moment-id", "reason": "one sentence why this moment is affected"}]
}

RULES FOR newMoments:
Only add entries if the change introduces a genuinely NEW, distinct step that should appear as its own node (e.g. "add a day picker screen", "add a confirmation step"). Do NOT add new moments for style changes, copy changes, or single-screen additions.

For each new moment:
{
  "id": "unique-lowercase-hyphenated-id",
  "journeyId": "${moment.journeyId}",
  "label": "Short step name",
  "type": "ui|ai|data|auth",
  "description": "What this step does",
  "preview": "Detailed UI description of what appears on this screen"
}

RULES FOR newEdges and removedEdgeIds (CRITICAL — structural wiring):
When inserting new moments, think about where they fit in the existing flow:
- If a new moment logically comes BETWEEN the edited moment and its current downstream targets, you should:
  1. List the downstream edge IDs in "removedEdgeIds" (so those direct connections are cut)
  2. Add edges: edited_moment → new_moment → former_downstream_targets
- If a new moment is a new branch OFF the edited moment (in addition to existing paths), just add the edge without removing anything.
- Always connect every new moment to both an upstream source AND a downstream target where it makes sense.

For newEdges:
{ "id": "edge-unique-id", "source": "source-moment-id", "target": "target-moment-id", "label": "optional short label" }

For removedEdgeIds: list edge IDs (strings) that should be deleted because they are replaced by the new routing.

RULES FOR affectedMomentIds (DOWNSTREAM IMPACT):
After applying this change, identify which OTHER moments in the app are semantically impacted — meaning their behavior, data inputs, or UI would need to change as a result.

All other moments in this app:
${allMomentsContext || '  (none)'}

For each affected moment, return:
{ "id": "moment-id", "reason": "One sentence explaining exactly how this change impacts this moment" }

Only flag moments that are genuinely affected (e.g. they receive data introduced by this change, their copy references something that changed, their flow logic depends on a new step). Do NOT flag unrelated moments. Max 5.`,
        },
      ],
    }),

    // 2. Regenerate the HTML mock incorporating the change (Haiku: 5x faster)
    client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `You are a world-class product designer. Regenerate a pixel-perfect, production-quality HTML mockup for this app screen, incorporating the requested change.

App: ${appMap.appName}
Description: ${appMap.appDescription}
Journey: ${journey.name} — ${journey.description}
Screen: ${moment.label}
Current description: ${moment.description}
Current UI context: ${moment.preview}
CHANGE REQUESTED: "${change}"

Generate a COMPLETE, self-contained HTML document that looks like a real, polished, production app screen incorporating the change above.

CRITICAL TECHNICAL REQUIREMENTS:
- Do NOT use Google Fonts or any external CDN — the iframe is sandboxed
- Use ONLY: font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
- All styles self-contained in a <style> tag — no external stylesheets
- Light theme: white/light-gray backgrounds, dark text (#111 or #1F2937), high contrast
- 390px wide mobile layout, body margin 0, padding 0, min-height 100vh

VISUAL QUALITY:
- Real, specific content — no Lorem ipsum
- Color palette matching "${appMap.appName}" domain
- Cards: white bg, border-radius 16px, box-shadow 0 1px 3px rgba(0,0,0,0.08)
- Inputs: border 1.5px solid #E5E7EB, border-radius 10px, padding 12px 14px
- Buttons: border-radius 12px, padding 14px 20px, font-weight 600
- Status bar (9:41 time, battery/signal), bottom safe area
- Proper typography hierarchy, generous spacing
- Realistic data matching the app

Return ONLY the raw HTML. No markdown. No code fences. Start with <!DOCTYPE html>.`,
        },
      ],
    }),
  ]);

  // Parse metadata
  const metaText = (metaMessage.content[0] as { type: string; text: string }).text;
  const stripped = metaText.replace(/^```(?:json)?\s*/m, '').replace(/\s*```\s*$/m, '').trim();

  // Parse mock HTML — strip fences then seek the actual HTML start
  let mockHtml = (mockMessage.content[0] as { type: string; text: string }).text.trim();
  mockHtml = mockHtml.replace(/^```html?\s*/i, '').replace(/\s*```\s*$/, '').trim();
  const htmlStart = mockHtml.search(/<!DOCTYPE html>/i);
  if (htmlStart > 0) mockHtml = mockHtml.slice(htmlStart);

  // Reject truncated responses — must have closing tags and real body content
  const isValidHtml =
    mockHtml.toLowerCase().includes('<!doctype html') &&
    (mockHtml.toLowerCase().includes('</body>') || mockHtml.toLowerCase().includes('</html>')) &&
    mockHtml.length > 500;

  try {
    const meta = JSON.parse(stripped);

    // Compute smart positions for new moments
    // Try to place them between the edited moment and its downstream nodes
    const outgoingEdges = appMap.edges.filter((e) => e.source === moment.id);
    const downstreamMoments = outgoingEdges
      .map((e) => appMap.moments.find((m) => m.id === e.target))
      .filter(Boolean) as Moment[];

    const newMoments = (meta.newMoments ?? []).map((m: Record<string, unknown>, i: number) => {
      let x: number;
      let y: number;

      if (downstreamMoments.length > 0) {
        // Place between edited moment and average downstream position
        const avgDownstreamX =
          downstreamMoments.reduce((sum, dm) => sum + dm.position.x, 0) / downstreamMoments.length;
        const avgDownstreamY =
          downstreamMoments.reduce((sum, dm) => sum + dm.position.y, 0) / downstreamMoments.length;
        x = Math.round((moment.position.x + avgDownstreamX) / 2) + i * 320;
        y = Math.round((moment.position.y + avgDownstreamY) / 2);
      } else {
        // No downstream — place to the right
        x = moment.position.x + 320 * (i + 1);
        y = moment.position.y;
      }

      return { ...m, position: { x, y } };
    });

    // If new moments are being inserted, the edited moment's screen is structurally
    // unchanged — don't replace its mockHtml with one that incorporates the new step.
    // The new nodes will generate their own screens via lazy-load.
    const finalMockHtml = newMoments.length > 0 ? null : (isValidHtml ? mockHtml : null);

    // Build affectedMoments map: { momentId: reason }
    const affectedMoments: Record<string, string> = {};
    for (const item of (meta.affectedMomentIds ?? [])) {
      if (item?.id && item?.reason) affectedMoments[item.id] = item.reason;
    }

    return NextResponse.json({
      ...meta,
      mockHtml: finalMockHtml,
      newMoments,
      newEdges: meta.newEdges ?? [],
      removedEdgeIds: meta.removedEdgeIds ?? [],
      affectedMoments,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to parse update' }, { status: 500 });
  }
}
