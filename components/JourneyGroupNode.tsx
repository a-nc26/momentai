'use client';

import { NodeProps } from '@xyflow/react';

type JourneyGroupData = {
  label: string;
  color: string;
  screenCount: number;
  birdsEye?: boolean;
};

export default function JourneyGroupNode({ data }: NodeProps) {
  const { label, color, screenCount, birdsEye } = data as JourneyGroupData;

  if (birdsEye) {
    return (
      <div
        className="w-full h-full rounded-2xl border-2 flex flex-col items-center justify-center gap-2 cursor-default"
        style={{
          borderColor: color,
          background: `${color}10`,
        }}
      >
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: color }}
        />
        <h3 className="text-white font-semibold text-base">{label}</h3>
        <span className="text-zinc-400 text-xs">
          {screenCount} screen{screenCount === 1 ? '' : 's'}
        </span>
      </div>
    );
  }

  return (
    <div
      className="w-full h-full rounded-2xl border pointer-events-none"
      style={{
        borderColor: `${color}30`,
        background: `${color}06`,
      }}
    >
      <div className="px-4 py-2.5 flex items-center gap-2">
        <div
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: color }}
        />
        <span
          className="text-xs font-medium uppercase tracking-wider"
          style={{ color }}
        >
          {label}
        </span>
        <span className="text-zinc-600 text-[10px]">
          {screenCount} screen{screenCount === 1 ? '' : 's'}
        </span>
      </div>
    </div>
  );
}
