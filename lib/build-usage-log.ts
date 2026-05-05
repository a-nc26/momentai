'use client';

import { toast } from 'sonner';
import { formatUsageLine, type TokenUsage } from '@/lib/anthropic-usage';
import { sessionLog } from '@/lib/session-log';

/**
 * If an SSE line from POST /api/build-app is the final usage summary, log it to the session log
 * (visible in Session log) so you can track token cost per build.
 */
export function tryLogBuildUsageFromSsePayload(payload: Record<string, unknown>): void {
  if (payload.status !== 'usage') return;
  const total = payload.total as TokenUsage | undefined;
  if (!total || (typeof total.input_tokens !== 'number' && typeof total.output_tokens !== 'number')) {
    return;
  }
  const byMoment = (payload.byMoment ?? {}) as Record<string, TokenUsage>;
  const model = typeof payload.model === 'string' ? payload.model : 'unknown';
  const summary = formatUsageLine(
    {
      input_tokens: total.input_tokens ?? 0,
      output_tokens: total.output_tokens ?? 0,
    },
    'Build (total)'
  );
  const detail: Record<string, { input_tokens: number; output_tokens: number; line: string }> =
    Object.fromEntries(
      Object.entries(byMoment).map(([id, u]) => [id, { ...u, line: formatUsageLine(u, id) }])
    );

  sessionLog('build', summary, { model, byMoment: detail }, 'info');
  toast.success('Build — token usage', { description: summary, duration: 8000 });
}
