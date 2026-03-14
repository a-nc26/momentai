'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Like MockFrame but fetches and streams the HTML directly into the iframe
 * as chunks arrive — so the screen starts rendering in ~1s instead of waiting
 * for the full response. Calls onComplete(html) when the stream finishes.
 */
export default function StreamingMockFrame({
  url,
  body,
  width = 226,
  onComplete,
  fetchKey,
}: {
  url: string;
  body: object;
  width?: number;
  onComplete?: (html: string) => void;
  /** Stable key that controls when to re-fetch. If omitted, re-fetches whenever body changes.
   *  Pass a string derived only from the fields that matter (e.g. moment id + preview) to
   *  prevent unnecessary restarts when unrelated parts of the appMap change. */
  fetchKey?: string;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  const SCREEN_W = width;
  const SCALE = SCREEN_W / 390;
  const IFRAME_H = 642;
  const SCREEN_H = Math.round(IFRAME_H * SCALE);
  const PADDING = 10;
  const SHELL_W = SCREEN_W + PADDING * 2;
  const SHELL_H = SCREEN_H + PADDING * 2;

  // Always keep a ref to the latest body so the effect uses fresh data
  const bodyRef = useRef(body);
  bodyRef.current = body;

  // Use fetchKey if provided; otherwise fall back to full body serialisation
  const effectKey = fetchKey ?? JSON.stringify(body);

  useEffect(() => {
    const abort = new AbortController();
    setDone(false);
    setError(false);

    let accumulated = '';
    let docOpened = false;
    let doc: Document | null = null;

    const run = async () => {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyRef.current),
        signal: abort.signal,
      });

      if (!res.ok || !res.body) {
        setError(true);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done: streamDone, value } = await reader.read();

        if (value) {
          accumulated += decoder.decode(value, { stream: !streamDone });

          // Wait until we have <!DOCTYPE html> before writing to the iframe
          if (!docOpened) {
            const htmlStart = accumulated.search(/<!DOCTYPE html>/i);
            if (htmlStart < 0) continue; // buffering preamble
            accumulated = accumulated.slice(htmlStart);

            const iframe = iframeRef.current;
            if (!iframe) break;
            doc = iframe.contentDocument ?? iframe.contentWindow?.document ?? null;
            if (!doc) break;
            doc.open();
            docOpened = true;
          }

          if (doc) doc.write(accumulated);
          accumulated = '';
        }

        if (streamDone) break;
      }

      if (doc && docOpened) {
        doc.close();
        setDone(true);
      } else {
        // Stream ended without finding valid HTML
        setError(true);
      }

      // Rebuild final HTML from the iframe for caching
      if (onComplete && iframeRef.current) {
        const finalHtml =
          iframeRef.current.contentDocument?.documentElement?.outerHTML ?? '';
        if (finalHtml.length > 200) {
          onComplete(`<!DOCTYPE html>\n${finalHtml}`);
        }
      }
    };

    run().catch((e) => {
      if (e.name !== 'AbortError') {
        console.error('StreamingMockFrame error:', e);
        setError(true);
      }
    });

    return () => abort.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, effectKey, retryKey]);

  return (
    <div className="relative mx-auto" style={{ width: SHELL_W }}>
      {/* Phone shell */}
      <div
        className="relative"
        style={{
          width: SHELL_W,
          height: SHELL_H,
          background: '#1c1c1e',
          padding: PADDING,
          borderRadius: Math.round(36 * SCALE),
          boxShadow: '0 0 0 1px #3a3a3c, 0 30px 80px rgba(0,0,0,0.6), inset 0 0 0 1px #48484a',
        }}
      >
        {/* Screen */}
        <div
          className="relative overflow-hidden bg-white"
          style={{ width: SCREEN_W, height: SCREEN_H, borderRadius: Math.round(28 * SCALE) }}
        >
          {/* Dynamic island */}
          <div
            className="absolute z-10 rounded-full bg-black"
            style={{
              width: Math.round(80 * SCALE),
              height: Math.round(24 * SCALE),
              top: Math.round(10 * SCALE),
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          />

          <iframe
            ref={iframeRef}
            title="Screen preview"
            scrolling="no"
            style={{
              border: 'none',
              width: 390,
              height: IFRAME_H,
              transform: `scale(${SCALE})`,
              transformOrigin: 'top left',
              display: 'block',
              background: 'white',
            }}
          />

          {/* Error state overlay */}
          {error && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-900/95"
              style={{ borderRadius: Math.round(28 * SCALE) }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-zinc-600">
                <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
                <path d="M10 6v4M10 13v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <p className="text-zinc-500 text-[10px] text-center px-4">Failed to generate</p>
              <button
                onClick={() => setRetryKey((k) => k + 1)}
                className="text-[10px] text-indigo-400 hover:text-indigo-300 border border-indigo-500/30 hover:border-indigo-400/50 px-3 py-1.5 rounded-lg transition-all"
              >
                Retry
              </button>
            </div>
          )}

          {/* Streaming progress bar — disappears when done */}
          {!done && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden" style={{ borderBottomLeftRadius: Math.round(28 * SCALE), borderBottomRightRadius: Math.round(28 * SCALE) }}>
              <div
                className="h-full bg-indigo-500 opacity-70"
                style={{
                  width: '40%',
                  animation: 'stream-slide 1.4s ease-in-out infinite',
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Volume buttons */}
      {[Math.round(100 * SCALE), Math.round(140 * SCALE), Math.round(196 * SCALE)].map(
        (top, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              left: -3,
              top,
              width: 3,
              height: i === 0 ? Math.round(30 * SCALE) : Math.round(52 * SCALE),
              background: '#3a3a3c',
            }}
          />
        )
      )}
      {/* Power button */}
      <div
        className="absolute rounded-full"
        style={{
          right: -3,
          top: Math.round(148 * SCALE),
          width: 3,
          height: Math.round(68 * SCALE),
          background: '#3a3a3c',
        }}
      />

      <style>{`
        @keyframes stream-slide {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(250%); }
          100% { transform: translateX(250%); }
        }
      `}</style>
    </div>
  );
}
