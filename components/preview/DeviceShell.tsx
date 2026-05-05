'use client';

import type { ReactNode, WheelEventHandler } from 'react';

type DeviceShellProps = {
  mode?: 'mobile' | 'web';
  baseWidth: number;
  screenWidth: number;
  screenHeight: number;
  screenBackground?: string;
  onScreenWheel?: WheelEventHandler<HTMLDivElement>;
  children: ReactNode;
};

export default function DeviceShell({
  mode = 'mobile',
  baseWidth,
  screenWidth,
  screenHeight,
  screenBackground = '#000',
  onScreenWheel,
  children,
}: DeviceShellProps) {
  const isWeb = mode === 'web';
  const scale = Math.max(0.1, screenWidth / baseWidth);
  const padding = isWeb ? 8 : 10;
  const shellWidth = screenWidth + padding * 2;
  const shellHeight = screenHeight + padding * 2;
  const screenRadius = isWeb ? Math.round(10 * scale) : Math.round(28 * scale);

  return (
    <div className="relative mx-auto" style={{ width: shellWidth }}>
      <div
        className="relative"
        style={{
          width: shellWidth,
          height: shellHeight,
          background: isWeb ? '#111827' : '#1c1c1e',
          padding,
          borderRadius: isWeb ? Math.round(16 * scale) : Math.round(36 * scale),
          boxShadow: isWeb
            ? '0 0 0 1px #374151, 0 24px 60px rgba(0,0,0,0.45), inset 0 0 0 1px #4b5563'
            : '0 0 0 1px #3a3a3c, 0 30px 80px rgba(0,0,0,0.6), inset 0 0 0 1px #48484a',
        }}
      >
        {isWeb && (
          <div className="absolute left-3 top-2 z-10 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </div>
        )}

        <div
          className="relative overflow-hidden"
          style={{
            width: screenWidth,
            height: screenHeight,
            borderRadius: screenRadius,
            background: screenBackground,
          }}
          onWheel={onScreenWheel}
        >
          {!isWeb && (
            <div
              className="pointer-events-none absolute z-10 rounded-full bg-black"
              style={{
                width: Math.round(80 * scale),
                height: Math.round(24 * scale),
                top: Math.round(10 * scale),
                left: '50%',
                transform: 'translateX(-50%)',
              }}
              aria-hidden
            />
          )}
          {children}
        </div>
      </div>

      {!isWeb && (
        <>
          {[Math.round(100 * scale), Math.round(140 * scale), Math.round(196 * scale)].map(
            (top, idx) => (
              <div
                key={idx}
                className="absolute rounded-full"
                style={{
                  left: -3,
                  top,
                  width: 3,
                  height: idx === 0 ? Math.round(30 * scale) : Math.round(52 * scale),
                  background: '#3a3a3c',
                }}
              />
            )
          )}
          <div
            className="absolute rounded-full"
            style={{
              right: -3,
              top: Math.round(148 * scale),
              width: 3,
              height: Math.round(68 * scale),
              background: '#3a3a3c',
            }}
          />
        </>
      )}
    </div>
  );
}
