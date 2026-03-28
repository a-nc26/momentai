'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

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
  mode = 'mobile',
}: {
  url: string;
  body: object;
  width?: number;
  onComplete?: (html: string) => void;
  /** Stable key that controls when to re-fetch. If omitted, re-fetches whenever body changes.
   *  Pass a string derived only from the fields that matter (e.g. moment id + preview) to
   *  prevent unnecessary restarts when unrelated parts of the appMap change. */
  fetchKey?: string;
  mode?: 'mobile' | 'web';
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(false);
  const [streaming, setStreaming] = useState(false); // true once doc.open() called
  const [retryKey, setRetryKey] = useState(0);

  const IS_WEB = mode === 'web';
  const BASE_W = IS_WEB ? 1280 : 390;
  const SCREEN_W = width;
  const SCALE = SCREEN_W / BASE_W;
  const IFRAME_H = IS_WEB ? 800 : 844;
  const SCREEN_H = Math.round(IFRAME_H * SCALE);
  const PADDING = IS_WEB ? 8 : 10;
  const SHELL_W = SCREEN_W + PADDING * 2;
  const SHELL_H = SCREEN_H + PADDING * 2;

  // Always keep a ref to the latest body so the effect uses fresh data
  const bodyRef = useRef(body);
  bodyRef.current = body;

  // Use fetchKey if provided; otherwise fall back to full body serialisation
  const effectKey = fetchKey ?? JSON.stringify(body);

  const scrollInsidePhone = useCallback(
    (deltaY: number) => {
      const iframe = iframeRef.current;
      if (!iframe) return false;
      const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
      const scroller = doc?.scrollingElement;
      if (!scroller) return false;
      const maxScroll = scroller.scrollHeight - scroller.clientHeight;
      if (maxScroll <= 0) return false;
      const next = Math.max(0, Math.min(maxScroll, scroller.scrollTop + deltaY / SCALE));
      const changed = Math.abs(next - scroller.scrollTop) > 0.5;
      scroller.scrollTop = next;
      return changed;
    },
    [SCALE]
  );

  useEffect(() => {
    const abort = new AbortController();
    setDone(false);
    setError(false);
    setStreaming(false);

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
            setStreaming(true); // content is arriving — hide skeleton
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
          background: IS_WEB ? '#111827' : '#1c1c1e',
          padding: PADDING,
          borderRadius: IS_WEB ? Math.round(16 * SCALE) : Math.round(36 * SCALE),
          boxShadow: IS_WEB
            ? '0 0 0 1px #374151, 0 24px 60px rgba(0,0,0,0.45), inset 0 0 0 1px #4b5563'
            : '0 0 0 1px #3a3a3c, 0 30px 80px rgba(0,0,0,0.6), inset 0 0 0 1px #48484a',
        }}
      >
        {IS_WEB && (
          <div className="absolute left-3 top-2 z-10 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </div>
        )}
        {/* Screen */}
        <div
          className="relative overflow-hidden bg-white"
          style={{
            width: SCREEN_W,
            height: SCREEN_H,
            borderRadius: IS_WEB ? Math.round(10 * SCALE) : Math.round(28 * SCALE),
          }}
          onWheel={(e) => {
            if (scrollInsidePhone(e.deltaY)) {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
        >
          {!IS_WEB && (
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
          )}

          <iframe
            ref={iframeRef}
            title="Screen preview"
            scrolling="yes"
            sandbox="allow-scripts allow-same-origin"
            style={{
              border: 'none',
              width: BASE_W,
              height: IFRAME_H,
              transform: `scale(${SCALE})`,
              transformOrigin: 'top left',
              display: 'block',
              background: 'white',
            }}
          />

          {/* Loading skeleton — shows until streaming begins */}
          {!streaming && !error && (
            <div
              className="absolute inset-0 bg-white flex flex-col"
              style={{ borderRadius: IS_WEB ? Math.round(10 * SCALE) : Math.round(28 * SCALE), padding: Math.round(14 * SCALE) }}
            >
              {/* Status bar */}
              <div className="flex justify-between items-center mb-3" style={{ paddingTop: Math.round(6 * SCALE) }}>
                <div className="rounded" style={{ height: Math.round(6 * SCALE), width: Math.round(28 * SCALE), background: '#e4e4e7' }} />
                <div className="rounded" style={{ height: Math.round(6 * SCALE), width: Math.round(36 * SCALE), background: '#e4e4e7' }} />
              </div>
              {/* Title block */}
              <div className="rounded mb-2" style={{ height: Math.round(14 * SCALE), width: '65%', background: '#e4e4e7' }} />
              <div className="rounded mb-4" style={{ height: Math.round(9 * SCALE), width: '45%', background: '#f0f0f2' }} />
              {/* Card blocks */}
              {[0.85, 0.75, 0.9, 0.6].map((w, i) => (
                <div key={i} className="rounded-lg mb-2" style={{ height: Math.round(38 * SCALE), width: `${w * 100}%`, background: i % 2 === 0 ? '#f4f4f5' : '#efefef' }} />
              ))}
              {/* Spinner + label at bottom */}
              <div className="flex-1 flex flex-col items-center justify-end pb-3 gap-2">
                <div
                  className="rounded-full border-2 border-zinc-200 animate-spin"
                  style={{ width: Math.round(16 * SCALE), height: Math.round(16 * SCALE), borderTopColor: '#6366f1' }}
                />
                <span style={{ fontSize: Math.round(9 * SCALE), color: '#71717a', fontWeight: 600 }}>Loading interactive screen...</span>
                <span style={{ fontSize: Math.round(8 * SCALE), color: '#a1a1aa' }}>You will be able to scroll and click once ready</span>
              </div>
            </div>
          )}

          {/* Error state overlay */}
          {error && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-900/95"
              style={{ borderRadius: IS_WEB ? Math.round(10 * SCALE) : Math.round(28 * SCALE) }}
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
          {!done && !error && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden z-20" style={{ borderBottomLeftRadius: IS_WEB ? Math.round(10 * SCALE) : Math.round(28 * SCALE), borderBottomRightRadius: IS_WEB ? Math.round(10 * SCALE) : Math.round(28 * SCALE) }}>
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
      {!IS_WEB && (
        <>
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
        </>
      )}

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
