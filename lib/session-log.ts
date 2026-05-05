export type SessionLogLevel = 'info' | 'warn' | 'error' | 'debug';

export type SessionLogEntry = {
  t: string;
  level: SessionLogLevel;
  scope: string;
  message: string;
  data?: unknown;
};

const MAX_ENTRIES = 500;
const entries: SessionLogEntry[] = [];

export function sessionLog(
  scope: string,
  message: string,
  data?: unknown,
  level: SessionLogLevel = 'info'
) {
  const row: SessionLogEntry = {
    t: new Date().toISOString(),
    level,
    scope,
    message,
    data,
  };
  entries.push(row);
  if (entries.length > MAX_ENTRIES) {
    entries.splice(0, entries.length - MAX_ENTRIES);
  }
}

export function clearSessionLog() {
  entries.length = 0;
}

export function getSessionLogEntries(): SessionLogEntry[] {
  return [...entries];
}

export function formatSessionLogText(): string {
  const snap = getSessionLogSnapshot();
  const lines: string[] = [
    'MomentAI session log',
    `Generated: ${snap.generatedAt}`,
    `URL: ${snap.href}`,
    `UA: ${snap.userAgent}`,
    '---',
    ...snap.entries.map((e) => {
      const extra =
        e.data !== undefined
          ? ` ${safeStringify(e.data)}`
          : '';
      return `[${e.t}] ${e.level.toUpperCase()} [${e.scope}] ${e.message}${extra}`;
    }),
  ];
  return lines.join('\n');
}

export function getSessionLogSnapshot() {
  return {
    generatedAt: new Date().toISOString(),
    href: typeof window !== 'undefined' ? window.location.href : '',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    entries: getSessionLogEntries(),
  };
}

function safeStringify(v: unknown): string {
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

let consolePatched = false;

/** Optional: forward console.log/warn/error into the session buffer (verbose). */
export function startConsoleCapture() {
  if (typeof window === 'undefined' || consolePatched) return;
  consolePatched = true;
  const orig = {
    log: console.log.bind(console),
    warn: console.warn.bind(console),
    error: console.error.bind(console),
  };
  console.log = (...args: unknown[]) => {
    sessionLog('console', args.map(String).join(' '), undefined, 'debug');
    orig.log(...args);
  };
  console.warn = (...args: unknown[]) => {
    sessionLog('console', args.map(String).join(' '), undefined, 'warn');
    orig.warn(...args);
  };
  console.error = (...args: unknown[]) => {
    sessionLog('console', args.map(String).join(' '), undefined, 'error');
    orig.error(...args);
  };
}

export function initSessionLog() {
  if (typeof window === 'undefined') return;

  sessionLog('session', 'Session log initialized');

  window.addEventListener('error', (e: ErrorEvent) => {
    sessionLog(
      'window',
      e.message || 'error',
      {
        filename: e.filename,
        lineno: e.lineno,
        colno: e.colno,
        stack: e.error && e.error instanceof Error ? e.error.stack : undefined,
      },
      'error'
    );
  });

  window.addEventListener('unhandledrejection', (e: PromiseRejectionEvent) => {
    const reason =
      e.reason instanceof Error
        ? e.reason.message
        : typeof e.reason === 'string'
          ? e.reason
          : safeStringify(e.reason);
    sessionLog(
      'promise',
      `Unhandled rejection: ${reason}`,
      e.reason instanceof Error ? { stack: e.reason.stack } : { reason: e.reason },
      'error'
    );
  });
}
