'use client';

import { useEffect } from 'react';
import { debugLog } from '@/lib/debug-log';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global application error:', error);
    debugLog('GlobalError', error.message, {
      stack: error.stack,
      digest: error.digest,
    }, 'error');
  }, [error]);

  const handleReloadBuilder = () => {
    window.location.href = '/app';
  };

  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-950 text-white">
        <div className="min-h-screen flex items-center justify-center px-6">
          <div className="w-full max-w-lg rounded-3xl border border-zinc-800 bg-zinc-900/80 p-8 shadow-[0_32px_100px_rgba(0,0,0,0.45)]">
            <p className="text-[11px] uppercase tracking-[0.2em] text-amber-400 font-medium">Recovery</p>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight">The app hit a bad client-side state.</h1>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">
              This usually means the current in-memory project hit malformed runtime data. Reloading the builder starts a fresh session and usually gets you moving again immediately.
            </p>

            <div className="mt-6 flex flex-col gap-3">
              <button
                onClick={handleReloadBuilder}
                className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
              >
                Reload Builder
              </button>
              <button
                onClick={() => reset()}
                className="w-full rounded-xl border border-zinc-700 px-4 py-3 text-sm font-medium text-zinc-200 transition-colors hover:border-zinc-500 hover:text-white"
              >
                Try Again
              </button>
            </div>

            {error?.digest && (
              <p className="mt-4 text-[11px] text-zinc-600">Error ID: {error.digest}</p>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
