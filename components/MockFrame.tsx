'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export default function MockFrame({
  html,
  width = 226,
  mode = 'mobile',
}: {
  html: string;
  width?: number;
  mode?: 'mobile' | 'web';
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isFrameLoading, setIsFrameLoading] = useState(true);

  const IS_WEB = mode === 'web';
  const BASE_W = IS_WEB ? 1280 : 390;
  const IFRAME_H = IS_WEB ? 800 : 844;
  const SCREEN_W = width;
  const SCALE = SCREEN_W / BASE_W;
  const SCREEN_H = Math.round(IFRAME_H * SCALE);
  const PADDING = IS_WEB ? 8 : 10;
  const SHELL_W = SCREEN_W + PADDING * 2;
  const SHELL_H = SCREEN_H + PADDING * 2;

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !html) return;
    setIsFrameLoading(true);
    const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();
    }
  }, [html]);

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

  return (
    <div className="relative mx-auto" style={{ width: SHELL_W }}>
      {/* Device/window shell */}
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
          className="relative overflow-hidden bg-black"
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
              style={{ width: Math.round(80 * SCALE), height: Math.round(24 * SCALE), top: Math.round(10 * SCALE), left: '50%', transform: 'translateX(-50%)' }}
            />
          )}

          <iframe
            ref={iframeRef}
            title="Screen preview"
            scrolling="yes"
            sandbox="allow-scripts allow-same-origin"
            onLoad={() => setIsFrameLoading(false)}
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

          {isFrameLoading && (
            <div
              className="absolute inset-0 z-20 flex items-center justify-center bg-zinc-950/80 text-zinc-200 text-[10px] font-medium tracking-wide"
              style={{ borderRadius: IS_WEB ? Math.round(10 * SCALE) : Math.round(28 * SCALE) }}
            >
              Loading screen...
            </div>
          )}
        </div>
      </div>

      {!IS_WEB && (
        <>
          {/* Volume buttons (left) */}
          {[Math.round(100 * SCALE), Math.round(140 * SCALE), Math.round(196 * SCALE)].map((top, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{ left: -3, top, width: 3, height: i === 0 ? Math.round(30 * SCALE) : Math.round(52 * SCALE), background: '#3a3a3c' }}
            />
          ))}
          {/* Power button (right) */}
          <div
            className="absolute rounded-full"
            style={{ right: -3, top: Math.round(148 * SCALE), width: 3, height: Math.round(68 * SCALE), background: '#3a3a3c' }}
          />
        </>
      )}
    </div>
  );
}
