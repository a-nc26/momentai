'use client';

import { useEffect, useRef } from 'react';

// iPhone-style phone frame — width is the inner screen width in px
export default function MockFrame({ html, width = 226 }: { html: string; width?: number }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const SCREEN_W = width;
  const SCALE = SCREEN_W / 390;
  const IFRAME_H = 642;
  const SCREEN_H = Math.round(IFRAME_H * SCALE);
  const PADDING = 10;
  const SHELL_W = SCREEN_W + PADDING * 2;
  const SHELL_H = SCREEN_H + PADDING * 2;

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !html) return;
    const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();
    }
  }, [html]);

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
          className="relative overflow-hidden bg-black"
          style={{ width: SCREEN_W, height: SCREEN_H, borderRadius: Math.round(28 * SCALE) }}
        >
          {/* Dynamic island */}
          <div
            className="absolute z-10 rounded-full bg-black"
            style={{ width: Math.round(80 * SCALE), height: Math.round(24 * SCALE), top: Math.round(10 * SCALE), left: '50%', transform: 'translateX(-50%)' }}
          />

          <iframe
            ref={iframeRef}
            title="Screen preview"
            scrolling="no"
            sandbox="allow-scripts allow-same-origin"
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
        </div>
      </div>

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
    </div>
  );
}
