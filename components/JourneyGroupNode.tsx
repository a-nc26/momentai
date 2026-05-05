'use client';

import { useState } from 'react';
import { Handle, NodeProps, Position } from '@xyflow/react';

type JourneyGroupData = {
  journeyId?: string;
  label: string;
  color: string;
  screenCount: number;
  birdsEye?: boolean;
  onRenameJourney?: (journeyId: string, name: string) => void;
};

export default function JourneyGroupNode({ data }: NodeProps) {
  const { label, color, screenCount, birdsEye, journeyId, onRenameJourney } = data as JourneyGroupData;
  const [editing, setEditing] = useState(false);
  const [nextName, setNextName] = useState(label);

  const h =
    '!pointer-events-auto !border-zinc-500 !w-1.5 !h-1.5 !bg-zinc-600 opacity-75 hover:opacity-100 transition-opacity';
  if (birdsEye) {
    return (
      <div
        className="relative w-full h-full rounded-2xl border-2 flex flex-col items-center justify-center gap-2 cursor-default"
        style={{
          borderColor: color,
          background: `${color}10`,
        }}
      >
        <Handle id="in-top" type="target" position={Position.Top} className={h} style={{ left: '38%' }} />
        <Handle id="out-top" type="source" position={Position.Top} className={h} style={{ left: '62%' }} />
        <Handle id="in-right" type="target" position={Position.Right} className={h} style={{ top: '38%' }} />
        <Handle id="out-right" type="source" position={Position.Right} className={h} style={{ top: '62%' }} />
        <Handle id="in-bottom" type="target" position={Position.Bottom} className={h} style={{ left: '38%' }} />
        <Handle id="out-bottom" type="source" position={Position.Bottom} className={h} style={{ left: '62%' }} />
        <Handle id="in-left" type="target" position={Position.Left} className={h} style={{ top: '38%' }} />
        <Handle id="out-left" type="source" position={Position.Left} className={h} style={{ top: '62%' }} />
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
      className="pointer-events-none relative w-full h-full rounded-2xl border"
      style={{
        borderColor: `${color}30`,
        background: `${color}06`,
      }}
    >
      <Handle id="in-top" type="target" position={Position.Top} className={h} style={{ left: '38%' }} />
      <Handle id="out-top" type="source" position={Position.Top} className={h} style={{ left: '62%' }} />
      <Handle id="in-right" type="target" position={Position.Right} className={h} style={{ top: '38%' }} />
      <Handle id="out-right" type="source" position={Position.Right} className={h} style={{ top: '62%' }} />
      <Handle id="in-bottom" type="target" position={Position.Bottom} className={h} style={{ left: '38%' }} />
      <Handle id="out-bottom" type="source" position={Position.Bottom} className={h} style={{ left: '62%' }} />
      <Handle id="in-left" type="target" position={Position.Left} className={h} style={{ top: '38%' }} />
      <Handle id="out-left" type="source" position={Position.Left} className={h} style={{ top: '62%' }} />
      <div className="px-4 py-2.5 flex items-center gap-2 pointer-events-auto">
        <div
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: color }}
        />
        {editing ? (
          <input
            value={nextName}
            onChange={(event) => setNextName(event.target.value)}
            onBlur={() => {
              setEditing(false);
              if (journeyId && onRenameJourney && nextName.trim() && nextName.trim() !== label) {
                onRenameJourney(journeyId, nextName.trim());
              }
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.currentTarget.blur();
              }
              if (event.key === 'Escape') {
                setNextName(label);
                setEditing(false);
              }
            }}
            className="h-6 rounded bg-zinc-900/80 border border-zinc-700 px-1.5 text-xs font-medium uppercase tracking-wider"
            style={{ color }}
            autoFocus
          />
        ) : (
          <button
            type="button"
            onDoubleClick={() => {
              setNextName(label);
              setEditing(true);
            }}
            className="text-xs font-medium uppercase tracking-wider"
            style={{ color }}
            title="Double-click to rename"
          >
            {label}
          </button>
        )}
        <span className="text-zinc-600 text-[10px]">
          {screenCount} screen{screenCount === 1 ? '' : 's'}
        </span>
      </div>
    </div>
  );
}
