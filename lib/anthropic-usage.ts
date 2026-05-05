/**
 * Normalized token usage from Anthropic Messages API responses.
 * https://docs.anthropic.com/en/api/messages
 */
export type TokenUsage = {
  input_tokens: number;
  output_tokens: number;
};

export function emptyUsage(): TokenUsage {
  return { input_tokens: 0, output_tokens: 0 };
}

export function addUsage(
  a: TokenUsage,
  b?: { input_tokens?: number | null; output_tokens?: number | null } | null
): TokenUsage {
  if (!b) return a;
  return {
    input_tokens: a.input_tokens + (b.input_tokens ?? 0),
    output_tokens: a.output_tokens + (b.output_tokens ?? 0),
  };
}

/** Mutate acc with message.usage (Anthropic Messages API). */
export function mergeMessageUsage(
  acc: TokenUsage,
  message: { usage?: { input_tokens?: number; output_tokens?: number } | null }
): void {
  const u = message.usage;
  if (!u) return;
  acc.input_tokens += u.input_tokens ?? 0;
  acc.output_tokens += u.output_tokens ?? 0;
}

export function sumUsages(usages: TokenUsage[]): TokenUsage {
  return usages.reduce((acc, u) => addUsage(acc, u), emptyUsage());
}

/** Sonnet 4.x list price (USD per MTok) — approximate; update if pricing changes. */
const APPROX_INPUT_PER_MTOK_USD = 3;
const APPROX_OUTPUT_PER_MTOK_USD = 15;

export function estimateUsdApprox(usage: TokenUsage): number {
  const inM = usage.input_tokens / 1_000_000;
  const outM = usage.output_tokens / 1_000_000;
  return inM * APPROX_INPUT_PER_MTOK_USD + outM * APPROX_OUTPUT_PER_MTOK_USD;
}

export function formatUsageLine(usage: TokenUsage, label = 'tokens'): string {
  const total = usage.input_tokens + usage.output_tokens;
  const usd = estimateUsdApprox(usage);
  return `${label}: ${usage.input_tokens.toLocaleString()} in + ${usage.output_tokens.toLocaleString()} out = ${total.toLocaleString()} total (~$${usd.toFixed(3)} est.)`;
}
