/** Simple sliding-window rate limiter for API routes (single-instance; reset on deploy). */

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 40;
const PROPAGATE_MAX_REQUESTS = 20;

type Bucket = { count: number; windowStart: number };

const buckets = new Map<string, Bucket>();

export function clientKeyFromRequest(req: { headers: Headers }): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp;
  return 'unknown';
}

export function allowEditMomentRequest(key: string): boolean {
  const now = Date.now();
  let b = buckets.get(key);
  if (!b || now - b.windowStart > WINDOW_MS) {
    b = { count: 1, windowStart: now };
    buckets.set(key, b);
    return true;
  }
  if (b.count >= MAX_REQUESTS) return false;
  b.count += 1;
  return true;
}

export function allowPropagateBatchRequest(key: string): boolean {
  const now = Date.now();
  let b = buckets.get(`prop:${key}`);
  if (!b || now - b.windowStart > WINDOW_MS) {
    b = { count: 1, windowStart: now };
    buckets.set(`prop:${key}`, b);
    return true;
  }
  if (b.count >= PROPAGATE_MAX_REQUESTS) return false;
  b.count += 1;
  return true;
}
