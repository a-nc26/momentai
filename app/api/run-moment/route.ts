import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
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
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  const response = msg.content
    .filter((b) => b.type === 'text')
    .map((b) => ('text' in b ? b.text : ''))
    .join('')
    .trim();

  return Response.json({ response });
}
