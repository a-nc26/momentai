import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { MAX_TOKENS_RUN_MOMENT, MODEL_RUN_MOMENT } from '@/lib/ai-config';
import { requireBuildCredits } from '@/lib/build-access-server';
import { CREDIT_DEFAULT } from '@/lib/credit-costs';
import { logUsageEvent } from '@/lib/usage-events';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const denied = await requireBuildCredits(req, CREDIT_DEFAULT);
    if (denied) return denied;
    const { promptTemplate, values } = await req.json();

    if (!promptTemplate) {
      return Response.json({ error: 'promptTemplate required' }, { status: 400 });
    }

    // Substitute {{stateKey}} references with actual values
    const prompt = promptTemplate.replace(/\{\{\s*([^}]+)\s*\}\}/g, (_: string, key: string) => {
      const val = values?.[key.trim()];
      if (val === undefined || val === null) return '';
      if (Array.isArray(val)) return val.join(', ');
      return String(val);
    });

    const msg = await client.messages.create({
      model: MODEL_RUN_MOMENT,
      max_tokens: MAX_TOKENS_RUN_MOMENT,
      messages: [{ role: 'user', content: prompt }],
    });

    const response = msg.content
      .filter((b) => b.type === 'text')
      .map((b) => ('text' in b ? b.text : ''))
      .join('')
      .trim();

    await logUsageEvent({
      eventType: 'run_moment',
      route: '/api/run-moment',
      model: MODEL_RUN_MOMENT,
      usage: msg.usage ?? undefined,
    });

    return Response.json({ response });
  } catch (err) {
    await logUsageEvent({
      eventType: 'run_moment',
      status: 'error',
      route: '/api/run-moment',
      model: MODEL_RUN_MOMENT,
      metadata: {
        message: err instanceof Error ? err.message : 'Unknown error',
      },
    });
    return Response.json(
      { error: err instanceof Error ? err.message : 'run-moment failed' },
      { status: 500 }
    );
  }
}
