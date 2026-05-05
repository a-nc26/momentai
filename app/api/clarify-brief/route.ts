import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { requireBuildCredits } from '@/lib/build-access-server';
import { CREDIT_CLARIFY_BRIEF } from '@/lib/credit-costs';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const CLARIFY_MODEL = 'claude-haiku-4-5-20251001';
const CLARIFY_MAX_TOKENS = 1200;

type ClarifyReady = { needsInput: false; ready: true; brief: string };
type ClarifyAsk = { needsInput: true; questions: string[]; ready: false };
type ClarifyBriefResponse = ClarifyReady | ClarifyAsk;

function parseClarifyJson(text: string): ClarifyBriefResponse | null {
  const trimmed = text.trim();
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed.slice(start, end + 1)) as Record<string, unknown>;
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== 'object') return null;
  const o = parsed as Record<string, unknown>;
  if (o.ready === true && typeof o.brief === 'string' && o.brief.trim().length > 0) {
    return { needsInput: false, ready: true, brief: o.brief.trim() };
  }
  if (o.needsInput === true && Array.isArray(o.questions) && o.questions.every((q) => typeof q === 'string')) {
    return { needsInput: true, questions: o.questions.filter((q) => q.trim().length > 0).slice(0, 5), ready: false };
  }
  return null;
}

export async function POST(req: NextRequest) {
  const { description, platform = 'mobile' } = await req.json();
  if (!description?.trim()) {
    return Response.json({ error: 'Please enter a short app description first.' }, { status: 400 });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: 'Missing ANTHROPIC_API_KEY on the server.' }, { status: 500 });
  }
  const denied = await requireBuildCredits(req, CREDIT_CLARIFY_BRIEF);
  if (denied) return denied;

  const d = description.trim();
  const plat = platform === 'web' ? 'web' : 'mobile';

  const userPrompt = `The user is designing a ${plat} app. They wrote:

---
${d}
---

Decide: is this enough to generate a high-quality app journey map (audience, main goals, 2+ core flows, key screens implied)?

Return ONLY a JSON object (no markdown) with one of:
1) { "ready": true, "needsInput": false, "brief": "<single string: improved, structured spec the generator will use. Include platform ${plat} and preserve every concrete detail.>" }
2) { "ready": false, "needsInput": true, "questions": [ "2-4 short specific questions" ] }

Use option 1 when the text is specific enough (e.g. ~50+ words with concrete features, or already names audiences + flows). Use option 2 when the request is one line, very vague, or missing critical product choices (audience, monetization, must-have features, or web vs app assumptions not stated for ambiguous cases).`;

  try {
    const msg = await client.messages.create({
      model: CLARIFY_MODEL,
      max_tokens: CLARIFY_MAX_TOKENS,
      messages: [{ role: 'user', content: userPrompt }],
    });
    const block = msg.content[0];
    const text = block && block.type === 'text' ? block.text : '';
    const out = parseClarifyJson(text);
    if (out) {
      if (out.needsInput && out.questions.length < 1) {
        return Response.json({ needsInput: false, ready: true, brief: d } satisfies ClarifyReady);
      }
      return Response.json(out);
    }
  } catch (e) {
    console.error('clarify-brief:', e);
  }

  // Safe fallback: do not block generation
  return Response.json({ needsInput: false, ready: true, brief: d } satisfies ClarifyReady);
}
