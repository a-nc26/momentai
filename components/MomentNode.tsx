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
  hasSubflow?: boolean;
  subflowCount?: number;
  branchCount?: number;
  active?: boolean;
  buildStatus?: 'idle' | 'building' | 'done' | 'error';
};

export default function MomentNode({ data, selected }: NodeProps) {
  const { moment, color, journeyName, flagged, flagReason, hasSubflow, subflowCount, branchCount, active, buildStatus } = data as MomentNodeData;

  const isActive = active && !selected;

  return (
    <div
      className="w-[220px] rounded-xl bg-zinc-900 shadow-2xl transition-all duration-200 cursor-pointer select-none"
      style={{
        borderLeft: `3px solid ${flagged ? '#f59e0b' : color}`,
        outline: flagged
          ? '2px solid #f59e0b'
          : selected
          ? `2px solid ${color}`
          : isActive
          ? `2px solid ${color}`
          : '2px solid transparent',
        outlineOffset: '3px',
        boxShadow: flagged
          ? '0 0 0 4px rgba(245,158,11,0.2), 0 0 32px rgba(245,158,11,0.3)'
          : selected
          ? `0 0 0 4px ${color}55, 0 0 40px ${color}60, 0 0 80px ${color}25`
          : isActive
          ? `0 0 0 3px ${color}40, 0 0 24px ${color}30`
          : undefined,
        transform: selected ? 'scale(1.03)' : undefined,
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-zinc-600 !border-zinc-500 !w-2 !h-2"
      />

      <div className="p-4">
        {/* Journey label + status */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: flagged ? '#f59e0b' : color }}>
            {journeyName}
          </span>
          {buildStatus === 'building' ? (
            <span className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded text-indigo-400 bg-indigo-400/10">
              <span className="w-2.5 h-2.5 rounded-full border border-indigo-400/40 border-t-indigo-400 animate-spin" />
              Building
            </span>
          ) : buildStatus === 'done' ? (
            <span className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded text-emerald-400 bg-emerald-400/10">
              ✓ Built
            </span>
          ) : buildStatus === 'error' ? (
            <span className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded text-red-400 bg-red-400/10">
              Error
            </span>
          ) : flagged ? (
            <span
              className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded"
              style={{ color: '#f59e0b', background: 'rgba(245,158,11,0.12)' }}
            >
              Review
            </span>
          ) : isActive ? (
            <span
              className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded animate-pulse"
              style={{ color: '#fff', background: color }}
            >
              ● Active
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

        {/* Flag reason */}
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
            {hasSubflow && (
              <div className="mt-2 inline-flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-950/80 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-zinc-400">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
                {subflowCount} internal step{subflowCount === 1 ? '' : 's'}
              </div>
            )}
            {(branchCount ?? 0) > 0 && (
              <div className="mt-2 inline-flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-950/80 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-zinc-400">
                <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                  <path d="M5 1v4M2 8l3-3 3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {branchCount} branch{branchCount === 1 ? '' : 'es'} · click
              </div>
            )}
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
