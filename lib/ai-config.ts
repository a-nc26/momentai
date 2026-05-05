/** Centralized model IDs and token limits for LLM routes. */

export const MODEL_EDIT_MOMENT = 'claude-sonnet-4-6';
export const MAX_TOKENS_EDIT_MOMENT = 16384;

export const MODEL_BUILD_APP = 'claude-sonnet-4-6';
export const MAX_TOKENS_BUILD_APP = 16384;

export const MODEL_PROPAGATE_BATCH = 'claude-haiku-4-5-20251001';
export const MAX_TOKENS_PROPAGATE_BATCH = 512;

/** Runtime AI step (/api/run-moment) — match builder quality. */
export const MODEL_RUN_MOMENT = MODEL_BUILD_APP;
export const MAX_TOKENS_RUN_MOMENT = 4096;

/**
 * Extracts code text from an Anthropic message and checks whether it was truncated.
 * Throws with a clear message when the model hit max_tokens so callers can retry
 * with a "make it shorter" hint instead of a misleading "fix syntax" hint.
 */
export function extractCodeOrThrowOnTruncation(
  message: { content: Array<{ type: string; text?: string }>; stop_reason: string | null },
  label: string
): string {
  const block = message.content[0] as { type: string; text: string };
  const raw = (block?.text ?? '').trim();

  if (message.stop_reason === 'max_tokens') {
    console.error(`[${label}] Output truncated (stop_reason=max_tokens). Length=${raw.length}`);
    throw new TruncationError(
      `Model output was truncated (hit max_tokens). The component is too long. ` +
        `Simplify the screen: fewer nested elements, shorter strings, and avoid duplicating large blocks.`
    );
  }

  return raw;
}

export class TruncationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TruncationError';
  }
}
