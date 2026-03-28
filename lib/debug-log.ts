/**
 * Sends a log entry to /api/log so it appears in the dev terminal.
 * Fire-and-forget — never throws.
 */
export function debugLog(
  tag: string,
  message: string,
  data?: unknown,
  level: 'debug' | 'warn' | 'error' = 'debug'
) {
  if (typeof window === 'undefined') return;
  fetch('/api/log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ level, tag, message, data }),
  }).catch(() => {/* swallow */});
}
