import { estimateUsdApprox, type TokenUsage } from '@/lib/anthropic-usage';
import { getSupabaseBuilder } from '@/lib/supabase';

export type UsageEventInput = {
  eventType: string;
  status?: 'ok' | 'error';
  route?: string;
  model?: string;
  usage?: Partial<TokenUsage> | null;
  metadata?: Record<string, unknown>;
};

export async function logUsageEvent(input: UsageEventInput): Promise<void> {
  try {
    const inTokens = Math.max(0, Number(input.usage?.input_tokens ?? 0) || 0);
    const outTokens = Math.max(0, Number(input.usage?.output_tokens ?? 0) || 0);
    const cost = estimateUsdApprox({ input_tokens: inTokens, output_tokens: outTokens });

    await getSupabaseBuilder().from('usage_events').insert({
      event_type: input.eventType,
      status: input.status ?? 'ok',
      route: input.route ?? null,
      model: input.model ?? null,
      input_tokens: inTokens,
      output_tokens: outTokens,
      cost_usd_estimate: Number.isFinite(cost) ? cost : 0,
      metadata: input.metadata ?? {},
    });
  } catch (err) {
    // Telemetry must never break user flows.
    console.warn('[usage-events] failed to persist', err);
  }
}
