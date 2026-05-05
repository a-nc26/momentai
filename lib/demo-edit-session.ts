/**
 * One demo NL edit per browser tab session (sessionStorage), reset when user
 * starts a fresh Pulse demo map (Reset demo / PromptScreen demo flow).
 */

const KEY = 'momentai.demo.editConsumed';

type Listener = () => void;
const listeners = new Set<Listener>();

function notify(): void {
  for (const cb of listeners) cb();
}

export function isDemoEditConsumed(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return sessionStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

export function markDemoEditConsumed(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(KEY, '1');
  } catch {
    // ignore
  }
  notify();
}

export function clearDemoEditConsumed(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // ignore
  }
  notify();
}

export function subscribeDemoEditSession(onChange: Listener): () => void {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}
