'use client';

import { useEffect, useRef } from 'react';
import DeviceShell from './preview/DeviceShell';

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

  const IS_WEB = mode === 'web';
  const BASE_W = IS_WEB ? 1280 : 390;
  const IFRAME_H = IS_WEB ? 800 : 844;
  const SCREEN_W = width;
  const SCALE = SCREEN_W / BASE_W;
  const SCREEN_H = Math.round(IFRAME_H * SCALE);

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

  const scrollInsidePhone = (deltaY: number) => {
    const iframe = iframeRef.current;
    if (!iframe) return false;
    const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
    const scroller = doc?.scrollingElement;
    if (!scroller) return false;
    const maxScroll = scroller.scrollHeight - scroller.clientHeight;
    if (maxScroll <= 0) return false;
    const previous = scroller.scrollTop;
    const next = Math.max(0, Math.min(maxScroll, previous + deltaY / SCALE));
    const changed = Math.abs(next - previous) > 0.5;
    iframe.contentWindow?.scrollTo({ top: next, behavior: 'auto' });
    return changed;
  };

  return (
    <DeviceShell
      mode={mode}
      baseWidth={BASE_W}
      screenWidth={SCREEN_W}
      screenHeight={SCREEN_H}
      screenBackground="#000"
      onScreenWheel={(e) => {
        if (scrollInsidePhone(e.deltaY)) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
    >
      <iframe
        ref={iframeRef}
        title="Screen preview"
        scrolling="yes"
        sandbox="allow-scripts allow-same-origin allow-forms"
        className="relative z-[1]"
        style={{
          border: 'none',
          width: BASE_W,
          height: IFRAME_H,
          transform: `scale(${SCALE})`,
          transformOrigin: 'top left',
          display: 'block',
          background: 'white',
          pointerEvents: 'auto',
        }}
      />
    </DeviceShell>
  );
}
