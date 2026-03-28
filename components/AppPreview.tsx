'use client';

import { useEffect, useRef } from 'react';

interface AppPreviewProps {
  html: string | null;
  url: string | null;
  platform: 'mobile' | 'web';
  isBuilding?: boolean;
  currentMomentId?: string | null;
  onMomentChange?: (momentId: string) => void;
}

export default function AppPreview({
  html,
  url,
  platform,
  isBuilding,
  currentMomentId,
  onMomentChange,
}: AppPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Listen for navigation events from the iframe
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'screenChanged' && e.data.momentId) {
        onMomentChange?.(e.data.momentId);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [onMomentChange]);

  // Send navigation commands into the iframe
  useEffect(() => {
    if (!currentMomentId) return;
    const iframe = iframeRef.current;
    if (!iframe?.contentWindow) return;
    iframe.contentWindow.postMessage({ type: 'navigate', momentId: currentMomentId }, '*');
  }, [currentMomentId]);

  const hasContent = html || url;

  if (platform === 'web') {
    return (
      <div className="flex-[3] min-w-0 border-l border-zinc-800 flex flex-col bg-zinc-950">
        {/* Browser chrome bar */}
        <div className="h-9 bg-zinc-900 border-b border-zinc-800 flex items-center px-3 gap-2 shrink-0">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
          </div>
          <div className="flex-1 bg-zinc-800 rounded-md h-5 flex items-center px-2 mx-2">
            <span className="text-zinc-600 text-[10px] font-mono truncate">your-app.momentai.app</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 relative">
          {isBuilding || !hasContent ? (
            <WebSkeleton isBuilding={!!isBuilding} />
          ) : (
            <iframe
              ref={iframeRef}
              srcDoc={html ?? undefined}
              src={!html && url ? url : undefined}
              className="w-full h-full border-0 bg-white"
              sandbox="allow-scripts allow-same-origin allow-forms"
              title="App Preview"
            />
          )}
        </div>
      </div>
    );
  }

  // Mobile
  return (
    <div className="w-[420px] shrink-0 border-l border-zinc-800 flex items-center justify-center bg-zinc-950 py-6">
      {isBuilding || !hasContent ? (
        <MobileSkeleton isBuilding={!!isBuilding} />
      ) : (
        <div className="flex flex-col items-center gap-3">
          {/* Phone frame */}
          <div className="relative">
            {/* Outer shell */}
            <div className="w-[320px] bg-zinc-900 rounded-[40px] border-[3px] border-zinc-700 shadow-2xl overflow-hidden">
              {/* Notch */}
              <div className="h-8 bg-zinc-900 flex items-center justify-center">
                <div className="w-20 h-4 bg-zinc-800 rounded-b-xl" />
              </div>
              {/* Screen */}
              <div className="h-[600px] bg-white overflow-hidden relative">
                <iframe
                  ref={iframeRef}
                  srcDoc={html ?? undefined}
                  src={!html && url ? url : undefined}
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-same-origin allow-forms"
                  title="App Preview"
                  style={{ transform: 'scale(0.82)', transformOrigin: 'top left', width: '122%', height: '122%' }}
                />
              </div>
              {/* Home indicator */}
              <div className="h-6 bg-zinc-900 flex items-center justify-center">
                <div className="w-24 h-1 bg-zinc-600 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MobileSkeleton({ isBuilding }: { isBuilding: boolean }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-[320px] bg-zinc-900 rounded-[40px] border-[3px] border-zinc-800 overflow-hidden">
        <div className="h-8 bg-zinc-900 flex items-center justify-center">
          <div className="w-20 h-4 bg-zinc-800 rounded-b-xl" />
        </div>
        <div className="h-[600px] bg-zinc-950 flex flex-col items-center justify-center gap-4 px-8">
          {isBuilding ? (
            <>
              <span className="w-6 h-6 rounded-full border-2 border-zinc-700 border-t-indigo-400 animate-spin" />
              <div className="text-center space-y-1.5">
                <p className="text-zinc-400 text-sm font-medium">Building your app…</p>
                <p className="text-zinc-600 text-xs">Claude is generating real working code</p>
              </div>
              <div className="w-full space-y-2 mt-4">
                <div className="h-10 bg-zinc-900 rounded-xl animate-pulse" />
                <div className="h-10 bg-zinc-900 rounded-xl animate-pulse" />
                <div className="h-24 bg-zinc-900 rounded-xl animate-pulse" />
                <div className="h-10 bg-indigo-900/30 rounded-xl animate-pulse" />
              </div>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-2xl bg-zinc-900 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <rect x="1.5" y="1.5" width="6" height="6" rx="1" stroke="#52525b" strokeWidth="1.4"/>
                  <rect x="10.5" y="1.5" width="6" height="6" rx="1" stroke="#52525b" strokeWidth="1.4"/>
                  <rect x="1.5" y="10.5" width="6" height="6" rx="1" stroke="#52525b" strokeWidth="1.4"/>
                  <rect x="10.5" y="10.5" width="6" height="6" rx="1" stroke="#52525b" strokeWidth="1.4"/>
                </svg>
              </div>
              <p className="text-zinc-600 text-xs text-center">No app preview yet</p>
            </>
          )}
        </div>
        <div className="h-6 bg-zinc-900 flex items-center justify-center">
          <div className="w-24 h-1 bg-zinc-800 rounded-full" />
        </div>
      </div>
    </div>
  );
}

function WebSkeleton({ isBuilding }: { isBuilding: boolean }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-zinc-950">
      {isBuilding ? (
        <>
          <span className="w-6 h-6 rounded-full border-2 border-zinc-700 border-t-indigo-400 animate-spin" />
          <div className="text-center space-y-1.5">
            <p className="text-zinc-400 text-sm font-medium">Building your app…</p>
            <p className="text-zinc-600 text-xs">Claude is generating real working code</p>
          </div>
        </>
      ) : (
        <>
          <div className="w-10 h-10 rounded-2xl bg-zinc-900 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="1.5" y="1.5" width="6" height="6" rx="1" stroke="#52525b" strokeWidth="1.4"/>
              <rect x="10.5" y="1.5" width="6" height="6" rx="1" stroke="#52525b" strokeWidth="1.4"/>
              <rect x="1.5" y="10.5" width="6" height="6" rx="1" stroke="#52525b" strokeWidth="1.4"/>
              <rect x="10.5" y="10.5" width="6" height="6" rx="1" stroke="#52525b" strokeWidth="1.4"/>
            </svg>
          </div>
          <p className="text-zinc-600 text-xs">No app preview yet</p>
        </>
      )}
    </div>
  );
}
