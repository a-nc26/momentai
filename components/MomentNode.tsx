'use client';

import { Handle, Position, NodeProps } from '@xyflow/react';
import { Badge } from '@/components/ui/badge';
import { Moment } from '@/lib/types';

const TYPE_ICONS: Record<string, string> = {
  ui: '🖥',
  ai: '✦',
  data: '⬡',
  auth: '⬡',
};

const TYPE_LABELS: Record<string, string> = {
  ui: 'UI',
  ai: 'AI',
  data: 'Data',
  auth: 'Auth',
};

type MomentNodeData = {
  moment: Moment;
  color: string;
  journeyName: string;
  flagged?: boolean;
  flagReason?: string;
};

export default function MomentNode({ data, selected }: NodeProps) {
  const { moment, color, journeyName, flagged, flagReason } = data as MomentNodeData;

  return (
    <div
      className="w-[220px] rounded-xl bg-zinc-900 shadow-2xl transition-all duration-150 cursor-pointer select-none"
      style={{
        borderLeft: `3px solid ${flagged ? '#f59e0b' : color}`,
        outline: flagged
          ? '2px solid #f59e0b'
          : selected
          ? `2px solid ${color}`
          : '2px solid transparent',
        outlineOffset: '3px',
        boxShadow: flagged
          ? '0 0 0 4px rgba(245,158,11,0.12), 0 0 24px rgba(245,158,11,0.18)'
          : selected
          ? `0 0 0 4px ${color}22, 0 0 28px ${color}30`
          : undefined,
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-zinc-600 !border-zinc-500 !w-2 !h-2"
      />

      <div className="p-4">
        {/* Journey label */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: flagged ? '#f59e0b' : color }}>
            {journeyName}
          </span>
          {flagged ? (
            <span
              className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
              style={{ color: '#f59e0b', background: 'rgba(245,158,11,0.12)' }}
            >
              Review
            </span>
          ) : selected ? (
            <span
              className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
              style={{ color, background: `${color}18` }}
            >
              Editing
            </span>
          ) : (
            <Badge
              variant="outline"
              className="text-[10px] h-4 px-1.5 border-zinc-700 text-zinc-500 capitalize"
            >
              {TYPE_LABELS[moment.type] ?? moment.type}
            </Badge>
          )}
        </div>

        {/* Flag reason — shown when flagged */}
        {flagged && flagReason && (
          <div className="mb-2 text-[10px] text-amber-500/80 leading-relaxed line-clamp-2 bg-amber-500/5 border border-amber-500/15 rounded-lg px-2 py-1.5">
            {flagReason}
          </div>
        )}

        {/* Icon + Label */}
        <div className="flex items-start gap-2">
          <span className="text-base mt-0.5 shrink-0">{TYPE_ICONS[moment.type] ?? '◆'}</span>
          <div>
            <h3 className="text-white font-semibold text-sm leading-tight mb-1">
              {moment.label}
            </h3>
            <p className="text-zinc-500 text-xs leading-relaxed line-clamp-2">
              {moment.description}
            </p>
          </div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!bg-zinc-600 !border-zinc-500 !w-2 !h-2"
      />
    </div>
  );
}
